// src/components/RegistrationModal.tsx
'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface ModalProps {
  event: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegistrationModal({ event, onClose, onSuccess }: ModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    collegeOrCompany: '',
    source: 'Direct',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    trackEvent('registration_submitted', { eventId: event._id, eventName: event.name });

    try {
      const res = await fetch(`/api/events/${event._id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        trackEvent('registration_success', { eventId: event._id, email: formData.email });
        onSuccess();
        onClose();
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err: any) {
      trackEvent('registration_failed', { eventId: event._id, error: err.message });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        
        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">{event.category}</span>
        <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-1">{event.name}</h2>
        <p className="text-sm text-gray-500 mb-4">{event.location} &bull; {new Date(event.date).toLocaleDateString()}</p>
        
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">{event.fullDescription}</p>
        
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Register for this Event</h3>
          {error && <div className="mb-4 p-3 text-sm bg-red-50 text-red-600 rounded-lg font-medium">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg text-gray-900" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (10 digits) *</label>
                <input required type="tel" pattern="[0-9]{10}" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg text-gray-900" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">College / Company *</label>
              <input required type="text" value={formData.collegeOrCompany} onChange={e => setFormData({...formData, collegeOrCompany: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">How did you hear about us?</label>
              <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full text-sm px-3 py-2 border rounded-lg text-gray-900 bg-white">
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="Email">Email</option>
                <option value="Direct">Direct Referral</option>
              </select>
            </div>
            <button type="submit" disabled={loading || event.availableSeats <= 0} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold rounded-lg shadow text-sm transition-colors mt-2">
              {event.availableSeats <= 0 ? 'Seats Full' : loading ? 'Processing...' : 'Confirm Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}