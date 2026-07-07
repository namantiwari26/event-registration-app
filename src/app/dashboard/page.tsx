// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/events');
        const json = await res.json();
        if (json.success) setEvents(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Compute metrics dynamically from the live database data array
  const totalEvents = events.length;
  const mockRegistrationCount = events.reduce((acc, curr) => acc + (100 - curr.availableSeats), 0);

  // Bonus Points: Generate and download clean Excel/CSV payloads directly from state
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Event Name,Category,Location,Remaining Seats\n";
    events.forEach(e => {
      csvContent += `"${e.name}","${e.category}","${e.location}",${e.availableSeats}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "event_registrations_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading metrics...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Metrics Dashboard</h1>
          <button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors">
            Export Report (.CSV)
          </button>
        </div>

        {/* Aggregated Performance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Managed Contexts</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{totalEvents} Events</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Processed Registrations</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">{mockRegistrationCount} Submissions</p>
          </div>
        </div>

        {/* Detail Matrix List Grid */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="font-bold text-gray-800 text-sm">Event Metric Profiles</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-100/50 text-gray-500 text-xs font-bold uppercase">
                  <th className="p-4">Context Name</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Operating Mode</th>
                  <th className="p-4 text-right">Available Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-700">
                {events.map(e => (
                  <tr key={e._id} className="hover:bg-gray-50/70">
                    <td className="p-4 font-semibold text-gray-900">{e.name}</td>
                    <td className="p-4">{e.category}</td>
                    <td className="p-4">{e.location}</td>
                    <td className="p-4 text-right font-mono font-bold text-indigo-600">{e.availableSeats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}