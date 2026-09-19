import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { favouriteApi } from '../services/endpoints';
import { useApp } from '../context/AppContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PropertyCard from '../components/PropertyCard';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/ui';

export default function Favourites() {
  useDocumentTitle('Saved places');
  const { favouriteIds } = useApp();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await favouriteApi.list();
      setProperties(data.properties);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Drop cards immediately when a heart is un-toggled elsewhere on the page.
  const visible = properties.filter((p) => favouriteIds.includes(String(p._id)));

  return (
    <div className="container-page py-8 pb-24">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Saved places</h1>
      <p className="mt-1 text-sm text-ink-500">Everything you hearted, ready to compare side by side.</p>

      <div className="mt-8">
        {loading ? (
          <SkeletonGrid count={3} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Tap the heart on any listing and it will wait for you here."
            action={<Link to="/properties" className="btn-primary">Browse listings</Link>}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
