import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, CalendarDays, CheckCircle2, Clock, FileDown, KeyRound, LayoutGrid, LogOut, Menu, Network, UserPlus, UserRound, Users, X, XCircle } from 'lucide-react';
import { logout, refreshMe } from '../store/slices/authSlice';
import api from '../services/api';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { Avatar } from '../components/ui';

const adminNav = [
  { label: 'Workspace', items: [
    { to: '/app', icon: LayoutGrid, label: 'Overview', end: true },
    { to: '/app/employees', icon: Users, label: 'Employees' },
    { to: '/app/departments', icon: Network, label: 'Departments' },
  ]},
  { label: 'People operations', items: [
    { to: '/app/attendance', icon: Clock, label: 'Attendance' },
    { to: '/app/leaves', icon: CalendarDays, label: 'Leave requests' },
    { to: '/app/reports', icon: FileDown, label: 'Reports' },
  ]},
  { label: 'Administration', items: [
    { to: '/app/users', icon: KeyRound, label: 'Users & roles' },
  ]},
];

const memberNav = [
  { label: 'My workspace', items: [
    { to: '/app', icon: LayoutGrid, label: 'My day', end: true },
    { to: '/app/attendance', icon: Clock, label: 'My attendance' },
    { to: '/app/leaves', icon: CalendarDays, label: 'My leave' },
  ]},
  { label: 'Company', items: [
    { to: '/app/employees', icon: Users, label: 'Team directory' },
    { to: '/app/departments', icon: Network, label: 'Departments' },
  ]},
];
export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [memberUpdates, setMemberUpdates] = useState([]);
  const notifRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { dispatch(refreshMe()); }, [dispatch]);
  useEffect(() => { setMobileOpen(false); setNotifOpen(false); }, [location.pathname]);

  useEffect(() => {
    const close = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!user?.role) return;

    const load = async () => {
      try {
        if (user.role === 'admin') {
          const [usersRes, leavesRes] = await Promise.all([
            api.get('/users'),
            api.get('/people-ops/leaves'),
          ]);
          const uList = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.users || [];
          setPendingUsers(uList.filter((u) => u.role !== 'admin' && !u.employee));

          const lList = Array.isArray(leavesRes.data) ? leavesRes.data : leavesRes.data?.leaves || [];
          setPendingLeaves(lList.filter((l) => l.status === 'Pending'));
        } else {
          const leavesRes = await api.get('/people-ops/leaves');
          const lList = Array.isArray(leavesRes.data) ? leavesRes.data : leavesRes.data?.leaves || [];
          const seen = JSON.parse(localStorage.getItem('seen_leaves') || '[]');
          setMemberUpdates(lList.filter((l) => l.status !== 'Pending' && !seen.includes(`${l._id}_${l.status}`)));
        }
      } catch {}
    };

    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [user?.role, location.pathname]);

  const markMemberSeen = (leave) => {
    const seen = JSON.parse(localStorage.getItem('seen_leaves') || '[]');
    const key = `${leave._id}_${leave.status}`;
    if (!seen.includes(key)) localStorage.setItem('seen_leaves', JSON.stringify([...seen, key]));
    setMemberUpdates((prev) => prev.filter((item) => item._id !== leave._id));
    setNotifOpen(false);
    navigate('/app/leaves');
  };

  const signOut = () => { dispatch(logout()); navigate('/', { replace: true }); };

  if (!user?.role) return <div className="grid min-h-screen place-items-center text-sm text-muted" role="status">Loading your workspace…</div>;
  const isAdmin = user.role === 'admin';
  const groups = isAdmin ? adminNav : memberNav;
  const all = groups.flatMap((g) => g.items);
  const current = [...all].reverse().find((i) => (i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)));
  const totalNotifs = isAdmin ? pendingUsers.length + pendingLeaves.length : memberUpdates.length;
  return (
    <div className="min-h-screen">
      {mobileOpen && <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-side px-4 py-6 text-side-fg transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <Logo to="/app" light />
          <button className="rounded-lg p-1.5 text-side-fg/70 hover:bg-side-fg/10 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <nav className="mt-9 flex-1 space-y-7 overflow-y-auto" aria-label="Workspace">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-xs font-medium text-side-fg/45">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(({ to, icon: Icon, label, end }) => (
                  <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-side-fg/12 text-side-fg shadow-[inset_3px_0_0_rgb(var(--pollen))]' : 'text-side-fg/65 hover:bg-side-fg/8 hover:text-side-fg'}`}>
                    <Icon size={18} />{label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-6 space-y-3 border-t border-side-fg/10 pt-5">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={user.name} size="h-9 w-9 text-xs" />
            <div className="min-w-0"><strong className="block truncate text-sm">{user.name}</strong><span className="block truncate text-xs text-side-fg/55">{user.email}</span></div>
          </div>
          <button onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-xl border border-side-fg/20 px-4 py-2.5 text-sm font-semibold text-side-fg transition-colors hover:bg-side-fg/10"><LogOut size={16} />Log out</button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost !p-2.5 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
            <span className="font-display text-lg">{current?.label || 'Workspace'}</span>
            <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex ${isAdmin ? 'bg-pollen text-[#2a1f05]' : 'bg-tint text-brand'}`}>{isAdmin ? 'Admin' : 'Member'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden items-center gap-2 px-3 text-sm text-muted md:inline-flex"><UserRound size={15} />{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <ThemeToggle />

            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="btn btn-ghost relative !p-2.5" aria-label="Notifications">
                <Bell size={18} />
                {totalNotifs > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pollen px-1 text-[10px] font-bold text-[#241a04]">
                    {totalNotifs}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-bg shadow-xl">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <span className="text-sm font-semibold">Notifications</span>
                    <span className="rounded-full bg-tint px-2 py-0.5 text-xs font-medium text-brand">{totalNotifs} new</span>
                  </div>

                  <div className="max-h-80 divide-y divide-line overflow-y-auto">
                    {totalNotifs === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-muted">No new notifications.</p>
                    ) : isAdmin ? (
                      <>
                        {pendingLeaves.map((l) => (
                          <button key={l._id} onClick={() => { setNotifOpen(false); navigate('/app/leaves'); }} className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-tint/50">
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pollen/25 text-[#241a04]"><CalendarDays size={15} /></span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{l.employee?.fullName || 'Employee'} requested leave</p>
                              <p className="truncate text-xs text-muted">{l.leaveType} leave • {l.reason}</p>
                              <p className="mt-1 text-[11px] font-medium text-brand">Click to approve or decline</p>
                            </div>
                          </button>
                        ))}
                        {pendingUsers.map((u) => (
                          <button key={u._id} onClick={() => { setNotifOpen(false); navigate('/app/users'); }} className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-tint/50">
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tint text-brand"><UserPlus size={15} /></span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{u.name} signed up</p>
                              <p className="truncate text-xs text-muted">{u.email}</p>
                              <p className="mt-1 text-[11px] font-medium text-brand">Click to link employee profile</p>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      memberUpdates.map((l) => {
                        const isApproved = l.status === 'Approved';
                        return (
                          <button key={l._id} onClick={() => markMemberSeen(l)} className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-tint/50">
                            <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${isApproved ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'}`}>
                              {isApproved ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">Leave request {l.status}</p>
                              <p className="truncate text-xs text-muted">{l.leaveType} leave • {l.reason}</p>
                              <p className="mt-1 text-[11px] font-medium text-brand">Click to view details</p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={signOut} aria-label="Log out" className="btn btn-soft"><LogOut size={16} /><span className="hidden sm:inline">Log out</span></button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8"><Outlet /></main>
        <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 pb-8 text-sm text-muted sm:px-8"><span>© {new Date().getFullYear()} WorkSphere HR</span><span>People first, progress always.</span></footer>
      </div>
    </div>
  );
}
