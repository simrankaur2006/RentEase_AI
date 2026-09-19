import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { recommendationApi } from '../services/endpoints';
import { matchScoreStyle } from '../utils/format';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PropertyCard from '../components/PropertyCard';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/ui';

export default function Recommendations() {
  useDocumentTitle('Smart recommendations');
  const [items, setItems] = useState([]);
  const [needsPreferences, setNeedsPreferences] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await recommendationApi.list();
      setItems(data.recommendations || []);
      setNeedsPreferences(Boolean(data.needsPreferences));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="container-page py-8 pb-24">
      <span className="badge bg-brand-50 text-brand-700"><Sparkles className="h-3.5 w-3.5" /> AI-Powered Smart Recommendations</span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Matched to your preferences</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">
        Every approved listing is scored out of 100 against your saved budget, location, room type, amenities and
        meal preference. The reasons under each score show exactly what matched.
      </p>

      <div className="mt-8">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : needsPreferences ? (
          <EmptyState
            icon={Sparkles}
            title="Set your preferences first"
            description="Tell us your city, budget and must-haves and we will rank every listing against them."
            action={<Link to="/onboarding" className="btn-primary">Set preferences</Link>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No listings to score yet"
            description="Once owners publish listings in your city, your ranked shortlist will appear here."
            action={<Link to="/properties" className="btn-primary">Browse everything</Link>}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map(({ property, matchScore, reasons }) => (
              <PropertyCard
                key={property._id}
                property={property}
                footer={
                  <div className={`rounded-xl border p-3 ${matchScoreStyle(matchScore)}`}>
                    <p className="text-sm font-bold">{matchScore}% match</p>
                    <ul className="mt-2 space-y-1">
                      {reasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-1.5 text-xs">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
