// src/components/FilterBar.tsx
'use client';

import { trackEvent } from '@/lib/analytics';

interface FilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  mode: string;
  setMode: (val: string) => void;
}

export default function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  mode,
  setMode,
}: FilterBarProps) {
  
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    trackEvent('event_filter_applied', { filterType: 'category', value: val });
  };

  const handleModeChange = (val: string) => {
    setMode(val);
    trackEvent('event_filter_applied', { filterType: 'mode', value: val });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Search Events</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by event name..."
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        >
          <option value="">All Categories</option>
          <option value="Workshop">Workshop</option>
          <option value="Seminar">Seminar</option>
          <option value="Hackathon">Hackathon</option>
          <option value="Webinar">Webinar</option>
        </select>
      </div>

      {/* Mode Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mode / Location</label>
        <select
          value={mode}
          onChange={(e) => handleModeChange(e.target.value)}
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        >
          <option value="">All Locations</option>
          <option value="Noida">Noida</option>
          <option value="Online">Online</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>
    </div>
  );
}