import { Link } from 'react-router-dom';
import { Scale, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MAX_COMPARE } from '../utils/constants';

/** Floating bar that appears once a tenant starts building a comparison. */
export default function CompareBar() {
  const { compareIds, clearCompare } = useApp();
  if (compareIds.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="container-page flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <Scale className="h-4 w-4 text-brand-600" />
          {compareIds.length} of {MAX_COMPARE} selected for comparison
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={clearCompare} className="btn-ghost">
            <X className="h-4 w-4" /> Clear
          </button>
          <Link to="/compare" className="btn-primary">
            Compare now
          </Link>
        </div>
      </div>
    </div>
  );
}
