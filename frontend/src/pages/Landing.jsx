import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, CalendarCheck, Check, FileDown, LogOut, ShieldCheck, Users, Clock } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import GrowthRings from '../components/GrowthRings';
import { logout } from '../store/slices/authSlice';
import adminImg from '../assets/admin.png';

const adminCan = [
  'Manage entire team directory',
  'Track & edit daily attendance',
  'Approve or reject time-off requests',
  'Export instant CSV reports',
  'Control user roles & employee profiles',
];

const memberCan = [
  'One-tap daily check-in and check-out',
  'Request or cancel pending leaves',
  'Track personal attendance history',
  'Browse team directory safely',
];

const modules = [
  { icon: Users, name: 'Directory', text: 'Searchable team list sorted by role and join date.' },
  { icon: Clock, name: 'Attendance', text: 'Automated daily check-ins with smart late tracking.' },
  { icon: CalendarCheck, name: 'Time off', text: 'Fast leave requests with real-time status updates.' },
  { icon: FileDown, name: 'Reports', text: 'One-click CSV exports for payroll and audits.' },
  { icon: ShieldCheck, name: 'Access', text: 'Server-enforced roles keeping sensitive data private.' },
];

export default function Landing() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const signOut = () => { dispatch(logout()); navigate('/', { replace: true }); };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden h-5 w-[1px] bg-line sm:inline-block" aria-hidden="true" />
          <span className="hidden rounded-full bg-tint px-3 py-1 text-xs font-semibold text-brand sm:inline-flex">
            Employee Management System
          </span>
        </div>

        <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Main">
          <a href="#roles" onClick={(e) => scrollToSection(e, 'roles')} className="btn btn-ghost hidden sm:inline-flex">Roles</a>
          <a href="#inside" onClick={(e) => scrollToSection(e, 'inside')} className="btn btn-ghost hidden sm:inline-flex">What's inside</a>
          <ThemeToggle />
          {user ? (
            <>
              <button onClick={signOut} className="btn btn-soft"><LogOut size={16} />Log out</button>
              <Link to="/app" className="btn btn-primary">Open workspace</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-soft">Sign in</Link>
              <Link to="/register" className="btn btn-primary hidden sm:inline-flex">Create account</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-10">
          <div>
            <div className="mb-7 flex items-center gap-5">
              <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-3xl border-2 border-brand/25 bg-tint shadow-lg sm:h-40 sm:w-40">
                <img
                  src={adminImg}
                  alt="Musabbir Hossain"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">
                  Musabbir Hossain
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Founder & Workspace Administrator
                </p>
              </div>
            </div>

            <h1 className="max-w-lg text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Grow your team, one ring at a time.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
              People, attendance, and time off in one calm space. Full control for admins, crystal-clear clarity for everyone else.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {user
                ? <Link to="/app" className="btn btn-primary !px-6 !py-3 text-base">Open workspace <ArrowRight size={18} /></Link>
                : <><Link to="/login" className="btn btn-primary !px-6 !py-3 text-base">Sign in <ArrowRight size={18} /></Link>
                    <Link to="/register" className="btn btn-soft !px-6 !py-3 text-base">Create an account</Link></>}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] lg:-mr-10">
            <GrowthRings people className="h-auto w-full" />
          </div>
        </section>

        <section id="roles" className="scroll-mt-6 bg-side py-20 text-side-fg">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="max-w-2xl text-4xl sm:text-5xl">One workspace, two doors.</h2>
            <p className="mt-4 max-w-xl text-side-fg/70">Smart access control verified by the server on every single click.</p>
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="rounded-panel bg-pollen p-8 text-[#241a04] sm:p-10">
                <div className="flex items-center gap-3"><ShieldCheck size={22} /><h3 className="text-2xl">Admin</h3></div>
                <p className="mt-2 font-medium">Complete workspace control.</p>
                <ul className="mt-7 space-y-3.5">
                  {adminCan.map((item) => <li key={item} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0" /><span>{item}</span></li>)}
                </ul>
              </article>
              <article className="rounded-panel border border-side-fg/20 p-8 sm:p-10">
                <div className="flex items-center gap-3"><Users size={22} /><h3 className="text-2xl">Member</h3></div>
                <p className="mt-2 font-medium text-side-fg/75">Built for everyday teamwork.</p>
                <ul className="mt-7 space-y-3.5">
                  {memberCan.map((item) => <li key={item} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-pollen" /><span className="text-side-fg/90">{item}</span></li>)}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="inside" className="mx-auto grid max-w-6xl scroll-mt-6 gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:py-28">
          <div>
            <h2 className="text-4xl sm:text-5xl">What's inside.</h2>
            <p className="mt-4 max-w-sm text-muted">Five essential HR tools. Zero setup required.</p>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {modules.map(({ icon: Icon, name, text }) => (
              <li key={name} className="flex items-start gap-5 py-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-tint text-brand"><Icon size={20} /></span>
                <div><h3 className="text-xl">{name}</h3><p className="mt-1 text-muted">{text}</p></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-panel bg-brand p-8 text-brand-fg sm:p-12">
            <h2 className="max-w-md text-3xl sm:text-4xl">Ready to organize your team?</h2>
            <div className="flex flex-wrap gap-3">
              <Link to={user ? '/app' : '/login'} className="btn btn-pollen !px-6 !py-3">{user ? 'Open workspace' : 'Sign in'}</Link>
              {!user && <Link to="/register" className="btn !px-6 !py-3 border border-brand-fg/40 text-brand-fg hover:bg-brand-fg/10">Create an account</Link>}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted sm:px-8">
          <Logo className="scale-90 origin-left" />
          <span>© {new Date().getFullYear()} WorkSphere — Employee Management System. Built for modern teams.</span>
        </div>
      </footer>
    </div>
  );
}
