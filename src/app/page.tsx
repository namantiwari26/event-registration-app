'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { trackEvent } from '@/lib/analytics';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Calendar, 
  Users, 
  Layers, 
  BarChart3, 
  Download, 
  Lock, 
  CheckCircle2, 
  X 
} from 'lucide-react';

export default function Home() {
  // Application Data States
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Requirement 1: Search & Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('');

  const debouncedSearch = useDebounce(search, 400);
  
  // Requirement 2: Evaluator Filter Mode Switcher Toggle
  const [filterMode, setFilterMode] = useState<'client' | 'server'>('client');

  // Requirement 3 & 4: Modal UI States
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    collegeOrCompany: '',
    source: 'Direct'
  });
  const [submitting, setSubmitting] = useState(false);

  // Bonus Points: Dashboard Basic Authentication States
  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState(false);
  const [dashboardPassword, setDashboardPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Initial Analytics Tracking Hook
  useEffect(() => {
    trackEvent('event_list_viewed');
  }, []);

  // API Integration Layer (Supports Server-Side Evaluation Queries)
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
      if (json.success) {
        setEvents(json.data);
      }
    } catch (err) {
      console.error("Critical Connection Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterMode === 'server' && (debouncedSearch || category || mode)) {
      trackEvent('event_search_performed', { search: debouncedSearch, category, mode });
    }
    fetchEvents();
  }, [filterMode, debouncedSearch, category, mode]);

  // Requirement 2A: Client-Side Structural Filtering Engine
  const displayedEvents = filterMode === 'client'
    ? events.filter((evt) => {
        const matchesSearch = evt.name.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesCategory = category ? evt.category === category : true;
        const matchesMode = mode ? evt.location === mode : true;
        return matchesSearch && matchesCategory && matchesMode;
      })
    : events;

  // Form Submission Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    trackEvent('registration_submitted', { eventId: selectedEvent._id, eventName: selectedEvent.name });

    try {
      const res = await fetch(`/api/events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        trackEvent('registration_success', { eventId: selectedEvent._id, email: formData.email });
        setRegistrationSuccess(true);
        setShowRegisterForm(false);
        setFormData({ name: '', email: '', phone: '', collegeOrCompany: '', source: 'Direct' });
        fetchEvents(); // Refresh seat counts instantly
      } else {
        throw new Error(data.message || 'Validation rejected registration.');
      }
    } catch (err: any) {
      trackEvent('registration_failed', { eventId: selectedEvent._id, error: err.message });
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Bonus Points: CSV Generation Data Exporter 
  const triggerCSVExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,Event Name,Category,Mode/Location,Remaining Allocation\n";
    events.forEach(e => {
      csvContent += `"${e.name}","${e.category}","${e.location}",${e.availableSeats}\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "event_analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Basic Auth Checker for the Dashboard Section
  const unlockDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (dashboardPassword === 'admin123') { // Simple password check for presentation assignment
      setIsDashboardUnlocked(true);
      setAuthError('');
    } else {
      setAuthError('Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Navigation Bar Layout */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center font-black shadow-lg shadow-indigo-500/20 text-white">⚡</div>
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Galgotias Tech Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#events-section" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Events</a>
            <a href="#dashboard-section" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-950/40 border border-indigo-900/50 px-3 py-1.5 rounded-lg">Admin Console</a>
          </div>
        </div>
      </nav>

      {/* Hero Header Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="relative rounded-3xl bg-gradient-to-b from-indigo-950/50 to-slate-900 border border-indigo-500/10 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" /> Live Production Environment
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-4">
              Event Registration <br /><span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Mini Application Engine</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-6">
              A high-performance full-stack ecosystem built using Next.js, Mongoose, and structural cross-layer execution components.
            </p>
            
            {/* Requirement 2B Toggle Filter Strategy UI Design */}
            <div className="inline-flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => { setFilterMode('client'); trackEvent('event_filter_applied', { mode: 'client' }); }}
                className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${filterMode === 'client' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Layers className="h-3.5 w-3.5" /> Client-Side Engine
              </button>
              <button
                onClick={() => { setFilterMode('server'); trackEvent('event_filter_applied', { mode: 'server' }); }}
                className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${filterMode === 'server' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Server-Side Query API
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Grid Section */}
      <section id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Requirement 1: Search, Filter, and Controls Header Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by keyword name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); if(filterMode==='client') trackEvent('event_filter_applied', { type: 'category', val: e.target.value }); }}
              className="w-full text-sm px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              <option value="">All Categories</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Webinar">Webinar</option>
            </select>
          </div>
          <div>
            <select
              value={mode}
              onChange={(e) => { setMode(e.target.value); if(filterMode==='client') trackEvent('event_filter_applied', { type: 'mode', val: e.target.value }); }}
              className="w-full text-sm px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              <option value="">All Formats/Modes</option>
              <option value="Noida">Noida</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Global Dynamic State Error Handling Alert Banner */}
        {registrationSuccess && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3 shadow-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">Registration Profile Created Successfully!</h4>
              <p className="text-xs text-slate-400 mt-1">Check your browser console log window to view the structured verification analytics event stream execution.</p>
            </div>
            <button onClick={() => setRegistrationSuccess(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
          </div>
        )}

        {/* Dynamic Card Display Framework */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Querying active cloud environment context clusters...</p>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center bg-slate-950 rounded-2xl border border-slate-800 p-12 text-slate-500">
            No events matched your search criteria. Try a different filter combo.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedEvents.map((event) => (
              <div 
                key={event._id} 
                className="group relative bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-300" />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{event.category}</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-400"><MapPin className="h-3 w-3" /> {event.location}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">{event.name}</h3>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-4"><Calendar className="h-3.5 w-3.5" /> {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6">{event.shortDescription}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-900 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Availability</span>
                    <span className={`text-xs font-bold ${event.availableSeats > 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {event.availableSeats > 0 ? `${event.availableSeats} Seats Left` : 'Sold Out'}
                    </span>
                  </div>
                  <button
                    onClick={() => { trackEvent('event_card_clicked', { eventId: event._id, eventName: event.name }); setSelectedEvent(event); }}
                    className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-xs font-bold rounded-xl text-white transition-all shadow-md"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Requirement 7: Dashboard Matrix Analytics & Summary Section */}
      <section id="dashboard-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800 mt-12 mb-20">
        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {!isDashboardUnlocked ? (
            /* Bonus Feature: Basic Authentication Shield Interface Guard */
            <div className="max-w-md mx-auto text-center py-12 relative z-10">
              <div className="h-12 w-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20"><Lock className="h-5 w-5" /></div>
              <h3 className="text-xl font-bold text-white mb-2">Metrics Protected by Gatekeeper Auth</h3>
              <p className="text-sm text-slate-400 mb-6">Enter password to review aggregate cluster metrics, charts, and table summaries.</p>
              <form onSubmit={unlockDashboard} className="space-y-3">
                <input
                  type="password"
                  placeholder="Enter administrator secret key... (admin123)"
                  value={dashboardPassword}
                  onChange={(e) => setDashboardPassword(e.target.value)}
                  className="w-full text-center text-sm px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                {authError && <p className="text-xs font-semibold text-rose-400">{authError}</p>}
                <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow transition-colors">Authorize Access Profile</button>
              </form>
            </div>
          ) : (
            /* Unlocked Live Operations Dashboard Grid Layout Matrix */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2"><BarChart3 className="h-5 w-5 text-indigo-400" /> System Control Dashboard</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time aggregate computations mapping live database document collections.</p>
                </div>
                <button 
                  onClick={triggerCSVExport} 
                  className="inline-flex items-center gap-1.5 self-start px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download Inventory Summary (.CSV)
                </button>
              </div>

              {/* High Visibility Dynamic Summary Counter Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Contests</p>
                  <p className="text-3xl font-black text-white mt-1">{events.length}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Total Seats</p>
                  <p className="text-3xl font-black text-indigo-400 mt-1">
                    {events.reduce((sum, e) => sum + e.availableSeats, 0)} <span className="text-xs font-normal text-slate-500">allocations left</span>
                  </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 sm:col-span-2 md:col-span-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pipeline Core</p>
                  <p className="text-3xl font-black text-emerald-400 mt-1">Live <span className="text-xs font-mono font-normal text-slate-500">M0 Atlas Cloud</span></p>
                </div>
              </div>

              {/* Requirement 7 Data Matrix Listing Grid Table */}
              <div className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-900/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4">Context Event Header</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Operating Mode</th>
                        <th className="p-4 text-right">Available Allocation Pool</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      {events.map(e => (
                        <tr key={e._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4 font-semibold text-white">{e.name}</td>
                          <td className="p-4 text-slate-400">{e.category}</td>
                          <td className="p-4 text-slate-400">{e.location}</td>
                          <td className="p-4 text-right font-mono font-bold text-indigo-400">{e.availableSeats}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Requirement 3 & 4: Integrated Unified Event Sheet & Form Flow Overlay Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setSelectedEvent(null); setShowRegisterForm(false); setFormError(''); }}
              className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {!showRegisterForm ? (
              /* Requirement 3 View: Fully Styled Detailed Analytical Meta-Data Matrix Cards */
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{selectedEvent.category}</span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-800 text-slate-400">{selectedEvent.location}</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{selectedEvent.name}</h2>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium py-1 border-y border-slate-800/60">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-500" /> {new Date(selectedEvent.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-slate-500" /> {selectedEvent.availableSeats} Seats Remaining</span>
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-1">Detailed Profile</h4>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedEvent.fullDescription}</p>
                </div>
                <button
                  disabled={selectedEvent.availableSeats <= 0}
                  onClick={() => setShowRegisterForm(true)}
                  className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
                >
                  {selectedEvent.availableSeats > 0 ? 'Proceed to Registration Form' : 'Allocation Pool Exhausted (Full)'}
                </button>
              </div>
            ) : (
              /* Requirement 4 View: Strict Form Flow Enforcing Validation Rules */
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Seat Registration</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Event: <span className="text-indigo-400 font-semibold">{selectedEvent.name}</span></p>
                </div>

                {formError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs font-semibold text-rose-400">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Naman Tiwari"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full text-sm px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="naman@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full text-sm px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number *</label>
                      <input
                        required
                        type="tel"
                        pattern="[0-9]{10}"
                        placeholder="10-digit mobile line"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full text-sm px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">College / Corporation Organisation *</label>
                    <input
                      required
                      type="text"
                      placeholder="Galgotias University"
                      value={formData.collegeOrCompany}
                      onChange={(e) => setFormData({...formData, collegeOrCompany: e.target.value})}
                      className="w-full text-sm px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Marketing Channel Referral Vector</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full text-sm px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950"
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Email">Email</option>
                      <option value="Direct">Direct Referral</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowRegisterForm(false); setFormError(''); }}
                      className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-colors"
                    >
                      Back to Details
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-lg transition-colors"
                    >
                      {submitting ? 'Verifying...' : 'Submit Final Allocation'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}