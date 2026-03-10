'use client';

import Link from 'next/link';

export default function ProductCard({ product }) {
  const price = product.map_price || product.retail_price;
  const inStock = product.stock_quantity > 0;

  return (
    <Link href={`/products/${product.id}`} className="card group flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
        {inStock && (
          <span className="absolute right-2 top-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            In Stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.brand_name && (
          <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
            {product.brand_name}
          </span>
        )}
        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-brand-600">
          {product.name}
        </h3>
        {product.part_number && (
          <p className="mb-2 text-xs text-gray-500">Part# {product.mfr_part_number || product.part_number}</p>
        )}
        {product.category_name && (
          <p className="mb-2 text-xs text-gray-400">{product.category_name}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          {price ? (
            <span className="text-lg font-bold text-gray-900">
              ${parseFloat(price).toFixed(2)}
            </span>
          ) : (
            <span className="text-sm text-gray-400">Contact for price</span>
          )}
          <span className="btn-primary !py-1.5 !px-3 !text-xs">View Details</span>
        </div>
      </div>
    </Link>
  );
}
