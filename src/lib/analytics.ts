// src/lib/analytics.ts

type EventType =
  | 'event_list_viewed'
  | 'event_search_performed'
  | 'event_filter_applied'
  | 'event_card_clicked'
  | 'registration_submitted'
  | 'registration_success'
  | 'registration_failed';

export function trackEvent(eventName: EventType, payload?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  
  // Console logging as strictly required by the assignment
  console.log(`[ANALYTICS] [${timestamp}] Event: ${eventName}`, payload || '');

  // Bonus Points: Sending logs to a mock tracking pipeline or console data layer
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event: eventName, ...payload, timestamp });
  }
}