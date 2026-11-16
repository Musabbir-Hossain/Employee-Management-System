import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import GrowthRings from './GrowthRings';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <section className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="btn btn-ghost !px-3"><ArrowLeft size={16} />Home</Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <Logo className="mb-10" />
          <h1 className="text-4xl">{title}</h1>
          <p className="mb-8 mt-2 text-muted">{subtitle}</p>
          <div className="space-y-4">{children}</div>
          <p className="mt-8 text-sm text-muted">{footer}</p>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-side lg:block" aria-hidden="true">
        <div className="absolute inset-0 grid place-items-center text-side-fg">
          <GrowthRings className="h-[135%] w-[135%] max-w-none opacity-80 [&_.text-brand]:text-side-fg" />
        </div>
        <p className="absolute bottom-10 left-10 max-w-xs font-display text-2xl text-side-fg">People first, progress always.</p>
      </aside>
    </div>
  );
}
