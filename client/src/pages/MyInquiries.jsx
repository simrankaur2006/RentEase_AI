import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { inquiryApi } from '../services/endpoints';
import { formatRent, statusStyle, timeAgo } from '../utils/format';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { EmptyState, ErrorState, PageLoader } from '../components/ui';

export default function MyInquiries() {
  useDocumentTitle('My inquiries');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inquiryApi.mine();
      setInquiries(data.inquiries);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader label="Loading your inquiries" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Inquiries you have sent</h2>
      {inquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No inquiries yet"
          description="Open a listing and use the contact form to reach the owner."
          action={<Link to="/properties" className="btn-primary">Find a place</Link>}
        />
      ) : (
        inquiries.map((inquiry) => (
          <article key={inquiry._id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link to={`/property/${inquiry.property?._id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                  {inquiry.property?.title || 'Listing removed'}
                </Link>
                <p className="text-sm text-ink-500">
                  {inquiry.property?.city} - {inquiry.property ? formatRent(inquiry.property.rent) : '-'}/month
                </p>
              </div>
              <span className={`badge capitalize ${statusStyle(inquiry.status)}`}>{inquiry.status}</span>
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-ink-700">{inquiry.message}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-500">
              <span>Sent {timeAgo(inquiry.createdAt)}</span>
              {inquiry.owner?.name && <span>Owner: {inquiry.owner.name}</span>}
              {inquiry.status !== 'pending' && inquiry.owner?.phone && <span>Call: {inquiry.owner.phone}</span>}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
