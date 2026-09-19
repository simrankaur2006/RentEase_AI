/** 9500 -> "Rs 9,500" style formatting used across the app. */
export const formatRent = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

export const timeAgo = (value) => {
  if (!value) return '';
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  const units = [
    ['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]
  ];
  for (const [name, secs] of units) {
    const amount = Math.floor(seconds / secs);
    if (amount >= 1) return `${amount} ${name}${amount > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export const truncate = (text = '', length = 120) =>
  text.length > length ? `${text.slice(0, length).trim()}...` : text;

export const statusStyle = (status) => {
  const map = {
    approved: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    rejected: 'bg-rose-50 text-rose-700',
    contacted: 'bg-blue-50 text-blue-700',
    closed: 'bg-slate-100 text-slate-600'
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export const matchScoreStyle = (score) => {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 60) return 'bg-brand-50 text-brand-700 border-brand-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};
