'use client';

import Link from 'next/link';
import SearchBar from './SearchBar';

export default function Header({ onSearch }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
              </svg>
            </div>
            <span className="hidden text-lg font-bold text-gray-900 sm:block">AutoParts Catalog</span>
          </Link>

          <div className="flex-1 max-w-2xl">
            <SearchBar onSearch={onSearch} />
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/?view=brands" className="text-sm font-medium text-gray-600 hover:text-gray-900">Brands</Link>
            <Link href="/?view=categories" className="text-sm font-medium text-gray-600 hover:text-gray-900">Categories</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
