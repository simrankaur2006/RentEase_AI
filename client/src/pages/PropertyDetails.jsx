import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BadgeCheck, CalendarDays, Heart, IndianRupee, Mail, MapPin, Phone, Scale, Send, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { inquiryApi, propertyApi } from '../services/endpoints';
import { useApp } from '../context/AppContext';
import { FALLBACK_IMAGE } from '../utils/constants';
import { formatDate, formatRent } from '../utils/format';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PropertyCard from '../components/PropertyCard';
import ReviewSection from '../components/ReviewSection';
import { ErrorState, PageLoader, Rating, SectionHeading, Spinner, StatusBadge } from '../components/ui';

export default function PropertyDetails() {
  const { id } = useParams();
  const { favouriteIds, toggleFavourite, toggleCompare, compareIds, isSignedIn, profile } = useApp();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useDocumentTitle(property?.title);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await propertyApi.details(id);
      setProperty(data.property);
      setReviews(data.reviews || []);
      const similarData = await propertyApi.similar(id);
      setSimilar(similarData.properties);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    window.scrollTo({ top: 0 });
  }, [load]);

  const refreshReviews = async () => {
    const data = await propertyApi.details(id);
    setProperty(data.property);
    setReviews(data.reviews || []);
  };

  const sendInquiry = async (event) => {
    event.preventDefault();
    if (!isSignedIn) {
      toast.error('Sign in to contact the owner');
      return;
    }
    if (message.trim().length < 10) {
      toast.error('Write at least a line so the owner knows what you need');
      return;
    }
    setSending(true);
    try {
      await inquiryApi.create({ propertyId: id, message });
      toast.success('Inquiry sent to the owner');
      setMessage('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageLoader label="Loading this place" />;
  if (error) return <div className="container-page py-12"><ErrorState message={error} onRetry={load} /></div>;
  if (!property) return null;

  const images = property.images?.length ? property.images : [FALLBACK_IMAGE];
  const isSaved = favouriteIds.includes(String(property._id));
  const isComparing = compareIds.includes(String(property._id));
  const isOwnListing = String(property.owner?._id) === String(profile?._id);

  const facts = [
    ['Property type', property.propertyType],
    ['Room type', property.roomType],
    ['Furnishing', property.furnishing],
    ['Meals', property.foodAvailable ? 'Included' : 'Not included'],
    ['Open to', property.genderPreference],
    ['Available from', formatDate(property.availableFrom)]
  ];

  return (
    <div className="container-page py-8 pb-24">
      <nav className="mb-4 text-sm text-ink-500">
        <Link to="/properties" className="hover:text-brand-700">Properties</Link>
        <span className="px-2">/</span>
        <span className="text-ink-700">{property.city}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          {/* Gallery */}
          <div>
            <img
              src={images[activeImage]}
              alt={property.title}
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
              className="h-[280px] w-full rounded-2xl object-cover sm:h-[420px]"
            />
            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map((src, index) => (
                  <button key={src + index} type="button" onClick={() => setActiveImage(index)}>
                    <img
                      src={src}
                      alt={`View ${index + 1}`}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      className={`h-20 w-28 shrink-0 rounded-xl object-cover transition ${
                        index === activeImage ? 'ring-2 ring-brand-500' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              {property.status === 'approved' ? (
                <span className="badge bg-emerald-50 text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" /> Verified listing</span>
              ) : (
                <StatusBadge status={property.status} />
              )}
              <Rating value={property.rating} count={property.reviewCount} />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{property.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
              <MapPin className="h-4 w-4" /> {property.address || `${property.locality}, ${property.city}`}
            </p>
          </div>

          <section className="card p-6">
            <h2 className="text-xl font-bold text-ink-900">About this place</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-700">{property.description}</p>

            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {facts.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 p-3">
                  <dt className="text-xs text-ink-500">{label}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>

            {property.amenities?.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-semibold text-ink-900">Amenities</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span key={amenity} className="badge bg-slate-100 text-ink-700">{amenity}</span>
                  ))}
                </div>
              </>
            )}
          </section>

          <ReviewSection propertyId={property._id} reviews={reviews} onChange={refreshReviews} />
        </div>

        {/* Sticky sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <p className="text-3xl font-bold text-ink-900">
              {formatRent(property.rent)}
              <span className="text-base font-medium text-ink-500">/month</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
              <IndianRupee className="h-4 w-4" /> Security deposit {formatRent(property.securityDeposit)}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
              <CalendarDays className="h-4 w-4" /> Available from {formatDate(property.availableFrom)}
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => toggleFavourite(String(property._id))}
                className={`btn-secondary flex-1 ${isSaved ? 'border-rose-200 text-rose-600' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => toggleCompare(String(property._id))}
                className={`btn-secondary flex-1 ${isComparing ? 'border-brand-300 text-brand-700' : ''}`}
              >
                <Scale className="h-4 w-4" /> {isComparing ? 'Added' : 'Compare'}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-semibold text-ink-900">Listed by</h2>
            <div className="mt-4 flex items-center gap-3">
              <img
                src={property.owner?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.owner?.name || 'Owner')}`}
                alt={property.owner?.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-ink-900">{property.owner?.name}</p>
                <p className="text-xs text-ink-500">Member since {formatDate(property.owner?.createdAt)}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-ink-500">
              {property.owner?.email && (
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {property.owner.email}</li>
              )}
              {property.owner?.phone && (
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {property.owner.phone}</li>
              )}
              <li className="flex items-center gap-2"><Users className="h-4 w-4" /> Open to {property.genderPreference} tenants</li>
            </ul>
          </div>

          {!isOwnListing && (
            <form onSubmit={sendInquiry} className="card p-6">
              <h2 className="text-base font-semibold text-ink-900">Ask the owner</h2>
              <p className="mt-1 text-xs text-ink-500">Your name and contact details are shared with this inquiry.</p>
              <textarea
                className="input mt-4 min-h-[120px]"
                placeholder="Hi, is this place available from the 1st? I would like to visit this weekend."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
              />
              <button type="submit" className="btn-primary mt-3 w-full" disabled={sending}>
                {sending ? <Spinner className="h-4 w-4 text-white" /> : <Send className="h-4 w-4" />}
                Send inquiry
              </button>
            </form>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Similar properties" description="Nearby listings at a comparable rent." />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {similar.map((item) => (
              <PropertyCard key={item._id} property={item} showCompare={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
