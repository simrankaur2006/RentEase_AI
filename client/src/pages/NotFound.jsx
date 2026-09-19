import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="rounded-2xl bg-brand-50 p-3 text-brand-600"><Compass className="h-7 w-7" /></span>
      <h1 className="mt-4 text-2xl font-bold text-ink-900">That page does not exist</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">The link may be old, or the listing was removed.</p>
      <Link to="/" className="btn-primary mt-6">Go home</Link>
    </div>
  );
}
