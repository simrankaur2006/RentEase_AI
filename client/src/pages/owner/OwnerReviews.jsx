import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { reviewApi } from '../../services/endpoints';
import { formatDate } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui';

export default function OwnerReviews() {
  useDocumentTitle('Reviews');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reviewApi.owner();
      setReviews(data.reviews);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader label="Loading reviews" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Reviews across your listings</h2>
      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Tenants can review a listing once it is approved and live." />
      ) : (
        reviews.map((review) => (
          <article key={review._id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link to={`/property/${review.property?._id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                {review.property?.title}
              </Link>
              <span className="badge bg-amber-50 text-amber-700">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {review.rating}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-700">{review.comment}</p>
            <p className="mt-2 text-xs text-ink-500">{review.user?.name} - {formatDate(review.createdAt)}</p>
          </article>
        ))
      )}
    </div>
  );
}
