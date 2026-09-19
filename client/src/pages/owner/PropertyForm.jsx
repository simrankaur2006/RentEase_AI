import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyApi } from '../../services/endpoints';
import {
  AMENITIES, CITIES, FURNISHING_TYPES, GENDER_PREFERENCES, PROPERTY_TYPES, ROOM_TYPES
} from '../../utils/constants';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { PageLoader, Spinner } from '../../components/ui';

const BLANK = {
  title: '', description: '', propertyType: 'PG', roomType: 'Single', rent: '', securityDeposit: '',
  city: '', locality: '', address: '', amenities: [], furnishing: 'Semi Furnished',
  foodAvailable: false, genderPreference: 'Any', availableFrom: '', images: ['']
};

/** Shared create/edit form for owner listings. */
export default function PropertyForm({ editing = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  useDocumentTitle(editing ? 'Edit listing' : 'New listing');

  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    propertyApi
      .details(id)
      .then(({ property }) => {
        setForm({
          ...BLANK,
          ...property,
          availableFrom: property.availableFrom ? property.availableFrom.slice(0, 10) : '',
          images: property.images?.length ? property.images : ['']
        });
      })
      .catch((error) => {
        toast.error(error.message);
        navigate('/owner/properties');
      })
      .finally(() => setLoading(false));
  }, [editing, id, navigate]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAmenity = (amenity) =>
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));

  const setImage = (index, value) =>
    setForm((prev) => ({ ...prev, images: prev.images.map((img, i) => (i === index ? value : img)) }));

  const addImageField = () => setForm((prev) => ({ ...prev, images: [...prev.images, ''] }));
  const removeImageField = (index) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const validate = () => {
    if (form.title.trim().length < 8) return 'Give the listing a descriptive title (at least 8 characters)';
    if (form.description.trim().length < 30) return 'Describe the place in at least a couple of sentences';
    if (!form.city) return 'Select a city';
    if (!form.locality.trim()) return 'Add the locality';
    if (!form.rent || Number(form.rent) <= 0) return 'Enter a valid monthly rent';
    if (form.securityDeposit && Number(form.securityDeposit) < 0) return 'Deposit cannot be negative';
    return '';
  };

  const submit = async (event) => {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      toast.error(problem);
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      rent: Number(form.rent),
      securityDeposit: Number(form.securityDeposit) || 0,
      images: form.images.map((img) => img.trim()).filter(Boolean),
      availableFrom: form.availableFrom || new Date().toISOString()
    };

    try {
      if (editing) {
        await propertyApi.update(id, payload);
        toast.success('Listing updated and sent for approval again');
      } else {
        await propertyApi.create(payload);
        toast.success('Your property has been submitted for admin approval.');
      }
      navigate('/owner/properties');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading the listing" />;

  return (
    <form onSubmit={submit} className="card space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">{editing ? 'Edit listing' : 'Add a listing'}</h2>
        <p className="mt-1 text-sm text-ink-500">
          Listings are reviewed by an admin before they appear in search.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title" className="input" maxLength={140} placeholder="Premium Student PG Near GTB Nagar"
          value={form.title} onChange={(e) => set('title', e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          id="description" className="input min-h-[140px]" maxLength={3000}
          placeholder="Who it suits, what is nearby, what is included in the rent."
          value={form.description} onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="propertyType">Property type</label>
          <select id="propertyType" className="input" value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
            {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="roomType">Room type</label>
          <select id="roomType" className="input" value={form.roomType} onChange={(e) => set('roomType', e.target.value)}>
            {ROOM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rent">Monthly rent</label>
          <input id="rent" type="number" min="0" className="input" placeholder="9500" value={form.rent} onChange={(e) => set('rent', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="deposit">Security deposit</label>
          <input id="deposit" type="number" min="0" className="input" placeholder="15000" value={form.securityDeposit} onChange={(e) => set('securityDeposit', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <select id="city" className="input" value={form.city} onChange={(e) => set('city', e.target.value)}>
            <option value="">Select a city</option>
            {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="locality">Locality</label>
          <input id="locality" className="input" placeholder="GTB Nagar" value={form.locality} onChange={(e) => set('locality', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="address">Full address</label>
          <input id="address" className="input" placeholder="Block C, Outram Lines, Delhi 110009" value={form.address} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="furnishing">Furnishing</label>
          <select id="furnishing" className="input" value={form.furnishing} onChange={(e) => set('furnishing', e.target.value)}>
            {FURNISHING_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="gender">Open to</label>
          <select id="gender" className="input" value={form.genderPreference} onChange={(e) => set('genderPreference', e.target.value)}>
            {GENDER_PREFERENCES.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="availableFrom">Available from</label>
          <input id="availableFrom" type="date" className="input" value={form.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} />
        </div>
        <label className="mt-7 flex items-center gap-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={form.foodAvailable}
            onChange={(e) => set('foodAvailable', e.target.checked)}
          />
          Meals are included
        </label>
      </div>

      <div>
        <span className="label">Amenities</span>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => {
            const active = form.amenities.includes(amenity);
            return (
              <button
                key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-ink-500 hover:border-brand-200'
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="label">Image URLs</span>
        <p className="mb-2 text-xs text-ink-500">Paste direct image links. The first image becomes the cover photo.</p>
        <div className="space-y-2">
          {form.images.map((image, index) => (
            <div key={index} className="flex gap-2">
              <input
                className="input" placeholder="https://images.unsplash.com/..."
                value={image} onChange={(e) => setImage(index, e.target.value)}
              />
              {form.images.length > 1 && (
                <button
                  type="button" onClick={() => removeImageField(index)}
                  className="rounded-xl border border-slate-200 px-3 text-ink-500 hover:text-rose-600"
                  aria-label="Remove image field"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addImageField} className="btn-ghost mt-2">
          <Plus className="h-4 w-4" /> Add another image
        </button>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Spinner className="h-4 w-4 text-white" />}
          {editing ? 'Save changes' : 'Submit for approval'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => navigate('/owner/properties')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
