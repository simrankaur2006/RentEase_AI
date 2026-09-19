import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Building2 } from 'lucide-react';
import { propertyApi } from '../services/endpoints';
import { SORT_OPTIONS } from '../utils/constants';
import useDebounce from '../hooks/useDebounce';
import useDocumentTitle from '../hooks/useDocumentTitle';
import FilterSidebar from '../components/FilterSidebar';
import PropertyCard from '../components/PropertyCard';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/ui';

const EMPTY_FILTERS = {
  city: '', locality: '', minRent: '', maxRent: '', propertyType: '', roomType: '',
  furnishing: '', foodAvailable: '', genderPreference: '', amenities: [],
  search: '', sort: 'newest', page: 1
};

export default function Properties() {
  useDocumentTitle('Properties');
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    city: searchParams.get('city') || '',
    maxRent: searchParams.get('maxRent') || '',
    search: searchParams.get('search') || '',
    roomType: searchParams.get('roomType') || ''
  }));
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 450);

  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    propertyApi.cities().then((data) => setCities(data.cities)).catch(() => setCities([]));
  }, []);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters, limit: 9 };
      params.amenities = filters.amenities.join(',');
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === undefined) delete params[key];
      });
      const data = await propertyApi.list(params);
      setProperties(data.properties);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the URL shareable.
  useEffect(() => {
    const next = {};
    if (filters.city) next.city = filters.city;
    if (filters.maxRent) next.maxRent = filters.maxRent;
    if (filters.search) next.search = filters.search;
    if (filters.roomType) next.roomType = filters.roomType;
    setSearchParams(next, { replace: true });
  }, [filters.city, filters.maxRent, filters.search, filters.roomType, setSearchParams]);

  const reset = () => {
    setFilters(EMPTY_FILTERS);
    setSearchInput('');
  };

  const goToPage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Browse rentals</h1>
        <p className="mt-1 text-sm text-ink-500">
          {loading ? 'Searching listings' : `${pagination.total} approved listing${pagination.total === 1 ? '' : 's'} match your filters`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by title, locality or city"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-56"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <button type="button" className="btn-secondary lg:hidden" onClick={() => setDrawerOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="mt-6 flex gap-6">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onReset={reset}
          cities={cities}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        <div className="min-w-0 flex-1 pb-20">
          {loading ? (
            <SkeletonGrid count={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No listings match those filters"
              description="Try widening the budget, clearing the amenity filters or picking a nearby locality."
              action={<button type="button" className="btn-primary" onClick={reset}>Clear filters</button>}
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    type="button" className="btn-secondary"
                    disabled={pagination.page <= 1}
                    onClick={() => goToPage(pagination.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  {Array.from({ length: pagination.totalPages }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => goToPage(index + 1)}
                      className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${
                        pagination.page === index + 1
                          ? 'bg-brand-600 text-white'
                          : 'border border-slate-200 bg-white text-ink-500 hover:border-brand-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    type="button" className="btn-secondary"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => goToPage(pagination.page + 1)}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
