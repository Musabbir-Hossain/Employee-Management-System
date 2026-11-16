import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CalendarCheck, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Alert, EmptyState, Loading, PageHeader, StatusPill, fmtDate, fmtTime } from '../components/ui';

const today = () => new Date().toISOString().slice(0, 10);
const nowLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export default function Attendance() {
  const isAdmin = useSelector((state) => state.auth.user?.role) === 'admin';
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ employee: '', date: today(), checkIn: nowLocal(), checkOut: '', status: 'Present', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Members only need their own records; the API scopes the list to them.
  const load = async () => { setLoading(true); try { const [emp, attendance] = await Promise.all([isAdmin ? api.get('/employees', { params: { page: 1, limit: 100 } }) : Promise.resolve({ data: { employees: [] } }), api.get('/people-ops/attendance')]); setEmployees(emp.data.employees || []); setRecords(attendance.data || []); } catch (err) { setError(err.response?.data?.message || 'Unable to load attendance.'); } finally { setLoading(false); } };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (!form.employee && employees.length) setForm((old) => ({ ...old, employee: employees[0]._id })); }, [employees, form.employee]);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => { e.preventDefault(); setError(''); setSaving(true); try { await api.post('/people-ops/attendance', { ...form, checkIn: form.checkIn || null, checkOut: form.checkOut || null }); setForm((old) => ({ ...old, notes: '', checkOut: '' })); await load(); } catch (err) { setError(err.response?.data?.message || 'Could not save attendance.'); } finally { setSaving(false); } };
  const remove = async (id) => { if (!window.confirm('Delete this attendance record?')) return; try { await api.delete(`/people-ops/attendance/${id}`); setRecords((items) => items.filter((item) => item._id !== id)); } catch (err) { setError(err.response?.data?.message || 'Could not delete record.'); } };

  return <div className="space-y-8">
    <PageHeader title={isAdmin ? 'Attendance' : 'My attendance'} subtitle={isAdmin ? 'Keep a clear record of daily team attendance.' : 'Your recent check-ins and check-outs.'}>
      <span className="pill">{records.length} records</span>
      {!isAdmin && <Link to="/app" className="btn btn-primary">Check in from My day</Link>}
    </PageHeader>
    <Alert>{error}</Alert>
    <div className={`grid items-start gap-6 ${isAdmin ? 'lg:grid-cols-[minmax(0,380px)_1fr]' : ''}`}>
      {isAdmin && <section className="card p-6">
        <h2 className="text-2xl">Record attendance</h2>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div><label className="label" htmlFor="employee">Employee</label><select id="employee" className="field" name="employee" value={form.employee} onChange={update} required><option value="">Select employee</option>{employees.map((e) => <option key={e._id} value={e._id}>{e.fullName}</option>)}</select></div>
          <div><label className="label" htmlFor="date">Date</label><input id="date" className="field" type="date" name="date" value={form.date} onChange={update} required /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="label" htmlFor="checkIn">Check in</label><input id="checkIn" className="field" type="datetime-local" name="checkIn" value={form.checkIn} onChange={update} /></div><div><label className="label" htmlFor="checkOut">Check out</label><input id="checkOut" className="field" type="datetime-local" name="checkOut" value={form.checkOut} onChange={update} /></div></div>
          <div><label className="label" htmlFor="status">Status</label><select id="status" className="field" name="status" value={form.status} onChange={update}><option>Present</option><option>Late</option><option>Absent</option></select></div>
          <div><label className="label" htmlFor="notes">Notes <span className="font-normal text-muted">(optional)</span></label><textarea id="notes" className="field" name="notes" value={form.notes} onChange={update} rows="3" placeholder="Add a short note" /></div>
          <button className="btn btn-primary w-full" disabled={saving || !employees.length}>{saving ? 'Saving…' : 'Save attendance'}</button>
        </form>
      </section>}
      <section className="card overflow-hidden">
        <div className="border-b border-line px-6 py-5"><h2 className="text-2xl">{isAdmin ? 'Attendance records' : 'History'}</h2></div>
        {loading ? <Loading>Loading records…</Loading> : records.length ? <ul className="divide-y divide-line">{records.map((record) => (
          <li key={record._id} className="flex flex-wrap items-center gap-4 px-6 py-4">
            <div className="w-14 shrink-0 rounded-xl bg-tint py-2 text-center"><strong className="block font-display text-xl font-normal leading-none">{fmtDate(record.date, { day: '2-digit', timeZone: 'UTC' })}</strong><span className="text-xs text-muted">{fmtDate(record.date, { month: 'short', timeZone: 'UTC' })}</span></div>
            <div className="min-w-0 flex-1">{isAdmin && <strong className="block truncate">{record.employee?.fullName || 'Employee'}</strong>}<span className="text-sm text-muted">{isAdmin && `${record.employee?.department || ''}  `}{record.checkIn ? `In ${fmtTime(record.checkIn)}` : 'No check-in'}{record.checkOut ? `, out ${fmtTime(record.checkOut)}` : ''}</span></div>
            <StatusPill status={record.status} />
            {isAdmin && <button className="btn btn-ghost !p-2" onClick={() => remove(record._id)} aria-label="Delete record" title="Delete record"><Trash2 size={16} /></button>}
          </li>))}</ul>
          : <EmptyState icon={CalendarCheck} title="No attendance records yet">{isAdmin ? 'Saved entries will appear here.' : 'Check in from My day and it will show up here.'}</EmptyState>}
      </section>
    </div>
  </div>;
}
