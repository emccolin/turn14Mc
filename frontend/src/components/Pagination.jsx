'use client';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total_pages <= 1) return null;

  const { page, total_pages, total_items } = meta;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const start = Math.max(2, page - delta);
    const end = Math.min(total_pages - 1, page + delta);

    pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total_pages - 1) pages.push('...');
    if (total_pages > 1) pages.push(total_pages);

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-gray-500">
        Showing page <span className="font-medium">{page}</span> of{' '}
        <span className="font-medium">{total_pages}</span>{' '}
        ({total_items.toLocaleString()} results)
      </p>

      <nav className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-brand-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
