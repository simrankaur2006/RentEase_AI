import { useCallback, useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { Building2, CheckCircle2, Clock, MessageSquare, Users, XCircle } from 'lucide-react';
import { adminApi } from '../../services/endpoints';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { ErrorState, PageLoader, StatCard } from '../../components/ui';

const PIE_COLORS = ['#2447e0', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

export default function AdminDashboard() {
  useDocumentTitle('Admin dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await adminApi.stats());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader label="Loading platform activity" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const { stats, cityChart, typeChart, statusChart, monthlyChart } = data;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={stats.totalUsers} hint={`${stats.totalTenants} tenants - ${stats.totalOwners} owners`} />
        <StatCard icon={Building2} label="Total properties" value={stats.totalProperties} tone="brand" />
        <StatCard icon={Clock} label="Pending approval" value={stats.pendingListings} tone="amber" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approvedListings} tone="emerald" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejectedListings} tone="rose" />
        <StatCard icon={MessageSquare} label="Total inquiries" value={stats.totalInquiries} tone="brand" />
        <StatCard icon={Users} label="Tenants" value={stats.totalTenants} tone="slate" />
        <StatCard icon={Users} label="Owners" value={stats.totalOwners} tone="slate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-ink-900">Properties by city</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Listings" fill="#2447e0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-ink-900">Property type mix</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeChart} dataKey="value" nameKey="name" outerRadius={90} label>
                  {typeChart.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-ink-900">Listing status</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChart} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {statusChart.map((entry, index) => (
                    <Cell key={entry.name} fill={['#10b981', '#f59e0b', '#f43f5e'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-ink-900">Listings added per month</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="listings" stroke="#2447e0" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
