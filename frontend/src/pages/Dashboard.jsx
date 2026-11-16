import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CalendarClock, LogIn, LogOut as LogOutIcon, Plus, UserPlus } from 'lucide-react';
import api from '../services/api';
import { Alert, Avatar, EmptyState, PageHeader, StatusPill, fmtDate, fmtTime } from '../components/ui';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

function AdminDashboard({ name }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/people-ops/dashboard').then(({ data }) => setStats(data)).catch((err) => setError(err.response?.data?.message || 'Could not load dashboard data.')); }, []);
  const max = Math.max(1, ...(stats?.attendanceByStatus || []).map((item) => item.count));
  const numbers = [
    { label: 'People', value: stats?.totalEmployees },
    { label: 'Departments', value: stats?.totalDepartments },
    { label: 'Attendance logged today', value: stats?.attendanceToday },
    { label: 'Leave awaiting review', value: stats?.pendingLeaves, link: '/app/leaves' },
  ];
  return <>
    <PageHeader title={`${greeting()}, ${name.split(' ')[0]}.`} subtitle="Here is where the organisation stands right now.">
      <Link className="btn btn-primary" to="/app/employees/new"><Plus size={18} />Add employee</Link>
    </PageHeader>
    <Alert>{error}</Alert>
    <section className="card grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
      {numbers.map((n) => (
        <div key={n.label} className="p-6">
          <span className="text-sm text-muted">{n.label}</span>
          <strong className="mt-2 block font-display text-5xl font-normal">{n.value ?? '–'}</strong>
          {n.link && <Link to={n.link} className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">Review requests</Link>}
        </div>
      ))}
    </section>
    <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <article className="card p-6">
        <div className="flex items-center justify-between"><h2 className="text-2xl">Newest teammates</h2><Link to="/app/employees" className="text-sm font-semibold text-brand hover:underline">Open directory</Link></div>
        {stats?.recentEmployees?.length ? <ul className="mt-4 divide-y divide-line">{stats.recentEmployees.map((p, i) => (
          <li key={p._id} className="flex items-center gap-4 py-3.5"><Avatar name={p.fullName} index={i} /><div className="min-w-0 flex-1"><strong className="block truncate">{p.fullName}</strong><span className="text-sm text-muted">{p.designation}</span></div><span className="pill">{p.department}</span></li>))}</ul>
          : <EmptyState icon={UserPlus} title="No employees yet"><Link to="/app/employees/new" className="font-semibold text-brand hover:underline">Add the first employee</Link> to start the directory.</EmptyState>}
      </article>
      <article className="card p-6">
        <h2 className="text-2xl">Attendance this month</h2>
        {stats?.attendanceByStatus?.length ? <div className="mt-5 space-y-4">{stats.attendanceByStatus.map((item) => (
          <div key={item._id}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{item._id}</span><strong>{item.count}</strong></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-tint"><div className={`h-full rounded-full ${item._id === 'Present' ? 'bg-fern' : item._id === 'Late' ? 'bg-pollen' : 'bg-danger'}`} style={{ width: `${(item.count / max) * 100}%` }} /></div></div>))}</div>
          : <EmptyState icon={CalendarClock} title="No attendance yet">Records appear here as soon as people check in.</EmptyState>}
        <Link to="/app/attendance" className="mt-5 inline-block text-sm font-semibold text-brand hover:underline">Manage attendance</Link>
      </article>
    </section>
  </>;
}

function MemberDashboard({ name }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const tzOffset = new Date().getTimezoneOffset();
  const load = () => api.get('/people-ops/my-dashboard', { params: { tzOffset } }).then(({ data: d }) => setData(d)).catch((err) => setError(err.response?.data?.message || 'Could not load your day.'));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  const act = async (path) => { setBusy(true); setError(''); try { await api.post(`/people-ops/attendance/${path}`, { tzOffset }); await load(); } catch (err) { setError(err.response?.data?.message || 'That did not work. Try again.'); } finally { setBusy(false); } };

  if (data && !data.linked) return <>
    <PageHeader title={`${greeting()}, ${name.split(' ')[0]}.`} />
    <section className="card"><EmptyState icon={UserPlus} title="Your account is not linked to an employee profile yet">An admin needs to link it before you can check in or request leave. Ask them to match your account email to your employee record.</EmptyState></section>
  </>;

  const today = data?.today;
  const count = (list, key) => list?.find((x) => x._id === key)?.count || 0;
  const state = !today ? 'in' : !today.checkOut ? 'out' : 'done';
  return <>
    <PageHeader title={`${greeting()}, ${name.split(' ')[0]}.`} subtitle="Your day at a glance." />
    <Alert>{error}</Alert>
    <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <article className="relative overflow-hidden rounded-panel bg-brand p-7 text-brand-fg sm:p-9">
        <span className="text-sm text-brand-fg/70">Today, {fmtDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        <h2 className="mt-2 text-3xl sm:text-4xl">{state === 'in' ? 'You have not checked in yet.' : state === 'out' ? `You checked in at ${fmtTime(today.checkIn)}.` : 'You are done for today.'}</h2>
        {state === 'done' && <p className="mt-2 text-brand-fg/75">In at {fmtTime(today.checkIn)}, out at {fmtTime(today.checkOut)}.</p>}
        {today && <div className="mt-3"><StatusPill status={today.status} /></div>}
        <div className="mt-7">
          {state === 'in' && <button className="btn btn-pollen !px-6 !py-3" disabled={busy || !data} onClick={() => act('check-in')}><LogIn size={18} />{busy ? 'Checking in…' : 'Check in'}</button>}
          {state === 'out' && <button className="btn btn-pollen !px-6 !py-3" disabled={busy} onClick={() => act('check-out')}><LogOutIcon size={18} />{busy ? 'Checking out…' : 'Check out'}</button>}
        </div>
      </article>
      <article className="card p-6">
        <h2 className="text-2xl">My profile</h2>
        {data?.profile && <dl className="mt-4 space-y-3 text-sm">
          {[['Name', data.profile.fullName], ['Department', data.profile.department], ['Role', data.profile.designation], ['Joined', fmtDate(data.profile.joiningDate)]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
        </dl>}
      </article>
    </section>
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="card p-6">
        <h2 className="text-2xl">This month</h2>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {['Present', 'Late', 'Absent'].map((s) => <div key={s} className="rounded-xl bg-tint py-4"><strong className="block font-display text-3xl font-normal">{count(data?.attendanceByStatus, s)}</strong><span className="text-sm text-muted">{s}</span></div>)}
        </div>
        <Link to="/app/attendance" className="mt-5 inline-block text-sm font-semibold text-brand hover:underline">See full history</Link>
      </article>
      <article className="card p-6">
        <h2 className="text-2xl">My leave</h2>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {['Pending', 'Approved', 'Rejected'].map((s) => <div key={s} className="rounded-xl bg-tint py-4"><strong className="block font-display text-3xl font-normal">{count(data?.leaveCounts, s)}</strong><span className="text-sm text-muted">{s}</span></div>)}
        </div>
        {data?.upcomingLeaves?.length > 0 && <p className="mt-4 text-sm text-muted">Next approved leave: <strong className="text-ink">{fmtDate(data.upcomingLeaves[0].startDate)} to {fmtDate(data.upcomingLeaves[0].endDate)}</strong></p>}
        <Link to="/app/leaves" className="mt-5 inline-block text-sm font-semibold text-brand hover:underline">Request or review leave</Link>
      </article>
    </section>
  </>;
}

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  return <div className="space-y-8">{user.role === 'admin' ? <AdminDashboard name={user.name} /> : <MemberDashboard name={user.name} />}</div>;
}
