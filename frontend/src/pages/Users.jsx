import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Trash2, UserCog, X } from 'lucide-react';
import api from '../services/api';
import { Alert, Avatar, EmptyState, Loading, PageHeader, fmtDate } from '../components/ui';

const blank = { name: '', email: '', password: '', role: 'user' };

// Admin-only: who can sign in, what role they hold, and which employee profile they are.
export default function Users() {
  const me = useSelector((state) => state.auth.user);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [u, e] = await Promise.all([api.get('/users'), api.get('/employees', { params: { page: 1, limit: 100, sortBy: 'fullName', order: 'asc' } })]);
      setUsers(u.data); setEmployees(e.data.employees || []);
    } catch (err) { setError(err.response?.data?.message || 'Unable to load users.'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (id, body) => { setError(''); try { const { data } = await api.patch(`/users/${id}`, body); setUsers((list) => list.map((u) => (u._id === id ? data : u))); } catch (err) { setError(err.response?.data?.message || 'Could not update user.'); } };
  const remove = async (user) => { if (!window.confirm(`Delete the account for ${user.name}? They will no longer be able to sign in.`)) return; setError(''); try { await api.delete(`/users/${user._id}`); setUsers((list) => list.filter((u) => u._id !== user._id)); } catch (err) { setError(err.response?.data?.message || 'Could not delete user.'); } };
  const create = async (e) => { e.preventDefault(); setError(''); setSaving(true); try { await api.post('/users', form); setForm(blank); setOpen(false); await load(); } catch (err) { setError(err.response?.data?.message || 'Could not create user.'); } finally { setSaving(false); } };
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const admins = users.filter((u) => u.role === 'admin').length;

  return <div className="space-y-8">
    <PageHeader title="Users & roles" subtitle="Admins control everything. Members can only manage their own day.">
      <span className="pill">{admins} {admins === 1 ? 'admin' : 'admins'}, {users.length - admins} {users.length - admins === 1 ? 'member' : 'members'}</span>
      <button className="btn btn-primary" onClick={() => setOpen((v) => !v)}>{open ? <X size={18} /> : <Plus size={18} />}{open ? 'Close' : 'New user'}</button>
    </PageHeader>
    <Alert>{error}</Alert>
    {open && <form onSubmit={create} className="card grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
      <div><label className="label" htmlFor="u-name">Name</label><input id="u-name" className="field" name="name" value={form.name} onChange={set} required /></div>
      <div><label className="label" htmlFor="u-email">Email</label><input id="u-email" className="field" type="email" name="email" value={form.email} onChange={set} required /></div>
      <div><label className="label" htmlFor="u-pass">Temporary password</label><input id="u-pass" className="field" type="password" name="password" value={form.password} onChange={set} minLength={6} required autoComplete="new-password" /></div>
      <div><label className="label" htmlFor="u-role">Role</label><select id="u-role" className="field" name="role" value={form.role} onChange={set}><option value="user">Member</option><option value="admin">Admin</option></select></div>
      <div className="sm:col-span-2 lg:col-span-4"><button className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create user'}</button></div>
    </form>}
    {loading ? <Loading>Loading users…</Loading> : <section className="card overflow-hidden"><div className="overflow-x-auto">
      <table className="w-full min-w-[760px]">
        <thead className="border-b border-line bg-tint/50"><tr><th className="th">Account</th><th className="th">Role</th><th className="th">Employee profile</th><th className="th">Created</th><th className="th text-right">Actions</th></tr></thead>
        <tbody className="divide-y divide-line">{users.length ? users.map((u, i) => { const self = u._id === me._id; return (
          <tr key={u._id} className="hover:bg-tint/40">
            <td className="td"><div className="flex items-center gap-3"><Avatar name={u.name} index={i} /><div className="min-w-0"><strong className="block truncate">{u.name}{self && <span className="ml-2 pill !py-0.5">You</span>}</strong><small className="text-muted">{u.email}</small></div></div></td>
            <td className="td"><select className="field !w-auto !py-1.5" value={u.role} disabled={self} onChange={(e) => patch(u._id, { role: e.target.value })} aria-label={`Role for ${u.name}`}><option value="user">Member</option><option value="admin">Admin</option></select></td>
            <td className="td"><select className="field !w-auto max-w-[220px] !py-1.5" value={u.employee?._id || ''} onChange={(e) => patch(u._id, { employee: e.target.value || null })} aria-label={`Employee profile for ${u.name}`}><option value="">Not linked</option>{employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.fullName}</option>)}</select></td>
            <td className="td text-muted">{fmtDate(u.createdAt)}</td>
            <td className="td text-right"><button className="btn btn-danger !px-3 !py-1.5" disabled={self} onClick={() => remove(u)} title={self ? 'You cannot delete your own account' : undefined}><Trash2 size={14} />Delete</button></td>
          </tr>); }) : <tr><td colSpan="5"><EmptyState icon={UserCog} title="No users yet" /></td></tr>}</tbody>
      </table></div></section>}
  </div>;
}
