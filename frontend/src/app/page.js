'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import VehicleFilter from '../components/VehicleFilter';
import FilterSidebar from '../components/FilterSidebar';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import { api } from '../lib/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    page: 1,
    brand_id: '',
    category_id: '',
    sort: 'name',
    order: 'asc',
    in_stock: '',
  });
  const [vehicleFilters, setVehicleFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const activeVehicle = Object.fromEntries(
        Object.entries(vehicleFilters).filter(([, v]) => v)
      );
      const hasVehicle = Object.keys(activeVehicle).length > 0;
      const params = {
        page: filters.page,
        limit: 24,
        sort: filters.sort,
        order: filters.order,
      };

      if (filters.brand_id) params.brand_id = filters.brand_id;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.in_stock) params.in_stock = filters.in_stock;

      let result;
      if (searchQuery) {
        result = await api.searchProducts({ q: searchQuery, ...params, ...activeVehicle });
      } else if (hasVehicle) {
        result = await api.getVehicleProducts({ ...params, ...activeVehicle });
      } else {
        result = await api.getProducts(params);
      }

      setProducts(result.data || []);
      setMeta(result.meta || null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, vehicleFilters, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilters((f) => ({ ...f, page: 1 }));
  };

  const handleVehicleFilter = (vehicle) => {
    setVehicleFilters(vehicle);
    setFilters((f) => ({ ...f, page: 1 }));
  };

  const handleSidebarFilter = (update) => {
    setFilters((f) => ({ ...f, ...update, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((f) => ({ ...f, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (sort) => {
    const [sortField, sortOrder] = sort.split('-');
    setFilters((f) => ({ ...f, sort: sortField, order: sortOrder || 'asc', page: 1 }));
  };

  return (
    <div className="min-h-screen">
      <Header onSearch={handleSearch} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <VehicleFilter onFilterChange={handleVehicleFilter} />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="w-full shrink-0 lg:w-64">
            <FilterSidebar
              onFilterChange={handleSidebarFilter}
              activeBrandId={String(filters.brand_id)}
              activeCategoryId={String(filters.category_id)}
            />
          </div>

          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {searchQuery && (
                  <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-sm">
                    <span className="text-brand-700">
                      Results for &ldquo;{searchQuery}&rdquo;
                    </span>
                    <button
                      onClick={() => { setSearchQuery(''); setFilters((f) => ({ ...f, page: 1 })); }}
                      className="text-brand-500 hover:text-brand-700"
                    >
                      &times;
                    </button>
                  </div>
                )}
                {meta && (
                  <span className="text-sm text-gray-500">
                    {meta.total_items.toLocaleString()} products
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.in_stock === 'true'}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, in_stock: e.target.checked ? 'true' : '', page: 1 }))
                    }
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-gray-600">In Stock Only</span>
                </label>

                <select
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => handleSort(e.target.value)}
                  className="select-field !w-auto"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="brand-asc">Brand A-Z</option>
                  <option value="newest-desc">Newest</option>
                </select>
              </div>
            </div>

            <ProductGrid products={products} loading={loading} />

            <div className="mt-6">
              <Pagination meta={meta} onPageChange={handlePageChange} />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-400 sm:px-6 lg:px-8">
          <p>Auto Parts Catalog &mdash; Powered by Turn14 Distribution</p>
        </div>
      </footer>
    </div>
  );
}
