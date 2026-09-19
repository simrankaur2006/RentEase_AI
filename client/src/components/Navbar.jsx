import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Heart, Home, Menu, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'text-brand-700' : 'text-ink-500 hover:text-ink-900'
  }`;

export default function Navbar() {
  const { role } = useApp();
  const [open, setOpen] = useState(false);

  const dashboardPath = role === 'admin' ? '/admin' : role === 'owner' ? '/owner' : '/dashboard';
  const dashboardLabel = role === 'admin' ? 'Admin dashboard' : role === 'owner' ? 'Owner dashboard' : 'Dashboard';

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" onClick={close}>
          <span className="rounded-xl bg-brand-600 p-1.5 text-white">
            <Home className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">RentEase AI</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/properties" className={linkClass}>Properties</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
          <SignedIn>
            <NavLink to={dashboardPath} className={linkClass}>{dashboardLabel}</NavLink>
            <NavLink to="/favourites" className={linkClass}>Favourites</NavLink>
            <NavLink to="/recommendations" className={linkClass}>Recommendations</NavLink>
          </SignedIn>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <SignedOut>
            <Link to="/login" className="btn-secondary">Log in</Link>
            <Link to="/register" className="btn-primary">Create account</Link>
          </SignedOut>
          <SignedIn>
            <Link to="/favourites" className="rounded-lg p-2 text-ink-500 hover:bg-slate-100 hover:text-rose-600" aria-label="Favourites">
              <Heart className="h-5 w-5" />
            </Link>
            <Link to="/recommendations" className="rounded-lg p-2 text-ink-500 hover:bg-slate-100 hover:text-brand-700" aria-label="Recommendations">
              <Sparkles className="h-5 w-5" />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-ink-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={linkClass} onClick={close} end>Home</NavLink>
            <NavLink to="/properties" className={linkClass} onClick={close}>Properties</NavLink>
            <NavLink to="/about" className={linkClass} onClick={close}>About</NavLink>
            <SignedIn>
              <NavLink to={dashboardPath} className={linkClass} onClick={close}>{dashboardLabel}</NavLink>
              <NavLink to="/favourites" className={linkClass} onClick={close}>Favourites</NavLink>
              <NavLink to="/recommendations" className={linkClass} onClick={close}>Recommendations</NavLink>
              <NavLink to="/profile" className={linkClass} onClick={close}>Profile</NavLink>
              <div className="px-3 py-2"><UserButton afterSignOutUrl="/" /></div>
            </SignedIn>
            <SignedOut>
              <Link to="/login" className="btn-secondary mt-2" onClick={close}>Log in</Link>
              <Link to="/register" className="btn-primary mt-2" onClick={close}>Create account</Link>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
}
