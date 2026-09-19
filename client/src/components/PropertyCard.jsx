import { Link } from 'react-router-dom';
import { BadgeCheck, Bed, Heart, MapPin, Scale, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FALLBACK_IMAGE } from '../utils/constants';
import { formatRent, truncate } from '../utils/format';
import { Rating } from './ui';

/** Reusable listing card used on discovery, favourites, dashboards and recommendations. */
export default function PropertyCard({ property, showCompare = true, footer }) {
  const { favouriteIds, toggleFavourite, compareIds, toggleCompare } = useApp();
  if (!property) return null;

  const isSaved = favouriteIds.includes(String(property._id));
  const isComparing = compareIds.includes(String(property._id));
  const image = property.images?.[0] || FALLBACK_IMAGE;

  return (
    <article className="card group flex flex-col overflow-hidden transition hover:border-brand-200">
      <div className="relative">
        <Link to={`/property/${property._id}`}>
          <img
            src={image}
            alt={property.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-48 w-full object-cover"
          />
        </Link>

        {property.status === 'approved' && (
          <span className="badge absolute left-3 top-3 bg-white/95 text-emerald-700 shadow-sm">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        )}

        <button
          type="button"
          aria-label={isSaved ? 'Remove from favourites' : 'Save to favourites'}
          onClick={() => toggleFavourite(String(property._id))}
          className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-ink-500 shadow-sm transition hover:text-rose-600"
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/property/${property._id}`} className="text-base font-semibold leading-snug text-ink-900 hover:text-brand-700">
            {truncate(property.title, 58)}
          </Link>
          <Rating value={property.rating} count={property.reviewCount} />
        </div>

        <p className="flex items-center gap-1.5 text-sm text-ink-500">
          <MapPin className="h-4 w-4 shrink-0" />
          {property.locality}, {property.city}
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="badge bg-brand-50 text-brand-700">{property.propertyType}</span>
          <span className="badge bg-slate-100 text-ink-700">
            <Bed className="h-3.5 w-3.5" /> {property.roomType}
          </span>
          {property.foodAvailable && (
            <span className="badge bg-emerald-50 text-emerald-700">
              <UtensilsCrossed className="h-3.5 w-3.5" /> Meals
            </span>
          )}
        </div>

        {property.amenities?.length > 0 && (
          <p className="text-xs text-ink-500">
            {property.amenities.slice(0, 4).join(' - ')}
            {property.amenities.length > 4 && ` +${property.amenities.length - 4} more`}
          </p>
        )}

        {footer}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p className="text-lg font-bold text-ink-900">
            {formatRent(property.rent)}
            <span className="text-sm font-medium text-ink-500">/month</span>
          </p>
          <div className="flex items-center gap-2">
            {showCompare && (
              <button
                type="button"
                onClick={() => toggleCompare(String(property._id))}
                title="Add to comparison"
                className={`rounded-xl border p-2.5 transition ${
                  isComparing
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-ink-500 hover:border-brand-300 hover:text-brand-700'
                }`}
              >
                <Scale className="h-4 w-4" />
              </button>
            )}
            <Link to={`/property/${property._id}`} className="btn-primary">
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
