import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { userApi } from '../services/endpoints';
import { AMENITIES, CITIES, GENDER_PREFERENCES, PROPERTY_TYPES, ROOM_TYPES } from '../utils/constants';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Spinner } from '../components/ui';

export default function Profile() {
  useDocumentTitle('Profile');
  const { profile, setProfile } = useApp();

  const [details, setDetails] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    city: profile?.city || ''
  });
  const [prefs, setPrefs] = useState({
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
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const toggleAmenity = (amenity) =>
    setPrefs((prev) => ({
      ...prev,
      requiredAmenities: prev.requiredAmenities.includes(amenity)
        ? prev.requiredAmenities.filter((a) => a !== amenity)
        : [...prev.requiredAmenities, amenity]
    }));

  const saveDetails = async (event) => {
    event.preventDefault();
    if (!details.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSavingDetails(true);
    try {
      const result = await userApi.updateProfile(details);
      setProfile(result.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingDetails(false);
    }
  };

  const savePrefs = async (event) => {
    event.preventDefault();
    setSavingPrefs(true);
    try {
      const result = await userApi.updatePreferences({
        ...prefs,
        minRent: Number(prefs.minRent) || 0,
        maxRent: Number(prefs.maxRent) || 0
      });
      setProfile(result.user);
      toast.success('Preferences updated');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingPrefs(false);
    }
  };

  const switchRole = async (role) => {
    try {
      const result = await userApi.updateRole(role);
      setProfile(result.user);
      toast.success(`You are now using RentEase as ${role === 'owner' ? 'an owner' : 'a tenant'}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={saveDetails} className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Your details</h2>
        <p className="mt-1 text-sm text-ink-500">
          Email and password live in Clerk. Update your name, phone and city here.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="profile-name">Full name</label>
            <input id="profile-name" className="input" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="profile-phone">Phone</label>
            <input id="profile-phone" className="input" placeholder="98100 00000" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="profile-city">City</label>
            <input id="profile-city" className="input" value={details.city} onChange={(e) => setDetails({ ...details, city: e.target.value })} />
          </div>
          <div>
            <span className="label">Email</span>
            <input className="input bg-slate-50" value={profile?.email || ''} readOnly />
          </div>
        </div>
        <button type="submit" className="btn-primary mt-5" disabled={savingDetails}>
          {savingDetails && <Spinner className="h-4 w-4 text-white" />} Save details
        </button>
      </form>

      {profile?.role !== 'admin' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-ink-900">Account type</h2>
          <p className="mt-1 text-sm text-ink-500">
            You are currently a {profile?.role}. Switching to owner opens the listing tools.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className={profile?.role === 'tenant' ? 'btn-primary' : 'btn-secondary'} onClick={() => switchRole('tenant')}>
              Use as tenant
            </button>
            <button type="button" className={profile?.role === 'owner' ? 'btn-primary' : 'btn-secondary'} onClick={() => switchRole('owner')}>
              Use as owner
            </button>
            {profile?.role === 'owner' && <Link to="/owner" className="btn-ghost">Open owner workspace</Link>}
          </div>
        </div>
      )}

      <form onSubmit={savePrefs} className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Rental preferences</h2>
        <p className="mt-1 text-sm text-ink-500">These drive your match score on the recommendations page.</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="pf-city">Preferred city</label>
            <select id="pf-city" className="input" value={prefs.preferredCity} onChange={(e) => setPrefs({ ...prefs, preferredCity: e.target.value })}>
              <option value="">No preference</option>
              {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pf-locality">Preferred locality</label>
            <input id="pf-locality" className="input" value={prefs.preferredLocality} onChange={(e) => setPrefs({ ...prefs, preferredLocality: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="pf-min">Minimum budget</label>
            <input id="pf-min" type="number" min="0" className="input" value={prefs.minRent} onChange={(e) => setPrefs({ ...prefs, minRent: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="pf-max">Maximum budget</label>
            <input id="pf-max" type="number" min="0" className="input" value={prefs.maxRent} onChange={(e) => setPrefs({ ...prefs, maxRent: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="pf-type">Property type</label>
            <select id="pf-type" className="input" value={prefs.propertyType} onChange={(e) => setPrefs({ ...prefs, propertyType: e.target.value })}>
              <option value="Any">No preference</option>
              {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pf-room">Room type</label>
            <select id="pf-room" className="input" value={prefs.roomType} onChange={(e) => setPrefs({ ...prefs, roomType: e.target.value })}>
              <option value="Any">No preference</option>
              {ROOM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pf-gender">You identify as</label>
            <select id="pf-gender" className="input" value={prefs.genderPreference} onChange={(e) => setPrefs({ ...prefs, genderPreference: e.target.value })}>
              {GENDER_PREFERENCES.map((option) => (
                <option key={option} value={option}>{option === 'Any' ? 'Prefer not to say' : option}</option>
              ))}
            </select>
          </div>
          <label className="mt-7 flex items-center gap-2.5 text-sm text-ink-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              checked={prefs.foodRequired}
              onChange={(e) => setPrefs({ ...prefs, foodRequired: e.target.checked })}
            />
            Meals must be included
          </label>
        </div>

        <span className="label mt-5">Must-have amenities</span>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => {
            const active = prefs.requiredAmenities.includes(amenity);
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

        <button type="submit" className="btn-primary mt-6" disabled={savingPrefs}>
          {savingPrefs && <Spinner className="h-4 w-4 text-white" />} Save preferences
        </button>
      </form>
    </div>
  );
}
