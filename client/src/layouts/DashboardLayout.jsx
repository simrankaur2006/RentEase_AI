import { NavLink, Outlet } from 'react-router-dom';
import {
  Building2, Heart, LayoutDashboard, MessageSquare, PlusCircle, Sparkles, Star, User, Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const TENANT_LINKS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/favourites', label: 'Saved places', icon: Heart },
  { to: '/inquiries', label: 'My inquiries', icon: MessageSquare },
  { to: '/profile', label: 'Profile & preferences', icon: User }
];

const OWNER_LINKS = [
  { to: '/owner', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/owner/properties', label: 'My listings', icon: Building2 },
  { to: '/owner/properties/new', label: 'Add a listing', icon: PlusCircle },
  { to: '/owner/inquiries', label: 'Inquiries', icon: MessageSquare },
  { to: '/owner/reviews', label: 'Reviews', icon: Star },
  { to: '/profile', label: 'Profile', icon: User }
];

const ADMIN_LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/properties', label: 'Listings', icon: Building2 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/profile', label: 'Profile', icon: User }
];

/** Sidebar shell shared by the tenant, owner and admin dashboards. */
export default function DashboardLayout({ variant = 'tenant' }) {
  const { profile } = useApp();
  const links = variant === 'admin' ? ADMIN_LINKS : variant === 'owner' ? OWNER_LINKS : TENANT_LINKS;

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">
          {variant === 'admin' ? 'Admin console' : variant === 'owner' ? 'Owner workspace' : 'Your dashboard'}
        </h1>
        <p className="text-sm text-ink-500">
          Signed in as {profile?.name || 'RentEase user'} - {profile?.role || 'tenant'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="card h-fit p-3 lg:sticky lg:top-24">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {links.map(({ to, label, icon: Icon, end }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-slate-100 hover:text-ink-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
