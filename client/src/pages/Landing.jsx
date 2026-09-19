import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, Building2, ClipboardList, MapPin, MessageSquare, Quote,
  Scale, Search, Sparkles, Wallet
} from 'lucide-react';
import { propertyApi } from '../services/endpoints';
import { CITIES } from '../utils/constants';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PropertyCard from '../components/PropertyCard';
import { SectionHeading, SkeletonGrid } from '../components/ui';

const STEPS = [
  { icon: ClipboardList, title: 'Tell us what you need', body: 'City, locality, budget, room type and the amenities you cannot live without.' },
  { icon: Search, title: 'Search or let us match', body: 'Filter listings yourself, or open recommendations for a ranked shortlist with reasons.' },
  { icon: Scale, title: 'Compare the finalists', body: 'Put up to three places side by side on rent, deposit, amenities and rating.' },
  { icon: MessageSquare, title: 'Message the owner', body: 'Send an inquiry from the listing page and track whether the owner has responded.' }
];

const REASONS = [
  { icon: Wallet, title: 'Budget first', body: 'Rent and deposit are on every card, so nothing surprises you at the door.' },
  { icon: BadgeCheck, title: 'Admin reviewed', body: 'Listings go live only after moderation, which keeps duplicates and fake posts out.' },
  { icon: Sparkles, title: 'Explained matches', body: 'Each recommendation lists why it fits, from budget to meals to locality.' },
  { icon: Building2, title: 'Owner tools', body: 'Owners manage listings, inquiries and reviews from a single workspace.' }
];

const TESTIMONIALS = [
  { name: 'Aditya Rana', role: 'B.Tech student, Delhi', text: 'I found a PG near GTB Nagar in two evenings. The match reasons told me exactly which places included food.' },
  { name: 'Priya Nair', role: 'Software engineer, Noida', text: 'The comparison table saved me a spreadsheet. Rent, deposit and amenities lined up in one view.' },
  { name: 'Imran Qureshi', role: 'Property owner, Pune', text: 'Inquiries arrive with the tenant details attached, so I stopped losing enquiries in my inbox.' }
];

export default function Landing() {
  useDocumentTitle('Find a place that feels like home');
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ city: '', maxRent: '', query: '' });

  useEffect(() => {
    propertyApi
      .featured()
      .then((data) => setFeatured(data.properties))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.city) params.set('city', search.city);
    if (search.maxRent) params.set('maxRent', search.maxRent);
    if (search.query) params.set('search', search.query);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="badge bg-brand-50 text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered smart recommendations
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              Find a place that feels like home.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-500">
              Discover PGs, rooms and rentals that match your budget, location and lifestyle.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/properties" className="btn-primary px-5 py-3">
                Explore properties <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/owner/properties/new" className="btn-secondary px-5 py-3">
                List your property
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[['15+', 'Live listings'], ['5', 'Cities covered'], ['100', 'Point match score']].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-bold text-ink-900">{value}</dt>
                  <dd className="text-sm text-ink-500">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Search preview */}
          <form onSubmit={submitSearch} className="card p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-ink-900">Start with the basics</h2>
            <p className="mt-1 text-sm text-ink-500">Three fields are enough to get a useful shortlist.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="label" htmlFor="hero-city">City</label>
                <select
                  id="hero-city" className="input"
                  value={search.city} onChange={(e) => setSearch({ ...search, city: e.target.value })}
                >
                  <option value="">Any city</option>
                  {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="hero-budget">Monthly budget</label>
                <input
                  id="hero-budget" type="number" min="0" placeholder="e.g. 12000" className="input"
                  value={search.maxRent} onChange={(e) => setSearch({ ...search, maxRent: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="hero-query">Locality or keyword</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="hero-query" className="input pl-9" placeholder="GTB Nagar, Sector 62, Koramangala"
                    value={search.query} onChange={(e) => setSearch({ ...search, query: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary mt-6 w-full py-3">
              <Search className="h-4 w-4" /> Search places
            </button>
          </form>
        </div>
      </section>

      {/* Featured */}
      <section className="container-page py-16">
        <SectionHeading
          title="Featured this week"
          description="The highest rated approved listings across all five cities."
          action={<Link to="/properties" className="btn-secondary">See all listings</Link>}
        />
        {loading ? (
          <SkeletonGrid count={3} />
        ) : featured.length === 0 ? (
          <div className="card p-10 text-center text-sm text-ink-500">
            No approved listings yet. Run the seed script, or add a listing as an owner.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="container-page">
          <SectionHeading title="How RentEase works" description="Four steps from a fresh search to a signed room." />
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="card p-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-brand-50 p-2.5 text-brand-600"><Icon className="h-5 w-5" /></span>
                  <span className="text-sm font-semibold text-ink-500">Step {index + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why RentEase */}
      <section className="container-page py-16">
        <SectionHeading title="Why RentEase" description="The parts of a rental search that usually go wrong, handled." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-6">
              <span className="inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-600"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Smart recommendations */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="badge bg-brand-50 text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Smart recommendations
            </span>
            <h2 className="mt-4 section-title">Matches that show their working</h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-500">
              Save your preferences once and every approved listing is scored out of 100 against them. Budget carries
              the most weight, then location, property type, room type, amenities, meals and rating. You always see
              the reasons, so you can tell a 92% match from a 61% one at a glance.
            </p>
            <Link to="/recommendations" className="btn-primary mt-6">
              See my recommendations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-ink-900">Premium Student PG Near GTB Nagar</p>
                <p className="text-sm text-ink-500">GTB Nagar, Delhi - Rs 9,500/month</p>
              </div>
              <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-lg font-bold text-emerald-700">
                87%
              </span>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-700">
              {['Within your preferred budget', 'Located in Delhi, your preferred city', 'Matches your preferred room type (Single)', 'Contains 4 of your 5 requested amenities', 'Meals are included'].map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-16">
        <SectionHeading title="What people say" description="Feedback from tenants and owners using the platform." />
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="card p-6">
              <Quote className="h-6 w-6 text-brand-200" />
              <blockquote className="mt-3 text-sm leading-relaxed text-ink-700">{item.text}</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-ink-900">{item.name}</span>
                <span className="block text-ink-500">{item.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-16">
        <div className="rounded-3xl bg-brand-600 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">Your next room is a search away</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Set your preferences once and RentEase keeps a ranked shortlist ready every time you open it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn bg-white px-5 py-3 text-brand-700 hover:bg-brand-50">
              Create a free account
            </Link>
            <Link to="/properties" className="btn border border-white/40 px-5 py-3 text-white hover:bg-white/10">
              Browse listings first
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
