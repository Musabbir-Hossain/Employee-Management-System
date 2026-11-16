import React from 'react';
import { AlertCircle, Inbox } from 'lucide-react';

export const initials = (name = '') => name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();

const tones = ['bg-tint text-brand', 'bg-pollen/25 text-ink', 'bg-fern/20 text-ink', 'bg-danger/15 text-ink', 'bg-line text-ink'];
export function Avatar({ name, index = 0, size = 'h-10 w-10 text-sm' }) {
  return <span className={`inline-grid shrink-0 place-items-center rounded-full font-bold ${size} ${tones[index % tones.length]}`}>{initials(name)}</span>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-xl">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

export function Alert({ children, tone = 'error' }) {
  if (!children) return null;
  const style = tone === 'error' ? 'border-danger/30 bg-danger/10 text-danger' : 'border-brand/30 bg-tint text-brand';
  return <div role="alert" className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${style}`}><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{children}</span></div>;
}

export function EmptyState({ icon: Icon = Inbox, title, children }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-tint text-brand"><Icon size={22} /></span>
      <strong className="mt-1 text-base">{title}</strong>
      {children && <div className="max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Loading({ children = 'Loading…' }) {
  return <div className="card px-6 py-10 text-center text-sm text-muted" role="status">{children}</div>;
}

const statusTone = {
  Present: 'bg-fern/20 text-ink', Approved: 'bg-fern/20 text-ink',
  Late: 'bg-pollen/30 text-ink', Pending: 'bg-pollen/30 text-ink',
  Absent: 'bg-danger/15 text-danger', Rejected: 'bg-danger/15 text-danger',
};
export function StatusPill({ status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[status] || 'bg-tint text-brand'}`}>{status}</span>;
}

export const fmtDate = (value, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => (value ? new Date(value).toLocaleDateString('en-US', opts) : '');
export const fmtTime = (value) => (value ? new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—');
