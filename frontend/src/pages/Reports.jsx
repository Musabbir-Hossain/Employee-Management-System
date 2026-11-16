import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, Download, Info, Users } from 'lucide-react';
import api from '../services/api';
import { Alert, PageHeader } from '../components/ui';

function downloadCsv(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [keys.map(escape).join(','), ...rows.map((row) => keys.map((key) => escape(row[key])).join(','))].join('\n');
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}
export default function Reports() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { Promise.all([api.get('/employees', { params: { page: 1, limit: 100 } }), api.get('/people-ops/attendance'), api.get('/people-ops/leaves')]).then(([e, a, l]) => { setEmployees(e.data.employees || []); setAttendance(a.data || []); setLeaves(l.data || []); }).catch((err) => setError(err.response?.data?.message || 'Unable to prepare reports.')); }, []);
  const reports = [
    { title: 'Employee directory', detail: 'Contact, department and role details.', count: employees.length, icon: Users, action: () => downloadCsv(employees.map(({ fullName, email, mobileNumber, department, designation, joiningDate }) => ({ fullName, email, mobileNumber, department, designation, joiningDate: joiningDate ? new Date(joiningDate).toLocaleDateString() : '' })), 'worksphere-employee-directory.csv') },
    { title: 'Attendance register', detail: 'Daily status with check-in and check-out times.', count: attendance.length, icon: Clock, action: () => downloadCsv(attendance.map((r) => ({ employee: r.employee?.fullName, department: r.employee?.department, date: new Date(r.date).toLocaleDateString(), checkIn: r.checkIn ? new Date(r.checkIn).toLocaleString() : '', checkOut: r.checkOut ? new Date(r.checkOut).toLocaleString() : '', status: r.status, notes: r.notes })), 'worksphere-attendance.csv') },
    { title: 'Leave register', detail: 'Leave periods, categories and approval status.', count: leaves.length, icon: CalendarDays, action: () => downloadCsv(leaves.map((r) => ({ employee: r.employee?.fullName, department: r.employee?.department, leaveType: r.leaveType, startDate: new Date(r.startDate).toLocaleDateString(), endDate: new Date(r.endDate).toLocaleDateString(), status: r.status, reason: r.reason })), 'worksphere-leave-register.csv') },
  ];
  return <div className="space-y-8">
    <PageHeader title="Reports" subtitle="Export clean records for analysis and sharing." />
    <Alert>{error}</Alert>
    <div className="grid gap-5 md:grid-cols-3">{reports.map(({ title, detail, count, icon: Icon, action }) => (
      <article className="card flex flex-col p-6" key={title}>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-tint text-brand"><Icon size={20} /></span>
        <h2 className="mt-5 text-2xl">{title}</h2>
        <p className="mt-1 flex-1 text-sm text-muted">{detail}</p>
        <p className="mt-5 text-sm text-muted"><strong className="font-display text-3xl font-normal text-ink">{count}</strong> records ready</p>
        <button className="btn btn-soft mt-4" onClick={action} disabled={!count}><Download size={16} />Export CSV</button>
      </article>))}</div>
    <p className="flex items-start gap-2.5 text-sm text-muted"><Info size={16} className="mt-0.5 shrink-0" />Employee exports include the first 100 records in this version, and attendance and leave exports include the latest 200.</p>
  </div>;
}
