import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { userApi } from '../services/endpoints';
import { AMENITIES, CITIES, GENDER_PREFERENCES, PROPERTY_TYPES, ROOM_TYPES } from '../utils/constants';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Spinner } from '../components/ui';

/** First-login flow: pick a role, then save rental preferences. */
export default function Onboarding() {
  useDocumentTitle('Set your preferences');
  const navigate = useNavigate();
  const { profile, setProfile, refreshProfile } = useApp();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(profile?.role || 'tenant');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    preferredCity: profile?.preferences?.preferredCity || '',
    preferredLocality: profile?.preferences?.preferredLocality || '',
    minRent: profile?.preferences?.minRent || '',
    maxRent: profile?.preferences?.maxRent || '',
    propertyType: profile?.preferences?.propertyType || 'Any',
    roomType: profile?.preferences?.roomType || 'Any',
    requiredAmenities: profile?.preferences?.requiredAmenities || [],
    foodRequired: profile?.preferences?.foodRequired || false,
    genderPreference: profile?.preferences?.genderPreference || 'Any'
  });

  const toggleAmenity = (amenity) =>
    setForm((prev) => ({
      ...prev,
      requiredAmenities: prev.requiredAmenities.includes(amenity)
        ? prev.requiredAmenities.filter((a) => a !== amenity)
        : [...prev.requiredAmenities, amenity]
    }));

  const chooseRole = async (selected) => {
    setRole(selected);
    setSaving(true);
    try {
      const result = await userApi.updateRole(selected);
      setProfile(result.user);
      if (selected === 'owner') {
        toast.success('Owner account ready. Add your first listing.');
        await userApi.updatePreferences({ preferredCity: profile?.city || '' });
        await refreshProfile();
        navigate('/owner/properties/new');
        return;
      }
      setStep(2);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async (event) => {
    event.preventDefault();
    if (!form.preferredCity) {
      toast.error('Pick the city you are searching in');
      return;
    }
    if (form.maxRent && Number(form.minRent) > Number(form.maxRent)) {
      toast.error('Minimum budget cannot be higher than the maximum');
      return;
    }
    setSaving(true);
    try {
      const result = await userApi.updatePreferences({
        ...form,
        minRent: Number(form.minRent) || 0,
        maxRent: Number(form.maxRent) || 0
      });
      setProfile(result.user);
      toast.success('Your personalized recommendations are ready.');
      navigate('/recommendations');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-page max-w-3xl py-12">
      <span className="badge bg-brand-50 text-brand-700"><Sparkles className="h-3.5 w-3.5" /> Step {step} of 2</span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
        {step === 1 ? 'How will you use RentEase?' : 'What are you looking for?'}
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        {step === 1
          ? 'You can change this later from your profile.'
          : 'These answers drive your match score. Nothing here is permanent.'}
      </p>

      {step === 1 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { value: 'tenant', icon: User, title: 'I am looking for a place', body: 'Search, save, compare and contact owners.' },
            { value: 'owner', icon: Building2, title: 'I want to list a property', body: 'Publish listings and manage tenant inquiries.' }
          ].map(({ value, icon: Icon, title, body }) => (
            <button
              key={value}
              type="button"
              disabled={saving}
              onClick={() => chooseRole(value)}
              className={`card p-6 text-left transition hover:border-brand-300 ${role === value ? 'border-brand-300' : ''}`}
            >
              <span className="inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-600"><Icon className="h-5 w-5" /></span>
              <h2 className="mt-4 text-base font-semibold text-ink-900">{title}</h2>
              <p className="mt-1 text-sm text-ink-500">{body}</p>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={savePreferences} className="card mt-8 space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="pref-city">Preferred city</label>
              <select
                id="pref-city" className="input" value={form.preferredCity}
                onChange={(e) => setForm({ ...form, preferredCity: e.target.value })}
              >
                <option value="">Select a city</option>
                {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="pref-locality">Preferred locality</label>
              <input
                id="pref-locality" className="input" placeholder="e.g. GTB Nagar"
                value={form.preferredLocality}
                onChange={(e) => setForm({ ...form, preferredLocality: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="pref-min">Minimum budget</label>
              <input
                id="pref-min" type="number" min="0" className="input" placeholder="5000"
                value={form.minRent} onChange={(e) => setForm({ ...form, minRent: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="pref-max">Maximum budget</label>
              <input
                id="pref-max" type="number" min="0" className="input" placeholder="12000"
                value={form.maxRent} onChange={(e) => setForm({ ...form, maxRent: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="pref-type">Property type</label>
              <select
                id="pref-type" className="input" value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
              >
                <option value="Any">No preference</option>
                {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="pref-room">Room type</label>
              <select
                id="pref-room" className="input" value={form.roomType}
                onChange={(e) => setForm({ ...form, roomType: e.target.value })}
              >
                <option value="Any">No preference</option>
                {ROOM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="pref-gender">You identify as</label>
              <select
                id="pref-gender" className="input" value={form.genderPreference}
                onChange={(e) => setForm({ ...form, genderPreference: e.target.value })}
              >
                {GENDER_PREFERENCES.map((option) => (
                  <option key={option} value={option}>{option === 'Any' ? 'Prefer not to say' : option}</option>
                ))}
              </select>
            </div>
            <label className="mt-7 flex items-center gap-2.5 text-sm text-ink-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                checked={form.foodRequired}
                onChange={(e) => setForm({ ...form, foodRequired: e.target.checked })}
              />
              I need meals included
            </label>
          </div>

          <div>
            <span className="label">Must-have amenities</span>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => {
                const active = form.requiredAmenities.includes(amenity);
                return (
                  <button
                    key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-ink-500 hover:border-brand-200'
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Spinner className="h-4 w-4 text-white" />}
              Save and see matches
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/properties')}>
              Skip for now
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
