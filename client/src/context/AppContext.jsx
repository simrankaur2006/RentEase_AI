import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { setTokenGetter } from '../services/api';
import { favouriteApi, userApi } from '../services/endpoints';
import { MAX_COMPARE } from '../utils/constants';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
};

export function AppProvider({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [favouriteIds, setFavouriteIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);

  // Give the axios instance a way to fetch the current Clerk token.
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  const loadFavourites = useCallback(async () => {
    try {
      const result = await favouriteApi.list();
      setFavouriteIds(result.ids || []);
    } catch {
      setFavouriteIds([]);
    }
  }, []);

  // Mirror the Clerk profile into MongoDB on every sign-in.
  useEffect(() => {
    const sync = async () => {
      if (!isLoaded) return;
      if (!isSignedIn) {
        setProfile(null);
        setFavouriteIds([]);
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      try {
        const result = await userApi.sync({
          name: user?.fullName || user?.username || 'RentEase User',
          email: user?.primaryEmailAddress?.emailAddress,
          profileImage: user?.imageUrl,
          phone: user?.primaryPhoneNumber?.phoneNumber
        });
        setProfile(result.user);
        await loadFavourites();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setProfileLoading(false);
      }
    };
    sync();
  }, [isLoaded, isSignedIn, user, loadFavourites]);

  const refreshProfile = useCallback(async () => {
    try {
      const result = await userApi.me();
      setProfile(result.user);
      return result.user;
    } catch {
      return null;
    }
  }, []);

  const toggleFavourite = useCallback(
    async (propertyId) => {
      if (!isSignedIn) {
        toast.error('Sign in to save properties');
        return false;
      }
      const isSaved = favouriteIds.includes(propertyId);
      try {
        if (isSaved) {
          await favouriteApi.remove(propertyId);
          setFavouriteIds((prev) => prev.filter((id) => id !== propertyId));
          toast.success('Removed from favourites');
          return false;
        }
        await favouriteApi.add(propertyId);
        setFavouriteIds((prev) => [...prev, propertyId]);
        toast.success('Saved to favourites');
        return true;
      } catch (error) {
        toast.error(error.message);
        return isSaved;
      }
    },
    [favouriteIds, isSignedIn]
  );

  const toggleCompare = useCallback((propertyId) => {
    setCompareIds((prev) => {
      if (prev.includes(propertyId)) return prev.filter((id) => id !== propertyId);
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} properties`);
        return prev;
      }
      toast.success('Added to comparison');
      return [...prev, propertyId];
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const value = useMemo(
    () => ({
      clerkUser: user,
      isSignedIn,
      isLoaded,
      profile,
      setProfile,
      profileLoading,
      refreshProfile,
      favouriteIds,
      loadFavourites,
      toggleFavourite,
      compareIds,
      toggleCompare,
      clearCompare,
      role: profile?.role || 'tenant',
      needsOnboarding: Boolean(profile && !profile.preferences?.isCompleted)
    }),
    [
      user, isSignedIn, isLoaded, profile, profileLoading, refreshProfile, favouriteIds,
      loadFavourites, toggleFavourite, compareIds, toggleCompare, clearCompare
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
