import React from 'react';
import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".35" />
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" opacity=".65" />
      <circle cx="16" cy="16" r="4.5" className="fill-pollen" />
    </svg>
  );
}

export default function Logo({ to = '/', className = '', light = false }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 ${light ? 'text-side-fg' : 'text-brand'} ${className}`}>
      <LogoMark />
      <span className={`font-display text-xl leading-none ${light ? 'text-side-fg' : 'text-ink'}`}>WorkSphere</span>
    </Link>
  );
}
