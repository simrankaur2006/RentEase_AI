import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyApi } from '../../services/endpoints';
import { FALLBACK_IMAGE } from '../../utils/constants';
import { formatRent } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { ConfirmDialog, EmptyState, ErrorState, PageLoader, Rating, StatusBadge } from '../../components/ui';

export default function OwnerProperties() {
  useDocumentTitle('My listings');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await propertyApi.mine();
      setProperties(data.properties);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await propertyApi.remove(target._id);
      toast.success('Listing deleted');
      setTarget(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader label="Loading your listings" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink-900">My listings ({properties.length})</h2>
        <Link to="/owner/properties/new" className="btn-primary">Add a listing</Link>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No listings yet"
          description="Publish your first room or PG and tenants can start sending inquiries."
          action={<Link to="/owner/properties/new" className="btn-primary">Create a listing</Link>}
        />
      ) : (
        properties.map((property) => (
          <article key={property._id} className="card flex flex-col gap-4 p-4 sm:flex-row">
            <img
              src={property.images?.[0] || FALLBACK_IMAGE}
              alt={property.title}
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
              className="h-32 w-full rounded-xl object-cover sm:w-48"
            />
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <Link to={`/property/${property._id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                  {property.title}
                </Link>
                <StatusBadge status={property.status} />
              </div>
              <p className="text-sm text-ink-500">{property.locality}, {property.city}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-ink-700">
                <span className="font-semibold">{formatRent(property.rent)}/month</span>
                <Rating value={property.rating} count={property.reviewCount} />
                <span className="text-ink-500">{property.propertyType} - {property.roomType}</span>
              </div>
              {property.status === 'rejected' && property.rejectionReason && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  Rejected: {property.rejectionReason}
                </p>
              )}
              <div className="mt-auto flex gap-2 pt-2">
                <Link to={`/owner/properties/${property._id}/edit`} className="btn-secondary">
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
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
        description={`"${target?.title}" and its reviews, inquiries and saves will be removed. This cannot be undone.`}
        confirmLabel="Delete listing"
        busy={deleting}
        onCancel={() => setTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
