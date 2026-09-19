import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Check, Clock, Eye, Heart, MessageSquare, Sparkles } from 'lucide-react';
import { userApi } from '../services/endpoints';
import { formatRent, matchScoreStyle, statusStyle, timeAgo } from '../utils/format';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { EmptyState, ErrorState, PageLoader, StatCard } from '../components/ui';

const CHART_COLORS = ['#f59e0b', '#2447e0', '#94a3b8'];

export default function TenantDashboard() {
  useDocumentTitle('Dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await userApi.dashboard());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader label="Building your dashboard" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { stats, inquiryChart, savedProperties, inquiries, recentlyViewed, recommendations, needsPreferences } = data;

  return (
    <div className="space-y-8">
      {needsPreferences && (
        <div className="card flex flex-col items-start gap-3 border-brand-200 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-ink-900">Finish setting your preferences</p>
            <p className="text-sm text-ink-500">Two minutes of answers unlocks the ranked shortlist.</p>
          </div>
          <Link to="/onboarding" className="btn-primary">Set preferences</Link>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Heart} label="Saved places" value={stats.savedCount} tone="rose" />
        <StatCard icon={MessageSquare} label="Inquiries sent" value={stats.inquiryCount} tone="brand" />
        <StatCard icon={Clock} label="Awaiting a reply" value={stats.pendingInquiries} tone="amber" />
        <StatCard
          icon={Check} label="Profile complete" value={`${stats.profileCompletion}%`} tone="emerald"
          hint={stats.profileCompletion < 100 ? 'Add your phone and city to reach 100%' : 'All set'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900">Top recommendations</h2>
            <Link to="/recommendations" className="text-sm font-medium text-brand-600 hover:underline">See all</Link>
          </div>
          {recommendations.length === 0 ? (
            <EmptyState icon={Sparkles} title="No matches yet" description="Set your preferences to get a ranked shortlist." />
          ) : (
            <ul className="space-y-3">
              {recommendations.map(({ property, matchScore, reasons }) => (
                <li key={property._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Link to={`/property/${property._id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                      {property.title}
                    </Link>
                    <p className="text-sm text-ink-500">
                      {property.locality}, {property.city} - {formatRent(property.rent)}/month
                    </p>
                    <p className="mt-1 text-xs text-ink-500">{reasons.slice(0, 2).join(' - ')}</p>
                  </div>
                  <span className={`badge border ${matchScoreStyle(matchScore)}`}>{matchScore}% match</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-ink-900">Inquiry status</h2>
          {stats.inquiryCount === 0 ? (
            <p className="mt-6 text-sm text-ink-500">You have not contacted any owner yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={inquiryChart} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                    {inquiryChart.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <ul className="mt-3 space-y-1.5 text-sm text-ink-500">
            {inquiryChart.map((entry, index) => (
              <li key={entry.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                {entry.name}: {entry.value}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900">Saved places</h2>
            <Link to="/favourites" className="text-sm font-medium text-brand-600 hover:underline">Open</Link>
          </div>
          {savedProperties.length === 0 ? (
            <p className="text-sm text-ink-500">Nothing saved yet.</p>
          ) : (
            <ul className="space-y-3">
              {savedProperties.slice(0, 5).map((property) => (
                <li key={property._id} className="flex items-center justify-between gap-3">
                  <Link to={`/property/${property._id}`} className="text-sm font-medium text-ink-900 hover:text-brand-700">
                    {property.title}
                  </Link>
                  <span className="text-sm text-ink-500">{formatRent(property.rent)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-ink-900">Recently viewed</h2>
          {recentlyViewed.length === 0 ? (
            <p className="text-sm text-ink-500">Listings you open will show up here.</p>
          ) : (
            <ul className="space-y-3">
              {recentlyViewed.map((property) => (
                <li key={property._id} className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-ink-500" />
                  <Link to={`/property/${property._id}`} className="flex-1 text-sm font-medium text-ink-900 hover:text-brand-700">
                    {property.title}
                  </Link>
                  <span className="text-xs text-ink-500">{property.locality}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Recent inquiries</h2>
          <Link to="/inquiries" className="text-sm font-medium text-brand-600 hover:underline">See all</Link>
        </div>
        {inquiries.length === 0 ? (
          <p className="text-sm text-ink-500">No inquiries sent yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {inquiries.map((inquiry) => (
              <li key={inquiry._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link to={`/property/${inquiry.property?._id}`} className="text-sm font-medium text-ink-900 hover:text-brand-700">
                    {inquiry.property?.title || 'Listing removed'}
                  </Link>
                  <p className="text-xs text-ink-500">{timeAgo(inquiry.createdAt)}</p>
                </div>
                <span className={`badge capitalize ${statusStyle(inquiry.status)}`}>{inquiry.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
