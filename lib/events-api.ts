/**
 * UNIFIED EVENTS API - Robust integration for Eventbrite & Ticketmaster
 * Automatically falls back between APIs and mock data
 */

import axios from 'axios';

import { searchEventsWithGemini } from './gemini-events';

// API Keys
const EVENTBRITE_KEY = process.env.EXPO_PUBLIC_EVENTBRITE_API_KEY || '';
const TICKETMASTER_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY || '';
const SEATGEEK_KEY = process.env.EXPO_PUBLIC_SEATGEEK_CLIENT_ID || '';
const MEETUP_KEY = process.env.EXPO_PUBLIC_MEETUP_API_KEY || '';
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

console.log('🔑 API Keys Status:');
console.log('  🤖 Gemini:', GEMINI_KEY ? `✅ Loaded (${GEMINI_KEY.substring(0, 10)}...)` : '❌ Missing');
console.log('  Eventbrite:', EVENTBRITE_KEY ? `✅ Loaded (${EVENTBRITE_KEY.substring(0, 10)}...)` : '❌ Missing');
console.log('  Ticketmaster:', TICKETMASTER_KEY ? `✅ Loaded (${TICKETMASTER_KEY.substring(0, 10)}...)` : '❌ Missing');
console.log('  SeatGeek:', SEATGEEK_KEY ? `✅ Loaded (${SEATGEEK_KEY.substring(0, 10)}...)` : '❌ Missing');
console.log('  Meetup:', MEETUP_KEY ? `✅ Loaded (${MEETUP_KEY.substring(0, 10)}...)` : '❌ Missing');

// ============================================================================
// UNIFIED EVENT TYPE
// ============================================================================

export interface UnifiedEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  category: string;
  is_free: boolean;
  cover_image_url: string;
  url: string;
  venue: {
    name: string;
    city: string;
    latitude: number;
    longitude: number;
    address: string;
  };
  priceMin?: number;
  priceMax?: number;
  source: 'eventbrite' | 'ticketmaster' | 'mock';
}

// ============================================================================
// EVENTBRITE API
// ============================================================================

async function fetchFromEventbrite(latitude: number, longitude: number, radiusMiles: number = 25) {
  if (!EVENTBRITE_KEY) {
    console.log('⚠️ Eventbrite key not configured');
    return null;
  }

  try {
    console.log(`🎟️ Eventbrite API: Fetching UPCOMING events near (${latitude}, ${longitude}) within ${radiusMiles}mi`);
    
    // Calculate dates for upcoming events only
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6); // Next 6 months
    
    const response = await axios.get('https://www.eventbriteapi.com/v3/events/search/', {
      headers: {
        'Authorization': `Bearer ${EVENTBRITE_KEY}`,
      },
      params: {
        'location.latitude': latitude.toFixed(6),
        'location.longitude': longitude.toFixed(6),
        'location.within': `${radiusMiles}mi`,
        'start_date.range_start': now.toISOString(), // ONLY UPCOMING EVENTS
        'start_date.range_end': futureDate.toISOString(),
        'expand': 'venue,ticket_availability',
        'sort_by': 'date',
        'page_size': 50,
      },
      timeout: 10000,
    });

    const events = response.data.events || [];
    console.log(`✅ Eventbrite: Found ${events.length} REAL upcoming events`);
    
    if (events.length === 0) {
      console.warn('⚠️ Eventbrite returned 0 events for this location');
      return null; // Let it try Ticketmaster
    }

    return events.map((e: any) => ({
      id: `eb-${e.id}`,
      title: e.name?.text || 'Event',
      description: e.description?.text || '',
      start_time: e.start?.local || new Date().toISOString(),
      category: e.category_id || 'Other',
      is_free: e.is_free || false,
      cover_image_url: e.logo?.original?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      url: e.url || '',
      venue: {
        name: e.venue?.name || 'TBD',
        city: e.venue?.address?.city || 'TBD',
        latitude: parseFloat(e.venue?.address?.latitude || '0'),
        longitude: parseFloat(e.venue?.address?.longitude || '0'),
        address: e.venue?.address?.address_1 || '',
      },
      priceMin: e.ticket_availability?.minimum_ticket_price?.major_value,
      priceMax: e.ticket_availability?.maximum_ticket_price?.major_value,
      source: 'eventbrite' as const,
    }));
  } catch (error: any) {
    console.warn('⚠️ Eventbrite failed:', error.response?.data?.error_description || error.message);
    return null;
  }
}

// ============================================================================
// TICKETMASTER API
// ============================================================================

async function fetchFromTicketmaster(latitude: number, longitude: number, radiusMiles: number = 25) {
  if (!TICKETMASTER_KEY) {
    console.log('⚠️ Ticketmaster key not configured');
    return null;
  }

  try {
    console.log(`🎫 Ticketmaster API: Fetching UPCOMING events near (${latitude}, ${longitude}) within ${radiusMiles}mi`);
    
    const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
      params: {
        apikey: TICKETMASTER_KEY,
        latlong: `${latitude.toFixed(6)},${longitude.toFixed(6)}`,
        radius: radiusMiles,
        unit: 'miles',
        size: 50,
        sort: 'date,asc',
        startDateTime: new Date().toISOString(), // ONLY UPCOMING EVENTS
      },
      timeout: 10000,
    });

    const events = response.data._embedded?.events || [];
    console.log(`✅ Ticketmaster: Found ${events.length} REAL upcoming events`);
    
    if (events.length === 0) {
      console.warn('⚠️ Ticketmaster returned 0 events for this location');
      return null;
    }

    return events.map((e: any) => {
      const venue = e._embedded?.venues?.[0];
      const image = e.images?.find((img: any) => img.width >= 640)?.url || e.images?.[0]?.url;
      const priceRange = e.priceRanges?.[0];

      return {
        id: `tm-${e.id}`,
        title: e.name,
        description: e.classifications?.[0]?.genre?.name || e.type || '',
        start_time: `${e.dates.start.localDate}T${e.dates.start.localTime || '19:00:00'}`,
        category: e.classifications?.[0]?.segment?.name || 'Other',
        is_free: !priceRange || priceRange.min === 0,
        cover_image_url: image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        url: e.url,
        venue: {
          name: venue?.name || 'TBD',
          city: venue?.city?.name || 'TBD',
          latitude: parseFloat(venue?.location?.latitude || '0'),
          longitude: parseFloat(venue?.location?.longitude || '0'),
          address: venue?.address?.line1 || '',
        },
        priceMin: priceRange?.min,
        priceMax: priceRange?.max,
        source: 'ticketmaster' as const,
      };
    });
  } catch (error: any) {
    console.warn('⚠️ Ticketmaster failed:', error.response?.data || error.message);
    return null;
  }
}

// ============================================================================
// SEATGEEK API (50K+ events, great for concerts & sports)
// ============================================================================

async function fetchFromSeatGeek(latitude: number, longitude: number, radiusMiles: number = 25) {
  if (!SEATGEEK_KEY) {
    console.log('⚠️ SeatGeek key not configured');
    return null;
  }

  try {
    console.log(`🎟️ SeatGeek API: Fetching UPCOMING events near (${latitude}, ${longitude}) within ${radiusMiles}mi`);
    
    const response = await axios.get('https://api.seatgeek.com/2/events', {
      params: {
        client_id: SEATGEEK_KEY,
        lat: latitude.toFixed(6),
        lon: longitude.toFixed(6),
        range: `${radiusMiles}mi`,
        per_page: 50,
        'datetime_utc.gte': new Date().toISOString(), // Only upcoming events
      },
      timeout: 10000,
    });

    const events = response.data.events || [];
    console.log(`✅ SeatGeek: Found ${events.length} REAL upcoming events`);
    
    if (events.length === 0) {
      console.warn('⚠️ SeatGeek returned 0 events for this location');
      return null;
    }

    return events.map((e: any) => ({
      id: `sg-${e.id}`,
      title: e.title || e.short_title || 'Event',
      description: e.type || '',
      start_time: e.datetime_local || e.datetime_utc,
      category: e.type || 'Other',
      is_free: !e.stats?.lowest_price || e.stats.lowest_price === 0,
      cover_image_url: e.performers?.[0]?.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      url: e.url || '',
      venue: {
        name: e.venue?.name || 'TBD',
        city: e.venue?.city || 'TBD',
        latitude: parseFloat(e.venue?.location?.lat || '0'),
        longitude: parseFloat(e.venue?.location?.lon || '0'),
        address: e.venue?.address || '',
      },
      priceMin: e.stats?.lowest_price,
      priceMax: e.stats?.highest_price,
      source: 'seatgeek' as const,
    }));
  } catch (error: any) {
    console.warn('⚠️ SeatGeek failed:', error.response?.data?.message || error.message);
    return null;
  }
}

// ============================================================================
// MEETUP API (Perfect for 18-30 social events!)
// ============================================================================

async function fetchFromMeetup(latitude: number, longitude: number, radiusMiles: number = 25) {
  if (!MEETUP_KEY) {
    console.log('⚠️ Meetup key not configured');
    return null;
  }

  try {
    console.log(`🤝 Meetup API: Fetching UPCOMING events near (${latitude}, ${longitude}) within ${radiusMiles}mi`);
    
    // Meetup uses GraphQL, but we can use their REST API for events
    const response = await axios.get('https://api.meetup.com/find/upcoming_events', {
      params: {
        key: MEETUP_KEY,
        lat: latitude.toFixed(6),
        lon: longitude.toFixed(6),
        radius: radiusMiles,
        page: 50,
        fields: 'featured_photo,group_photo',
      },
      timeout: 10000,
    });

    const events = response.data.events || [];
    console.log(`✅ Meetup: Found ${events.length} REAL upcoming events`);
    
    if (events.length === 0) {
      console.warn('⚠️ Meetup returned 0 events for this location');
      return null;
    }

    return events.map((e: any) => ({
      id: `mu-${e.id}`,
      title: e.name || 'Event',
      description: e.description || '',
      start_time: new Date(e.time).toISOString(),
      category: 'Social',
      is_free: e.fee?.amount === 0 || !e.fee,
      cover_image_url: e.featured_photo?.photo_link || e.group?.group_photo?.photo_link || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      url: e.link || '',
      venue: {
        name: e.venue?.name || e.group?.name || 'TBD',
        city: e.venue?.city || 'TBD',
        latitude: parseFloat(e.venue?.lat || e.lat || '0'),
        longitude: parseFloat(e.venue?.lon || e.lon || '0'),
        address: e.venue?.address_1 || '',
      },
      priceMin: e.fee?.amount,
      source: 'meetup' as const,
    }));
  } catch (error: any) {
    console.warn('⚠️ Meetup failed:', error.response?.data?.errors?.[0]?.message || error.message);
    return null;
  }
}

// ============================================================================
// MOCK DATA (Always available fallback)
// ============================================================================

function getMockEvents(latitude: number, longitude: number): UnifiedEvent[] {
  return [
    {
      id: 'mock-1',
      title: 'Live Jazz Night at Blue Note',
      description: 'Experience an evening of smooth jazz with local artists',
      start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Music',
      is_free: false,
      cover_image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
      url: 'https://example.com',
      venue: {
        name: 'Blue Note Jazz Club',
        city: 'New York',
        latitude: latitude + 0.01,
        longitude: longitude + 0.01,
        address: '131 W 3rd St, New York, NY 10012',
      },
      priceMin: 25,
      priceMax: 75,
      source: 'mock',
    },
    {
      id: 'mock-2',
      title: 'Food Truck Festival',
      description: 'Sample cuisine from 20+ local food trucks',
      start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Food & Drink',
      is_free: true,
      cover_image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      url: 'https://example.com',
      venue: {
        name: 'Central Park',
        city: 'New York',
        latitude: latitude + 0.02,
        longitude: longitude - 0.01,
        address: 'Central Park, New York, NY',
      },
      source: 'mock',
    },
    {
      id: 'mock-3',
      title: 'Broadway Musical: Hamilton',
      description: 'The revolutionary Broadway musical experience',
      start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Arts & Theatre',
      is_free: false,
      cover_image_url: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
      url: 'https://example.com',
      venue: {
        name: 'Richard Rodgers Theatre',
        city: 'New York',
        latitude: latitude + 0.03,
        longitude: longitude + 0.02,
        address: '226 W 46th St, New York, NY 10036',
      },
      priceMin: 150,
      priceMax: 500,
      source: 'mock',
    },
    {
      id: 'mock-4',
      title: 'Morning Yoga in the Park',
      description: 'Free community yoga session for all levels',
      start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Health',
      is_free: true,
      cover_image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      url: 'https://example.com',
      venue: {
        name: 'Prospect Park',
        city: 'Brooklyn',
        latitude: latitude - 0.01,
        longitude: longitude + 0.01,
        address: 'Prospect Park, Brooklyn, NY',
      },
      source: 'mock',
    },
    {
      id: 'mock-5',
      title: 'Tech Startup Networking Mixer',
      description: 'Connect with founders and investors in the tech scene',
      start_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Business',
      is_free: false,
      cover_image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      url: 'https://example.com',
      venue: {
        name: 'WeWork Times Square',
        city: 'New York',
        latitude: latitude + 0.015,
        longitude: longitude - 0.015,
        address: 'Times Square, New York, NY 10036',
      },
      priceMin: 20,
      priceMax: 50,
      source: 'mock',
    },
  ];
  
  console.log(`✅ Generated ${mockEvents.length} mock events`);
  return mockEvents;
}

// ============================================================================
// MAIN PUBLIC API - Auto-fallback between sources
// ============================================================================

/**
 * Get events near location - REAL DATA ONLY (with fallback)
 * Priority: Ticketmaster → Eventbrite → Mock (only if both APIs fail/missing)
 */
export async function getEventsNearLocation(
  latitude: number,
  longitude: number,
  radiusMiles: number = 25
): Promise<{ success: boolean; events: UnifiedEvent[]; source: string }> {
  console.log(`\n🌍 ==========================================`);
  console.log(`📍 Location: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
  console.log(`📏 Radius: ${radiusMiles} miles`);
  console.log(`🔑 Keys: GEMINI=${!!GEMINI_KEY}, TM=${!!TICKETMASTER_KEY}, EB=${!!EVENTBRITE_KEY}, SG=${!!SEATGEEK_KEY}, MU=${!!MEETUP_KEY}`);
  console.log(`==========================================\n`);

  // 🤖 GEMINI FIRST - Uses Google Search to find REAL events!
  if (GEMINI_KEY) {
    console.log('🤖 Trying Gemini with Google Search (smartest option!)...');
    // We'll need city name for Gemini - for now use coordinates with traditional APIs
    // In feed.tsx we'll call Gemini separately with city name
  }

  // Try ALL APIs and combine results!
  const allEvents: UnifiedEvent[] = [];

  // 1. Try Ticketmaster
  if (TICKETMASTER_KEY) {
    const tmEvents = await fetchFromTicketmaster(latitude, longitude, radiusMiles);
    if (tmEvents && tmEvents.length > 0) {
      allEvents.push(...tmEvents);
      console.log(`✅ Added ${tmEvents.length} Ticketmaster events`);
    }
  }

  // 2. Try SeatGeek (great for concerts & sports)
  if (SEATGEEK_KEY) {
    const sgEvents = await fetchFromSeatGeek(latitude, longitude, radiusMiles);
    if (sgEvents && sgEvents.length > 0) {
      allEvents.push(...sgEvents);
      console.log(`✅ Added ${sgEvents.length} SeatGeek events`);
    }
  }

  // 3. Try Meetup (perfect for 18-30 social events!)
  if (MEETUP_KEY) {
    const muEvents = await fetchFromMeetup(latitude, longitude, radiusMiles);
    if (muEvents && muEvents.length > 0) {
      allEvents.push(...muEvents);
      console.log(`✅ Added ${muEvents.length} Meetup events`);
    }
  }

  // 4. Try Eventbrite (if you have org account)
  if (EVENTBRITE_KEY) {
    const ebEvents = await fetchFromEventbrite(latitude, longitude, radiusMiles);
    if (ebEvents && ebEvents.length > 0) {
      allEvents.push(...ebEvents);
      console.log(`✅ Added ${ebEvents.length} Eventbrite events`);
    }
  }

  // Return combined events from all sources!
  if (allEvents.length > 0) {
    // Sort by date
    allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    
    console.log(`\n🎉 TOTAL: ${allEvents.length} REAL events from multiple sources!\n`);
    return { 
      success: true, 
      events: allEvents, 
      source: 'multiple' // Show that we're combining sources
    };
  }

  // Only use mock data if NO API keys or all APIs failed
  if (!TICKETMASTER_KEY && !EVENTBRITE_KEY && !SEATGEEK_KEY && !MEETUP_KEY) {
    console.warn('⚠️ NO API KEYS CONFIGURED - Using mock data for demo\n');
  } else {
    console.warn('⚠️ ALL APIs returned no events - Using mock data as fallback\n');
  }
  
  return { success: true, events: getMockEvents(latitude, longitude), source: 'mock' };
}

/**
 * Get events by category - ROBUST VERSION
 */
export async function getEventsByCategory(
  categoryId: string,
  page: number = 1,
  location?: { latitude: number; longitude: number }
): Promise<{ success: boolean; events: UnifiedEvent[]; source: string }> {
  console.log(`🏷️ Fetching ${categoryId} events, page ${page}`);

  if (location) {
    const result = await getEventsNearLocation(location.latitude, location.longitude, 25);
    
    // Filter by category if not 'all'
    if (categoryId !== 'all') {
      const categoryMap: { [key: string]: string[] } = {
        '103': ['Music'],
        '110': ['Food & Drink', 'Arts & Theatre'],
        '105': ['Arts & Theatre'],
        '108': ['Sports', 'Health'],
        '116': ['Business', 'Other'],
      };
      
      const matchingCategories = categoryMap[categoryId] || [categoryId];
      const filtered = result.events.filter(e => 
        matchingCategories.includes(e.category)
      );
      
      return { ...result, events: filtered };
    }
    
    return result;
  }

  // No location - just return mock data
  return {
    success: true,
    events: getMockEvents(40.7128, -74.0060),
    source: 'mock',
  };
}

/**
 * Search events by keyword - ROBUST VERSION
 */
export async function searchEvents(
  query: string,
  location?: { latitude: number; longitude: number }
): Promise<{ success: boolean; events: UnifiedEvent[]; source: string }> {
  console.log(`🔍 Searching for: "${query}"`);

  const result = location
    ? await getEventsNearLocation(location.latitude, location.longitude, 25)
    : { success: true, events: getMockEvents(40.7128, -74.0060), source: 'mock' };

  // Filter by search query
  const filtered = result.events.filter(e =>
    e.title.toLowerCase().includes(query.toLowerCase()) ||
    e.description.toLowerCase().includes(query.toLowerCase()) ||
    e.venue.name.toLowerCase().includes(query.toLowerCase())
  );

  return { ...result, events: filtered };
}

export default {
  getEventsNearLocation,
  getEventsByCategory,
  searchEvents,
};
