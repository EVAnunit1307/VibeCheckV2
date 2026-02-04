/**
 * Eventbrite API Integration
 * Production-ready service for fetching real event data
 */

import axios, { AxiosInstance } from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_EVENTBRITE_API_KEY || '';
const BASE_URL = 'https://www.eventbriteapi.com/v3';

// Create axios instance with default config
const eventbriteAPI: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Types for Eventbrite API
export interface EventbriteVenue {
  id: string;
  name: string;
  address: {
    address_1?: string;
    address_2?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  };
}

export interface EventbriteEvent {
  id: string;
  name: {
    text: string;
  };
  description: {
    text: string;
  };
  start: {
    local: string;
    timezone: string;
  };
  end: {
    local: string;
    timezone: string;
  };
  url: string;
  logo?: {
    original?: {
      url: string;
    };
  };
  venue?: EventbriteVenue;
  is_free: boolean;
  category_id?: string;
  subcategory_id?: string;
  ticket_availability?: {
    minimum_ticket_price?: {
      major_value: number;
      currency: string;
    };
    maximum_ticket_price?: {
      major_value: number;
      currency: string;
    };
  };
}

export interface EventSearchParams {
  location_address?: string;
  location_within?: string; // e.g. "10mi"
  start_date_range_start?: string; // ISO 8601 format
  start_date_range_end?: string;
  categories?: string; // comma-separated category IDs
  subcategories?: string;
  price?: 'free' | 'paid';
  sort_by?: 'date' | 'distance' | 'best';
  page?: number;
}

/**
 * Search for events using Eventbrite API
 */
export async function searchEvents(params: EventSearchParams = {}) {
  try {
    const queryParams = {
      ...params,
      expand: 'venue,ticket_availability,category',
    };

    const response = await eventbriteAPI.get('/events/search/', {
      params: queryParams,
    });

    return {
      success: true,
      events: response.data.events || [],
      pagination: response.data.pagination || {},
    };
  } catch (error: any) {
    console.error('Eventbrite API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error_description || 'Failed to fetch events',
      events: [],
    };
  }
}

/**
 * Get a specific event by ID
 */
export async function getEventById(eventId: string) {
  try {
    const response = await eventbriteAPI.get(`/events/${eventId}/`, {
      params: {
        expand: 'venue,ticket_availability,category,organizer',
      },
    });

    return {
      success: true,
      event: response.data,
    };
  } catch (error: any) {
    console.error('Eventbrite API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error_description || 'Failed to fetch event',
      event: null,
    };
  }
}

/**
 * Get events near a specific location
 */
export async function getEventsNearLocation(
  latitude: number,
  longitude: number,
  radiusMiles: number = 25
) {
  try {
    const response = await eventbriteAPI.get('/events/search/', {
      params: {
        'location.latitude': latitude,
        'location.longitude': longitude,
        'location.within': `${radiusMiles}mi`,
        'start_date.range_start': new Date().toISOString(),
        sort_by: 'distance',
        expand: 'venue,ticket_availability',
      },
    });

    return {
      success: true,
      events: response.data.events || [],
      pagination: response.data.pagination || {},
    };
  } catch (error: any) {
    console.error('Eventbrite API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error_description || 'Failed to fetch nearby events',
      events: [],
    };
  }
}

/**
 * Get events by category
 * Categories: https://www.eventbrite.com/platform/api#/reference/category/list
 */
export async function getEventsByCategory(categoryId: string, params: EventSearchParams = {}) {
  return searchEvents({
    ...params,
    categories: categoryId,
  });
}

/**
 * Get user's favorite events (requires user OAuth token)
 * For MVP, this returns empty - implement OAuth flow later
 */
export async function getUserFavorites(userToken?: string) {
  if (!userToken) {
    return {
      success: false,
      error: 'User authentication required',
      events: [],
    };
  }

  // TODO: Implement OAuth flow
  return {
    success: true,
    events: [],
  };
}

/**
 * Transform Eventbrite event to our app's event format
 */
export function transformEventbriteEvent(ebEvent: EventbriteEvent) {
  return {
    id: ebEvent.id,
    title: ebEvent.name.text,
    description: ebEvent.description.text,
    start_time: ebEvent.start.local,
    end_time: ebEvent.end?.local,
    cover_image_url: ebEvent.logo?.original?.url || null,
    is_free: ebEvent.is_free,
    price_min: ebEvent.ticket_availability?.minimum_ticket_price?.major_value || null,
    price_max: ebEvent.ticket_availability?.maximum_ticket_price?.major_value || null,
    external_url: ebEvent.url,
    category: ebEvent.category_id || null,
    venue: ebEvent.venue ? {
      id: ebEvent.venue.id,
      name: ebEvent.venue.name,
      address: [
        ebEvent.venue.address.address_1,
        ebEvent.venue.address.city,
        ebEvent.venue.address.region
      ].filter(Boolean).join(', '),
      city: ebEvent.venue.address.city || '',
      latitude: parseFloat(ebEvent.venue.address.latitude || '0'),
      longitude: parseFloat(ebEvent.venue.address.longitude || '0'),
    } : null,
  };
}

/**
 * Sync Eventbrite events to our Supabase database
 * Call this periodically or on-demand
 */
export async function syncEventsToDatabase(supabase: any, events: EventbriteEvent[]) {
  try {
    const transformedEvents = events.map(transformEventbriteEvent);
    
    // Insert venues first
    const venues = transformedEvents
      .filter(e => e.venue)
      .map(e => e.venue);
    
    if (venues.length > 0) {
      await supabase
        .from('venues')
        .upsert(venues, {
          onConflict: 'id',
          ignoreDuplicates: false,
        });
    }

    // Insert events
    const eventsToInsert = transformedEvents.map(e => ({
      ...e,
      venue_id: e.venue?.id,
      venue: undefined, // Remove nested object
    }));

    const { data, error } = await supabase
      .from('events')
      .upsert(eventsToInsert, {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

    if (error) throw error;

    return {
      success: true,
      count: eventsToInsert.length,
    };
  } catch (error: any) {
    console.error('Database sync error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Export default instance
export default {
  searchEvents,
  getEventById,
  getEventsNearLocation,
  getEventsByCategory,
  getUserFavorites,
  transformEventbriteEvent,
  syncEventsToDatabase,
};
