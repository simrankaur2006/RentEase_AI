import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, X } from 'lucide-react';
import { propertyApi } from '../services/endpoints';
import { useApp } from '../context/AppContext';
import { FALLBACK_IMAGE } from '../utils/constants';
import { formatDate, formatRent } from '../utils/format';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { EmptyState, PageLoader, Rating } from '../components/ui';

const ROWS = [
  { label: 'Monthly rent', render: (p) => <span className="font-semibold text-ink-900">{formatRent(p.rent)}</span> },
  { label: 'Security deposit', render: (p) => formatRent(p.securityDeposit) },
  { label: 'Location', render: (p) => `${p.locality}, ${p.city}` },
  { label: 'Property type', render: (p) => p.propertyType },
  { label: 'Room type', render: (p) => p.roomType },
  { label: 'Furnishing', render: (p) => p.furnishing },
  { label: 'Meals', render: (p) => (p.foodAvailable ? 'Included' : 'Not included') },
  { label: 'Open to', render: (p) => p.genderPreference },
  { label: 'Available from', render: (p) => formatDate(p.availableFrom) },
  { label: 'Rating', render: (p) => <Rating value={p.rating} count={p.reviewCount} /> },
  {
    label: 'Amenities',
    render: (p) => (
      <div className="flex flex-wrap gap-1.5">
        {p.amenities?.length ? p.amenities.map((a) => (
          <span key={a} className="badge bg-slate-100 text-ink-700">{a}</span>
        )) : <span className="text-ink-500">Not listed</span>}
      </div>
    )
  }
];

export default function Compare() {
  useDocumentTitle('Compare properties');
  const { compareIds, toggleCompare, clearCompare } = useApp();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          compareIds.map((id) => propertyApi.details(id).then((d) => d.property).catch(() => null))
        );
        setProperties(results.filter(Boolean));
      } finally {
        setLoading(false);
      }
    };
    if (compareIds.length) load();
    else {
      setProperties([]);
      setLoading(false);
    }
  }, [compareIds]);

  if (loading) return <PageLoader label="Loading your shortlist" />;

  return (
    <div className="container-page py-8 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Compare properties</h1>
          <p className="mt-1 text-sm text-ink-500">Up to three places, lined up on the things that decide it.</p>
        </div>
        {properties.length > 0 && (
          <button type="button" className="btn-secondary" onClick={clearCompare}>Clear all</button>
        )}
      </div>

      <div className="mt-8">
        {properties.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="Nothing to compare yet"
            description="Use the compare button on a listing card to build a shortlist of up to three places."
            action={<Link to="/properties" className="btn-primary">Find listings</Link>}
          />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="w-40 px-5 py-4 align-top text-xs font-semibold text-ink-500">Property</th>
                  {properties.map((property) => (
                    <th key={property._id} className="px-5 py-4 align-top">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => toggleCompare(String(property._id))}
                          className="absolute right-0 top-0 rounded-lg p-1 text-ink-500 hover:bg-slate-100"
                          aria-label="Remove from comparison"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <img
                          src={property.images?.[0] || FALLBACK_IMAGE}
                          alt={property.title}
                          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                          className="h-28 w-full rounded-xl object-cover"
                        />
                        <Link to={`/property/${property._id}`} className="mt-3 block text-sm font-semibold text-ink-900 hover:text-brand-700">
                          {property.title}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ROWS.map((row) => (
                  <tr key={row.label}>
                    <td className="px-5 py-4 align-top text-xs font-semibold text-ink-500">{row.label}</td>
                    {properties.map((property) => (
                      <td key={property._id} className="px-5 py-4 align-top text-ink-700">{row.render(property)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-5 py-4" />
                  {properties.map((property) => (
                    <td key={property._id} className="px-5 py-4">
                      <Link to={`/property/${property._id}`} className="btn-primary w-full">View details</Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
