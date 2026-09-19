import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { inquiryApi } from '../../services/endpoints';
import { statusStyle, timeAgo } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui';

const TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' }
];

export default function OwnerInquiries() {
  useDocumentTitle('Tenant inquiries');
  const [inquiries, setInquiries] = useState([]);
  const [tab, setTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inquiryApi.owner(tab ? { status: tab } : {});
      setInquiries(data.inquiries);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, status) => {
    try {
      await inquiryApi.updateStatus(id, status);
      toast.success(`Marked as ${status}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setTab(item.value)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === item.value ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-ink-500 hover:border-brand-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader label="Loading inquiries" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No inquiries here"
          description="When tenants message you about a listing, their questions land in this inbox."
        />
      ) : (
        inquiries.map((inquiry) => (
          <article key={inquiry._id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link to={`/property/${inquiry.property?._id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                  {inquiry.property?.title || 'Listing removed'}
                </Link>
                <p className="text-sm text-ink-500">From {inquiry.tenant?.name} - {timeAgo(inquiry.createdAt)}</p>
              </div>
              <span className={`badge capitalize ${statusStyle(inquiry.status)}`}>{inquiry.status}</span>
            </div>

            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-ink-700">{inquiry.message}</p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-500">
              {inquiry.tenant?.email && (
                <a href={`mailto:${inquiry.tenant.email}`} className="flex items-center gap-1.5 hover:text-brand-700">
                  <Mail className="h-3.5 w-3.5" /> {inquiry.tenant.email}
                </a>
              )}
              {inquiry.tenant?.phone && (
                <a href={`tel:${inquiry.tenant.phone}`} className="flex items-center gap-1.5 hover:text-brand-700">
                  <Phone className="h-3.5 w-3.5" /> {inquiry.tenant.phone}
                </a>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {inquiry.status !== 'contacted' && (
                <button type="button" className="btn-secondary" onClick={() => changeStatus(inquiry._id, 'contacted')}>
                  Mark as contacted
                </button>
              )}
              {inquiry.status !== 'closed' && (
                <button type="button" className="btn-secondary" onClick={() => changeStatus(inquiry._id, 'closed')}>
                  Close inquiry
                </button>
              )}
              {inquiry.status !== 'pending' && (
                <button type="button" className="btn-ghost" onClick={() => changeStatus(inquiry._id, 'pending')}>
                  Reopen
                </button>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
