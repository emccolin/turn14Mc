'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function FilterSidebar({ onFilterChange, activeBrandId, activeCategoryId }) {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAllBrands, setShowAllBrands] = useState(false);

  useEffect(() => {
    api.getBrands().then((res) => setBrands(res.data || [])).catch(() => {});
    api.getCategories().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const displayBrands = showAllBrands ? brands : brands.slice(0, 15);

  return (
    <aside className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Categories</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onFilterChange({ category_id: '' })}
              className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
                !activeCategoryId ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onFilterChange({ category_id: cat.id })}
                className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  activeCategoryId === String(cat.id) ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.name}
                <span className="ml-1 text-xs text-gray-400">({cat.product_count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Brands</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onFilterChange({ brand_id: '' })}
              className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
                !activeBrandId ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Brands
            </button>
          </li>
          {displayBrands.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() => onFilterChange({ brand_id: brand.id })}
                className={`w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  activeBrandId === String(brand.id) ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {brand.name}
                <span className="ml-1 text-xs text-gray-400">({brand.product_count})</span>
              </button>
            </li>
          ))}
        </ul>
        {brands.length > 15 && (
          <button
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            {showAllBrands ? 'Show Less' : `Show All (${brands.length})`}
          </button>
        )}
      </div>
    </aside>
  );
}
