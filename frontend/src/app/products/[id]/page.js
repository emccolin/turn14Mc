'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [fitmentPage, setFitmentPage] = useState(1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getProduct(id)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error('Failed to load product:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="aspect-square rounded-xl bg-gray-200" />
            <div className="space-y-4">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-8 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-10 w-40 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        <Link href="/" className="btn-primary mt-4">Back to Catalog</Link>
      </div>
    );
  }

  const images = product.images || [];
  const fitment = product.fitment || [];
  const inventory = product.inventory || [];
  const price = product.map_price || product.retail_price;
  const totalStock = inventory.reduce((sum, inv) => sum + parseInt(inv.quantity, 10), 0);
  const fitmentPerPage = 20;
  const fitmentTotalPages = Math.ceil(fitment.length / fitmentPerPage);
  const visibleFitment = fitment.slice((fitmentPage - 1) * fitmentPerPage, fitmentPage * fitmentPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Catalog
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white p-6">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]?.url}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === selectedImage ? 'border-brand-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.brand_name && (
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                  {product.brand_name}
                </span>
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
              {product.mfr_part_number && <span>MFR# {product.mfr_part_number}</span>}
              {product.part_number && <span>Part# {product.part_number}</span>}
              {product.barcode && <span>UPC: {product.barcode}</span>}
            </div>

            {product.category_name && (
              <p className="mt-2 text-sm text-gray-400">Category: {product.category_name}</p>
            )}

            <div className="mt-6 flex items-baseline gap-4">
              {price ? (
                <span className="text-3xl font-bold text-gray-900">${parseFloat(price).toFixed(2)}</span>
              ) : (
                <span className="text-lg text-gray-500">Contact for pricing</span>
              )}
              {product.retail_price && product.map_price && parseFloat(product.retail_price) > parseFloat(product.map_price) && (
                <span className="text-lg text-gray-400 line-through">
                  ${parseFloat(product.retail_price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="mt-4">
              {totalStock > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  In Stock ({totalStock} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Out of Stock
                </span>
              )}
            </div>

            {(product.short_description || product.description) && (
              <div className="mt-6 space-y-2">
                <h2 className="text-sm font-semibold text-gray-900">Description</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.description || product.short_description }}
                />
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
              {product.dimensions_length && (
                <div><span className="text-gray-500">Length:</span> <span className="font-medium">{product.dimensions_length}&quot;</span></div>
              )}
              {product.dimensions_width && (
                <div><span className="text-gray-500">Width:</span> <span className="font-medium">{product.dimensions_width}&quot;</span></div>
              )}
              {product.dimensions_height && (
                <div><span className="text-gray-500">Height:</span> <span className="font-medium">{product.dimensions_height}&quot;</span></div>
              )}
              {product.weight && (
                <div><span className="text-gray-500">Weight:</span> <span className="font-medium">{product.weight} lbs</span></div>
              )}
            </div>

            {product.prop_65 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <strong>WARNING:</strong> This product can expose you to chemicals known to the State of California to cause cancer and birth defects or other reproductive harm.
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Fitment Table */}
        {fitment.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Vehicle Fitment ({fitment.length})</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Year</th>
                      <th className="px-4 py-3 font-medium">Make</th>
                      <th className="px-4 py-3 font-medium">Model</th>
                      <th className="px-4 py-3 font-medium">Submodel</th>
                      <th className="px-4 py-3 font-medium">Engine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visibleFitment.map((f, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-medium">{f.year}</td>
                        <td className="px-4 py-2.5">{f.make}</td>
                        <td className="px-4 py-2.5">{f.model}</td>
                        <td className="px-4 py-2.5 text-gray-500">{f.submodel || '—'}</td>
                        <td className="px-4 py-2.5 text-gray-500">{f.engine || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {fitmentTotalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
                  <span className="text-xs text-gray-500">
                    Page {fitmentPage} of {fitmentTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFitmentPage((p) => Math.max(1, p - 1))}
                      disabled={fitmentPage <= 1}
                      className="rounded border border-gray-300 px-2.5 py-1 text-xs hover:bg-white disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setFitmentPage((p) => Math.min(fitmentTotalPages, p + 1))}
                      disabled={fitmentPage >= fitmentTotalPages}
                      className="rounded border border-gray-300 px-2.5 py-1 text-xs hover:bg-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
