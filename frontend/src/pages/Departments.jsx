import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { Alert, Avatar, EmptyState, Loading, PageHeader } from '../components/ui';
import { Network } from 'lucide-react';

export default function Departments() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/employees', { params: { page: 1, limit: 100, sortBy: 'department', order: 'asc' } }).then(({ data }) => setEmployees(data.employees || [])).catch((err) => setError(err.response?.data?.message || 'Unable to load departments.')).finally(() => setLoading(false)); }, []);
  const departments = useMemo(() => Object.entries(employees.reduce((acc, employee) => { const key = employee.department || 'Unassigned'; acc[key] = [...(acc[key] || []), employee]; return acc; }, {})).sort(([a], [b]) => a.localeCompare(b)), [employees]);
  return <div className="space-y-8">
    <PageHeader title="Departments" subtitle="How your people are spread across teams."><span className="pill">{departments.length} teams</span></PageHeader>
    <Alert>{error}</Alert>
    {loading ? <Loading>Loading departments…</Loading> : departments.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{departments.map(([name, people], index) => (
      <article className="card p-6" key={name}>
        <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-tint font-display text-xl text-brand">{name.slice(0, 1).toUpperCase()}</span><span className="text-sm text-muted">{people.length} {people.length === 1 ? 'person' : 'people'}</span></div>
        <h2 className="mt-5 text-2xl">{name}</h2>
        <p className="mt-1 truncate text-sm text-muted">{[...new Set(people.map((p) => p.designation).filter(Boolean))].slice(0, 3).join(', ') || 'No designations yet'}</p>
        <div className="mt-5 flex -space-x-2">{people.slice(0, 5).map((person, i) => <span key={person._id} title={person.fullName} className="rounded-full ring-2 ring-surface"><Avatar name={person.fullName} index={i + index} size="h-9 w-9 text-xs" /></span>)}{people.length > 5 && <span className="grid h-9 w-9 place-items-center rounded-full bg-line text-xs font-bold ring-2 ring-surface">+{people.length - 5}</span>}</div>
      </article>))}</div>
      : <div className="card"><EmptyState icon={Network} title="No departments yet">Departments appear automatically once employees are added.</EmptyState></div>}
  </div>;
}
