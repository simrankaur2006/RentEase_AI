import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="rounded-2xl bg-amber-50 p-3 text-amber-600"><ShieldAlert className="h-7 w-7" /></span>
      <h1 className="mt-4 text-2xl font-bold text-ink-900">This area is not open to your role</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        Owner and admin tools are restricted. Switch to an account with the right role, or head back to browsing.
      </p>
      <Link to="/properties" className="btn-primary mt-6">Browse properties</Link>
    </div>
  );
}
