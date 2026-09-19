import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { Building2, CheckCircle2, Clock, MessageSquare, Star, XCircle } from 'lucide-react';
import { propertyApi } from '../../services/endpoints';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { ErrorState, PageLoader, StatCard } from '../../components/ui';

const STATUS_COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export default function OwnerDashboard() {
  useDocumentTitle('Owner dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await propertyApi.ownerStats());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader label="Loading your listings" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const { stats, statusChart, inquiryChart } = data;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Building2} label="Total properties" value={stats.totalProperties} />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} tone="emerald" />
        <StatCard icon={Clock} label="Pending approval" value={stats.pending} tone="amber" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} tone="rose" />
        <StatCard icon={MessageSquare} label="Total inquiries" value={stats.totalInquiries} tone="brand" hint={`${stats.pendingInquiries} waiting on you`} />
        <StatCard icon={Star} label="Average rating" value={stats.averageRating || '-'} tone="amber" hint={`${stats.reviewCount} reviews`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-ink-900">Listing status</h2>
          {stats.totalProperties === 0 ? (
            <p className="mt-6 text-sm text-ink-500">Add your first listing to see the breakdown.</p>
          ) : (
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChart} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {statusChart.map((entry, index) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <ul className="mt-2 flex flex-wrap gap-4 text-sm text-ink-500">
            {statusChart.map((entry, index) => (
              <li key={entry.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[index % STATUS_COLORS.length] }} />
                {entry.name}: {entry.value}
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-ink-900">Inquiries per listing</h2>
          {inquiryChart.length === 0 ? (
            <p className="mt-6 text-sm text-ink-500">No inquiries yet.</p>
          ) : (
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inquiryChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="inquiries" fill="#2447e0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <div className="card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-ink-900">Ready to add another place?</p>
          <p className="text-sm text-ink-500">New listings go live once an admin approves them.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/owner/properties" className="btn-secondary">Manage listings</Link>
          <Link to="/owner/properties/new" className="btn-primary">Add a listing</Link>
        </div>
      </div>
    </div>
  );
}
