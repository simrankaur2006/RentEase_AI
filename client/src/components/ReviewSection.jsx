import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { reviewApi } from '../services/endpoints';
import { formatDate } from '../utils/format';
import { EmptyState, Spinner } from './ui';

/** Review list plus the "write a review" form on the property details page. */
export default function ReviewSection({ propertyId, reviews, onChange }) {
  const { profile, isSignedIn } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const alreadyReviewed = reviews.some((r) => String(r.user?._id) === String(profile?._id));

  const submit = async (event) => {
    event.preventDefault();
    if (!comment.trim()) {
      toast.error('Add a short comment so other tenants know what to expect');
      return;
    }
    setSubmitting(true);
    try {
      await reviewApi.create({ propertyId, rating, comment });
      toast.success('Review submitted');
      setComment('');
      setRating(5);
      onChange();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    try {
      await reviewApi.remove(id);
      toast.success('Review deleted');
      onChange();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="card p-6">
      <h2 className="text-xl font-bold text-ink-900">Reviews from tenants</h2>

      {isSignedIn && !alreadyReviewed && (
        <form onSubmit={submit} className="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <span className="label">Your rating</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Rate ${value} out of 5`}
                onClick={() => setRating(value)}
              >
                <Star className={`h-6 w-6 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
          <label className="label mt-4" htmlFor="review-comment">Your experience</label>
          <textarea
            id="review-comment"
            className="input min-h-[96px]"
            placeholder="How was the room, food, water supply and the owner's response time?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
          />
          <button type="submit" className="btn-primary mt-3" disabled={submitting}>
            {submitting && <Spinner className="h-4 w-4 text-white" />}
            Post review
          </button>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Be the first tenant to share what living here is actually like."
          />
        ) : (
          reviews.map((review) => (
            <article key={review._id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={review.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'User')}`}
                    alt={review.user?.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{review.user?.name || 'RentEase user'}</p>
                    <p className="text-xs text-ink-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-amber-50 text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {review.rating}
                  </span>
                  {(String(review.user?._id) === String(profile?._id) || profile?.role === 'admin') && (
                    <button
                      type="button"
                      onClick={() => remove(review._id)}
                      className="rounded-lg p-1.5 text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {review.comment && <p className="mt-3 text-sm leading-relaxed text-ink-700">{review.comment}</p>}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
