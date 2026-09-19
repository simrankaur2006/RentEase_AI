import { SlidersHorizontal, X } from 'lucide-react';
import {
  AMENITIES, CITIES, FURNISHING_TYPES, GENDER_PREFERENCES, PROPERTY_TYPES, ROOM_TYPES
} from '../utils/constants';

/** Filter panel used by the property discovery page (drawer on mobile). */
export default function FilterSidebar({ filters, onChange, onReset, cities = [], open, onClose }) {
  const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  const toggleAmenity = (amenity) => {
    const current = filters.amenities || [];
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    set('amenities', next);
  };

  const cityOptions = cities.length ? cities : CITIES;

  const body = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h3>
        <button type="button" onClick={onReset} className="text-sm font-medium text-brand-600 hover:underline">
          Reset
        </button>
      </div>

      <div>
        <label className="label" htmlFor="filter-city">City</label>
        <select id="filter-city" className="input" value={filters.city} onChange={(e) => set('city', e.target.value)}>
          <option value="">All cities</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="filter-locality">Locality</label>
        <input
          id="filter-locality"
          className="input"
          placeholder="e.g. Sector 62"
          value={filters.locality}
          onChange={(e) => set('locality', e.target.value)}
        />
      </div>

      <div>
        <span className="label">Monthly rent</span>
        <div className="flex items-center gap-2">
          <input
            type="number" min="0" placeholder="Min" className="input"
            value={filters.minRent} onChange={(e) => set('minRent', e.target.value)}
          />
          <span className="text-ink-500">to</span>
          <input
            type="number" min="0" placeholder="Max" className="input"
            value={filters.maxRent} onChange={(e) => set('maxRent', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="filter-type">Property type</label>
        <select id="filter-type" className="input" value={filters.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="filter-room">Room type</label>
        <select id="filter-room" className="input" value={filters.roomType} onChange={(e) => set('roomType', e.target.value)}>
          <option value="">Any room</option>
          {ROOM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="filter-furnishing">Furnishing</label>
        <select id="filter-furnishing" className="input" value={filters.furnishing} onChange={(e) => set('furnishing', e.target.value)}>
          <option value="">Any furnishing</option>
          {FURNISHING_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="filter-gender">Open to</label>
        <select id="filter-gender" className="input" value={filters.genderPreference} onChange={(e) => set('genderPreference', e.target.value)}>
          <option value="">Anyone</option>
          {GENDER_PREFERENCES.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-ink-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          checked={filters.foodAvailable === 'true'}
          onChange={(e) => set('foodAvailable', e.target.checked ? 'true' : '')}
        />
        Meals included
      </label>

      <div>
        <span className="label">Amenities</span>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => {
            const active = (filters.amenities || []).includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-ink-500 hover:border-brand-200 hover:text-brand-700'
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="card sticky top-24 hidden h-fit w-full max-w-xs p-5 lg:block">{body}</aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex-1 bg-ink-900/40" onClick={onClose} role="presentation" />
          <div className="h-full w-[85%] max-w-sm overflow-y-auto bg-white p-5">
            <button type="button" onClick={onClose} className="mb-4 ml-auto flex rounded-lg p-2 text-ink-500 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
            {body}
            <button type="button" className="btn-primary mt-6 w-full" onClick={onClose}>
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
