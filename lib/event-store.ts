/**
 * Simple in-memory event cache
 * Stores events so detail pages can access the same data
 */

let eventCache: Map<string, any> = new Map();

export function cacheEvents(events: any[]) {
  events.forEach(event => {
    eventCache.set(event.id, event);
  });
}

export function getCachedEvent(id: string) {
  return eventCache.get(id);
}

export function clearEventCache() {
  eventCache.clear();
}
