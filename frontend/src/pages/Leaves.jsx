import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CalendarDays, Check, Trash2, X } from 'lucide-react';
import api from '../services/api';
import { Alert, EmptyState, PageHeader, StatusPill, fmtDate } from '../components/ui';

export default function Leaves() {
  const isAdmin = useSelector((state) => state.auth.user?.role) === 'admin';
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ employee: '', leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
  const [status, setStatus] = useState('All');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = async () => { try { const [emp, list] = await Promise.all([isAdmin ? api.get('/employees', { params: { page: 1, limit: 100 } }) : Promise.resolve({ data: { employees: [] } }), api.get('/people-ops/leaves')]); setEmployees(emp.data.employees || []); setLeaves(list.data || []); } catch (err) { setError(err.response?.data?.message || 'Unable to load leave requests.'); } };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (isAdmin && !form.employee && employees.length) setForm((old) => ({ ...old, employee: employees[0]._id })); }, [employees, form.employee, isAdmin]);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => { e.preventDefault(); setError(''); setSaving(true); try { const { employee, ...rest } = form; await api.post('/people-ops/leaves', isAdmin ? form : rest); setForm((old) => ({ ...old, startDate: '', endDate: '', reason: '' })); await load(); } catch (err) { setError(err.response?.data?.message || 'Could not submit leave request.'); } finally { setSaving(false); } };
  const review = async (id, nextStatus) => { try { const { data } = await api.patch(`/people-ops/leaves/${id}/review`, { status: nextStatus }); setLeaves((items) => items.map((item) => item._id === id ? data : item)); } catch (err) { setError(err.response?.data?.message || 'Could not update request.'); } };
  const remove = async (id) => { if (!window.confirm(isAdmin ? 'Delete this leave request?' : 'Withdraw this leave request?')) return; try { await api.delete(`/people-ops/leaves/${id}`); setLeaves((items) => items.filter((item) => item._id !== id)); } catch (err) { setError(err.response?.data?.message || 'Could not remove request.'); } };
  const visible = status === 'All' ? leaves : leaves.filter((item) => item.status === status);
  const days = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000) + 1);
  const pending = leaves.filter((l) => l.status === 'Pending').length;

  return <div className="space-y-8">
    <PageHeader title={isAdmin ? 'Leave requests' : 'My leave'} subtitle={isAdmin ? 'Review time-off requests and keep decisions in one place.' : 'Ask for time off and track where each request stands.'}>
      <span className="pill">{pending} {isAdmin ? 'awaiting review' : 'pending'}</span>
    </PageHeader>
    <Alert>{error}</Alert>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      <section className="card p-6">
        <h2 className="text-2xl">New leave request</h2>
        <form onSubmit={submit} className="mt-5 space-y-4">
          {isAdmin && <div><label className="label" htmlFor="employee">Employee</label><select id="employee" className="field" name="employee" value={form.employee} onChange={update} required><option value="">Select employee</option>{employees.map((e) => <option key={e._id} value={e._id}>{e.fullName}</option>)}</select></div>}
          <div><label className="label" htmlFor="leaveType">Leave type</label><select id="leaveType" className="field" name="leaveType" value={form.leaveType} onChange={update}><option>Annual</option><option>Sick</option><option>Personal</option><option>Emergency</option></select></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="label" htmlFor="startDate">Start date</label><input id="startDate" className="field" type="date" name="startDate" value={form.startDate} onChange={update} required /></div><div><label className="label" htmlFor="endDate">End date</label><input id="endDate" className="field" type="date" name="endDate" value={form.endDate} onChange={update} min={form.startDate || undefined} required /></div></div>
          <div><label className="label" htmlFor="reason">Reason</label><textarea id="reason" className="field" name="reason" value={form.reason} onChange={update} rows="4" placeholder="Briefly describe the reason" required maxLength={600} /></div>
          <button className="btn btn-primary w-full" disabled={saving || (isAdmin && !employees.length)}>{saving ? 'Submitting…' : 'Submit request'}</button>
        </form>
      </section>
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5"><h2 className="text-2xl">{isAdmin ? 'All requests' : 'My requests'}</h2><select className="field !w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status"><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
        {visible.length ? <ul className="divide-y divide-line">{visible.map((leave) => (
          <li key={leave._id} className="space-y-3 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div>{isAdmin && <strong className="block">{leave.employee?.fullName || 'Employee'}</strong>}<span className={isAdmin ? 'text-sm text-muted' : 'font-semibold'}>{isAdmin && `${leave.employee?.department || ''}  `}{leave.leaveType} leave</span></div><StatusPill status={leave.status} /></div>
            <p className="text-sm"><span className="font-medium">{fmtDate(leave.startDate)} to {fmtDate(leave.endDate)}</span> <span className="text-muted">({days(leave.startDate, leave.endDate)} {days(leave.startDate, leave.endDate) === 1 ? 'day' : 'days'})</span></p>
            <p className="text-sm text-muted">{leave.reason}</p>
            <div className="flex flex-wrap gap-2">
              {isAdmin && leave.status === 'Pending' && <><button className="btn btn-primary !px-3.5 !py-1.5" onClick={() => review(leave._id, 'Approved')}><Check size={15} />Approve</button><button className="btn btn-danger !px-3.5 !py-1.5" onClick={() => review(leave._id, 'Rejected')}><X size={15} />Decline</button></>}
              {(isAdmin || leave.status === 'Pending') && <button className="btn btn-ghost !px-3 !py-1.5" onClick={() => remove(leave._id)}><Trash2 size={15} />{isAdmin ? 'Delete' : 'Withdraw'}</button>}
            </div>
          </li>))}</ul>
          : <EmptyState icon={CalendarDays} title="No requests in this view">{isAdmin ? 'New leave requests will appear here for review.' : 'Use the form to ask for time off.'}</EmptyState>}
      </section>
    </div>
  </div>;
}
