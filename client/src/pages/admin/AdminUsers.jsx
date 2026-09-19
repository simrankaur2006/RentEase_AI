import { useCallback, useEffect, useState } from 'react';
import { Search, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/endpoints';
import { formatDate } from '../../utils/format';
import useDebounce from '../../hooks/useDebounce';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { ConfirmDialog, EmptyState, ErrorState, PageLoader } from '../../components/ui';

const ROLE_TABS = [
  { value: '', label: 'All' },
  { value: 'tenant', label: 'Tenants' },
  { value: 'owner', label: 'Owners' },
  { value: 'admin', label: 'Admins' }
];

export default function AdminUsers() {
  useDocumentTitle('Manage users');
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (role) params.role = role;
      if (debouncedSearch) params.search = debouncedSearch;
      const data = await adminApi.users(params);
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [role, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.removeUser(target._id);
      toast.success('User removed from RentEase');
      setTarget(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setRole(tab.value)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                role === tab.value ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-ink-500 hover:border-brand-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading users" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users match" description="Try a different role tab or clear the search." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-ink-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className="badge bg-brand-50 capitalize text-brand-700">{user.role}</span>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{user.city || '-'}</td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      disabled={user.role === 'admin'}
                      onClick={() => setTarget(user)}
                      className="rounded-lg p-2 text-ink-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                      aria-label="Remove user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-ink-500">
        Removing a user deletes their RentEase record, listings, reviews and inquiries. Their Clerk login is not
        deleted - remove it from the Clerk dashboard if you need a full deletion.
      </p>

      <ConfirmDialog
        open={Boolean(target)}
        title="Remove this user?"
        description={`${target?.name}'s listings, reviews and inquiries will be deleted from RentEase.`}
        confirmLabel="Remove user"
        busy={deleting}
        onCancel={() => setTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
