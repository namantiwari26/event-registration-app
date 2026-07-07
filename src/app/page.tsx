// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FilterBar from '@/components/FilterBar';
import RegistrationModal from '@/components/RegistrationModal';
import { trackEvent } from '@/lib/analytics';

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('');
  const [filterMode, setFilterMode] = useState<'client' | 'server'>('client');
  
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = '/api/events';
      if (filterMode === 'server') {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (mode) params.append('mode', mode);
        url += `?${params.toString()}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setEvents(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    trackEvent('event_list_viewed');
  }, []);

  useEffect(() => {
    if (filterMode === 'server') {
      trackEvent('event_search_performed', { search, category, mode });
    }
    fetchEvents();
  }, [filterMode, search, category, mode]);

  const filteredEvents = filterMode === 'client' 
    ? events.filter((evt) => {
        const matchesSearch = evt.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category ? evt.category === category : true;
        const matchesMode = mode ? evt.location === mode : true;
        return matchesSearch && matchesCategory && matchesMode;
      })
    : events;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">TechPulse Events</h1>
            <p className="mt-2 text-sm text-gray-500">Discover and register for cutting-edge events.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-gray-200 p-1 rounded-lg">
            <button onClick={() => setFilterMode('client')} className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${filterMode === 'client' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}>Client-Side Filter</button>
            <button onClick={() => setFilterMode('server')} className={`ml-1 px-4 py-2 text-xs font-medium rounded-md transition-all ${filterMode === 'server' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}>API-Side Filter</button>
          </div>
        </div>

        <FilterBar search={search} setSearch={setSearch} category={category} setCategory={setCategory} mode={mode} setMode={setMode} />

        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">Loading events...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-50 text-indigo-700">{event.category}</span>
                    <span className="text-xs text-gray-400 font-medium">{event.location}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">{event.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.shortDescription}</p>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-3">
                  <span className={`text-xs font-semibold ${event.availableSeats > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {event.availableSeats} seats remaining
                  </span>
                  <button 
                    onClick={() => {
                      trackEvent('event_card_clicked', { eventId: event._id, eventName: event.name });
                      setSelectedEvent(event);
                    }}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-xs transition-colors shadow-sm"
                  >
                    View & Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedEvent && (
          <RegistrationModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onSuccess={fetchEvents} />
        )}
      </div>
    </main>
  );
}