/**
 * Ticketmaster API Integration
 * https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 * 
 * FREE TIER: 5,000 API calls per day
 * Coverage: 200,000+ events across US & Canada
 */

import axios from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY || '';
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

console.log('🎫 Ticketmaster API Key:', API_KEY ? `Loaded (${API_KEY.substring(0, 10)}...)` : '❌ MISSING');

export interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  url: string;
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
  classifications?: Array<{
    segment: { name: string };
    genre: { name: string };
  }>;
  _embedded?: {
    venues: Array<{
      name: string;
      city: { name: string };
      state?: { name: string };
      country: { name: string };
      location?: {
        latitude: string;
        longitude: string;
      };
      address?: {
        line1: string;
      };
    }>;
  };
}

interface SearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // in miles
  city?: string;
  stateCode?: string;
  countryCode?: string;
  keyword?: string;
  classificationName?: string; // Music, Sports, Arts & Theatre, etc.
  size?: number; // number of results (max 200)
  page?: number;
  sort?: 'date,asc' | 'date,desc' | 'relevance,desc' | 'distance,asc';
}

/**
 * Search for events
 */
export async function searchEvents(params: SearchParams = {}) {
  try {
    if (!API_KEY) {
      console.error('❌ Ticketmaster API key missing! Add EXPO_PUBLIC_TICKETMASTER_API_KEY to .env');
      return { success: false, error: 'API key not configured', events: [] };
    }

    const queryParams: any = {
      apikey: API_KEY,
      size: params.size || 50,
      page: params.page || 0,
      sort: params.sort || 'date,asc',
    };

    // Location-based search
    if (params.latitude && params.longitude) {
      queryParams.latlong = `${params.latitude},${params.longitude}`;
      queryParams.radius = params.radius || 25;
      queryParams.unit = 'miles';
    } else if (params.city) {
      queryParams.city = params.city;
      if (params.stateCode) queryParams.stateCode = params.stateCode;
    }

    // Filters
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.classificationName) queryParams.classificationName = params.classificationName;
    if (params.countryCode) queryParams.countryCode = params.countryCode;

    console.log('🎫 Ticketmaster API Request:', `${BASE_URL}/events.json`, queryParams);

    const response = await axios.get(`${BASE_URL}/events.json`, {
      params: queryParams,
      timeout: 10000,
    });

    const events = response.data._embedded?.events || [];
    const pagination = response.data.page || {};

    console.log(`✅ Ticketmaster: Found ${events.length} events`);

    return {
      success: true,
      events,
      pagination: {
        totalElements: pagination.totalElements,
        totalPages: pagination.totalPages,
        pageNumber: pagination.number,
        pageSize: pagination.size,
      },
    };
  } catch (error: any) {
    console.error('❌ Ticketmaster API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.errors?.[0]?.detail || error.message,
      events: [],
    };
  }
}

/**
 * Get events by city
 */
export async function getEventsByCity(city: string, stateCode?: string, countryCode: string = 'US') {
  console.log(`🏙️ Fetching events for ${city}, ${stateCode || countryCode}`);
  return searchEvents({
    city,
    stateCode,
    countryCode,
    size: 50,
    sort: 'date,asc',
  });
}

/**
 * Get events near location
 */
export async function getEventsNearLocation(latitude: number, longitude: number, radiusMiles: number = 25) {
  console.log(`📍 Fetching events near (${latitude}, ${longitude}) within ${radiusMiles} miles`);
  return searchEvents({
    latitude,
    longitude,
    radius: radiusMiles,
    size: 50,
    sort: 'distance,asc',
  });
}

/**
 * Get events by category
 */
export async function getEventsByCategory(
  category: string,
  page: number = 1,
  location?: { latitude: number; longitude: number }
) {
  // Map our category IDs to Ticketmaster classification names
  const categoryMap: { [key: string]: string } = {
    'all': '',
    '103': 'Music',
    '110': 'Arts & Theatre', // Closest to Food & Drink
    '105': 'Arts & Theatre',
    '108': 'Sports',
    '116': 'Miscellaneous',
    'music': 'Music',
    'sports': 'Sports',
    'arts': 'Arts & Theatre',
    'family': 'Family',
    'film': 'Film',
  };

  console.log(`🏷️ Fetching ${category} events`);

  return searchEvents({
    classificationName: categoryMap[category] || category,
    latitude: location?.latitude,
    longitude: location?.longitude,
    radius: 25,
    size: 50,
    page: page - 1, // Ticketmaster uses 0-based pagination
  });
}

/**
 * Transform Ticketmaster event to our app format
 */
export function transformTicketmasterEvent(tmEvent: TicketmasterEvent) {
  const venue = tmEvent._embedded?.venues?.[0];
  const image = tmEvent.images?.find(img => img.width >= 640)?.url || tmEvent.images?.[0]?.url;
  const priceRange = tmEvent.priceRanges?.[0];

  return {
    id: tmEvent.id,
    title: tmEvent.name,
    description: tmEvent.classifications?.[0]?.genre?.name || tmEvent.type || 'Event',
    start_time: `${tmEvent.dates.start.localDate}T${tmEvent.dates.start.localTime || '19:00:00'}`,
    category: tmEvent.classifications?.[0]?.segment?.name || 'Other',
    is_free: !priceRange || priceRange.min === 0,
    cover_image_url: image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    url: tmEvent.url,
    venue: {
      name: venue?.name || 'TBD',
      city: venue?.city?.name || 'TBD',
      latitude: parseFloat(venue?.location?.latitude || '0'),
      longitude: parseFloat(venue?.location?.longitude || '0'),
      address: venue?.address?.line1 || '',
    },
    priceMin: priceRange?.min,
    priceMax: priceRange?.max,
  };
}

export default {
  searchEvents,
  getEventsByCity,
  getEventsNearLocation,
  getEventsByCategory,
  transformTicketmasterEvent,
};
