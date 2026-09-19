import { Brain, Building2, ShieldCheck, Users } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { SectionHeading } from '../components/ui';

const PILLARS = [
  {
    icon: Building2,
    title: 'One place to search',
    body: 'PGs, single rooms, flats and apartments across Delhi, Noida, Gurugram, Pune and Bangalore, with the same filters everywhere.'
  },
  {
    icon: Brain,
    title: 'Matching you can read',
    body: 'Every recommendation shows its score and the reasons behind it, so you know why a place was suggested.'
  },
  {
    icon: ShieldCheck,
    title: 'Moderated listings',
    body: 'Owners submit listings, an admin reviews them, and only approved listings appear in search.'
  },
  {
    icon: Users,
    title: 'Built for students',
    body: 'Budget ranges, meal availability, gender preference and locality filters reflect how students actually search.'
  }
];

export default function About() {
  useDocumentTitle('About');
  return (
    <div className="container-page py-14">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Renting should not need twenty WhatsApp groups
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-500">
          Students and young professionals moving to a new city usually find rooms through scattered listing groups,
          brokers and word of mouth. Rents are unclear, photos are stale and comparing two places means keeping
          notes in your head. RentEase AI puts discovery, comparison, inquiries and reviews in one product, and
          adds a recommendation engine that explains itself.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-6">
            <span className="inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-600"><Icon className="h-5 w-5" /></span>
            <h2 className="mt-4 text-lg font-semibold text-ink-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <SectionHeading
          title="How the recommendation score works"
          description="A transparent weighted match, not a trained model. Each approved listing is scored out of 100 against your saved preferences."
        />
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Signal</th>
                <th className="px-5 py-3 font-medium">Weight</th>
                <th className="px-5 py-3 font-medium">What it checks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink-700">
              {[
                ['Budget', '30', 'Rent inside your min and max, with partial credit just above it'],
                ['Location', '25', 'Preferred city (16) and preferred locality (9)'],
                ['Property type', '15', 'PG, room, flat or apartment'],
                ['Room type', '10', 'Single, double, triple or shared'],
                ['Amenities', '10', 'Share of your required amenities that the listing has'],
                ['Meals', '5', 'Food included when you asked for it'],
                ['Rating', '5', 'Average tenant rating of the listing']
              ].map(([signal, weight, checks]) => (
                <tr key={signal}>
                  <td className="px-5 py-3 font-medium">{signal}</td>
                  <td className="px-5 py-3">{weight}</td>
                  <td className="px-5 py-3 text-ink-500">{checks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
