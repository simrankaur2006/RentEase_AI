import { AlertTriangle, Inbox, Loader2, Star } from 'lucide-react';
import { statusStyle } from '../../utils/format';

export function Spinner({ className = 'h-6 w-6' }) {
  return <Loader2 className={`animate-spin text-brand-600 ${className}`} />;
}

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-500">
      <Spinner className="h-8 w-8" />
      <p className="text-sm">{label}...</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="h-48 w-full bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
        <div className="h-9 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="rounded-2xl bg-brand-50 p-3 text-brand-600">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description && <p className="max-w-md text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="rounded-2xl bg-rose-50 p-3 text-rose-600">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-semibold text-ink-900">That did not load</h3>
      <p className="max-w-md text-sm text-ink-500">{message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge capitalize ${statusStyle(status)}`}>{status}</span>;
}

export function Rating({ value = 0, count, size = 'text-sm' }) {
  return (
    <span className={`inline-flex items-center gap-1 font-semibold text-ink-700 ${size}`}>
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      {value ? value.toFixed(1) : 'New'}
      {count !== undefined && count > 0 && <span className="font-normal text-ink-500">({count})</span>}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, tone = 'brand', hint }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    slate: 'bg-slate-100 text-slate-600'
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      {Icon && (
        <span className={`rounded-xl p-2.5 ${tones[tone] || tones.brand}`}>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div>
        <p className="text-sm text-ink-500">{label}</p>
        <p className="text-2xl font-bold text-ink-900">{value}</p>
        {hint && <p className="text-xs text-ink-500">{hint}</p>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, busy }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-sm text-ink-500">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
            Keep it
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={busy}>
            {busy && <Spinner className="h-4 w-4 text-white" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
