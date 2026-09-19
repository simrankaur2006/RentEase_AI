import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Check, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/endpoints';
import { FALLBACK_IMAGE } from '../../utils/constants';
import { formatDate, formatRent } from '../../utils/format';
import useDebounce from '../../hooks/useDebounce';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { ConfirmDialog, EmptyState, ErrorState, PageLoader, StatusBadge } from '../../components/ui';

const TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

export default function AdminProperties() {
  useDocumentTitle('Moderate listings');
  const [properties, setProperties] = useState([]);
  const [tab, setTab] = useState('pending');
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
      if (tab) params.status = tab;
      if (debouncedSearch) params.search = debouncedSearch;
      const data = await adminApi.properties(params);
      setProperties(data.properties);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      const payload = { status };
      if (status === 'rejected') {
        const reason = window.prompt('Why is this listing being rejected?', 'Photos do not match the address provided');
        if (reason === null) return;
        payload.rejectionReason = reason;
      }
      await adminApi.updateStatus(id, payload);
      toast.success(`Listing ${status}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.removeProperty(target._id);
      toast.success('Listing deleted');
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
          {TABS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setTab(item.value)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === item.value ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-ink-500 hover:border-brand-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search listings" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading listings" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : properties.length === 0 ? (
        <EmptyState icon={Building2} title="Nothing in this queue" description="New submissions will appear here for review." />
      ) : (
        properties.map((property) => (
          <article key={property._id} className="card flex flex-col gap-4 p-4 sm:flex-row">
            <img
              src={property.images?.[0] || FALLBACK_IMAGE}
              alt={property.title}
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
              className="h-28 w-full rounded-xl object-cover sm:w-40"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <Link to={`/property/${property._id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                  {property.title}
                </Link>
                <StatusBadge status={property.status} />
              </div>
              <p className="text-sm text-ink-500">
                {property.locality}, {property.city} - {formatRent(property.rent)}/month
              </p>
              <p className="mt-1 text-xs text-ink-500">
                Owner: {property.owner?.name} ({property.owner?.email}) - submitted {formatDate(property.createdAt)}
              </p>
              {property.rejectionReason && (
                <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{property.rejectionReason}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {property.status !== 'approved' && (
                  <button type="button" className="btn-secondary text-emerald-700" onClick={() => setStatus(property._id, 'approved')}>
                    <Check className="h-4 w-4" /> Approve
                  </button>
                )}
                {property.status !== 'rejected' && (
                  <button type="button" className="btn-secondary text-amber-700" onClick={() => setStatus(property._id, 'rejected')}>
                    <X className="h-4 w-4" /> Reject
                  </button>
                )}
                <button type="button" className="btn-secondary text-rose-600" onClick={() => setTarget(property)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </article>
        ))
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this listing?"
        description={`"${target?.title}" and everything attached to it will be removed permanently.`}
        confirmLabel="Delete listing"
        busy={deleting}
        onCancel={() => setTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
