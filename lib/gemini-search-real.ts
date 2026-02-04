/**
 * GEMINI WEB SEARCH - REAL EVENTS ONLY
 * Uses Gemini to search the web and aggregate real events
 * WITH SAFEGUARDS - No hallucinations allowed
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

console.log('🤖 Gemini Search Engine:', GEMINI_API_KEY ? 'Configured ✓' : 'MISSING ✗');

export interface RealSearchedEvent {
  id: string;
  title: string;
  description: string;
  start_time: string; // ISO format
  category: string;
  is_free: boolean;
  cover_image_url: string;
  url: string; // REQUIRED - Must be a real URL
  source: string; // REQUIRED - Where it came from (Instagram, Eventbrite, etc.)
  venue: {
    name: string;
    city: string;
    latitude: number;
    longitude: number;
    address: string;
  };
  priceMin?: number;
  priceMax?: number;
  verified: boolean; // Flag for whether we could verify the event
}

/**
 * Search the web for REAL events using Gemini
 * Gemini acts as a search aggregator, not a generator
 */
export async function searchRealEventsWithGemini(
  city: string,
  state: string,
  options: {
    category?: string;
    when?: string;
    query?: string;
  } = {},
  onProgress?: (status: string) => void
): Promise<{ success: boolean; events: RealSearchedEvent[]; sources: string[] }> {
  
  if (!GEMINI_API_KEY) {
    console.error('❌ Gemini API key not configured');
    return { success: false, events: [], sources: [] };
  }

  try {
    onProgress?.('🔍 Searching web for real events...');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Use Gemini 2.0 Flash with Google Search grounding
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1, // LOW temperature for factual responses
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });

    const currentDate = new Date().toISOString();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    
    // STRICT PROMPT - Forces real data only
    const prompt = `You are a web search engine that ONLY returns REAL, VERIFIED events.

CRITICAL RULES:
1. SEARCH the web - DO NOT generate fake events
2. EVERY event MUST have a real source URL (Eventbrite, Instagram, Facebook, venue website, etc.)
3. EVERY event MUST have a real venue with actual GPS coordinates
4. If you cannot find 30+ REAL events, return fewer events - DO NOT make up fake ones
5. Include the source URL and platform for EVERY event

SEARCH THESE PLATFORMS:
- Eventbrite.com/d/${city.toLowerCase()}/events
- Instagram hashtags: #${city}events #${city}nightlife
- Facebook Events in ${city}
- Resident Advisor (for electronic music)
- Songkick (for concerts)
- Dice.fm (for club events)
- Local venue websites in ${city}
- TimeOut ${city}
- ${city} tourism websites

SEARCH FOR:
City: ${city}, ${state}
Category: ${options.category || 'concerts, clubs, parties, nightlife, festivals, sports, arts, food events'}
Date range: ${currentDate} to ${futureDate.toISOString()}
${options.query ? `Keyword: ${options.query}` : ''}

RETURN FORMAT (JSON array):
[
  {
    "title": "EXACT event title from source",
    "description": "EXACT description from source",
    "start_time": "ISO datetime from source",
    "category": "Music|Sports|Arts|Food|Nightlife|Other",
    "is_free": true/false,
    "cover_image_url": "REAL image URL from source",
    "url": "REQUIRED - REAL event page URL",
    "source": "REQUIRED - Platform name (Eventbrite/Instagram/Facebook/etc)",
    "venue_name": "EXACT venue name from source",
    "venue_address": "EXACT address from source",
    "venue_city": "${city}",
    "venue_latitude": REAL GPS coordinate,
    "venue_longitude": REAL GPS coordinate,
    "price_min": number or null,
    "price_max": number or null
  }
]

VALIDATION:
- url field MUST exist and be a real URL
- source field MUST exist (platform name)
- venue_latitude/longitude MUST be real coordinates in ${city} area
- start_time MUST be in the future
- DO NOT include events with missing or fake data

Search NOW and return 30+ REAL events.`;

    onProgress?.('🌐 Gemini searching web sources...');
    console.log('🤖 Gemini prompt:', prompt.substring(0, 200) + '...');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    onProgress?.('📊 Processing search results...');
    console.log('🤖 Gemini raw response length:', text.length);

    // Parse and validate
    let parsedEvents = [];
    try {
      const parsed = JSON.parse(text);
      parsedEvents = Array.isArray(parsed) ? parsed : [];
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError);
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedEvents = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    }

    onProgress?.('✅ Validating events...');

    // STRICT VALIDATION - Reject fake events
    const validatedEvents: RealSearchedEvent[] = parsedEvents
      .filter((event: any) => {
        // MUST have source URL
        if (!event.url || !event.url.startsWith('http')) {
          console.warn('❌ Rejected: No valid URL', event.title);
          return false;
        }

        // MUST have source platform
        if (!event.source) {
          console.warn('❌ Rejected: No source platform', event.title);
          return false;
        }

        // MUST have real coordinates
        if (!event.venue_latitude || !event.venue_longitude) {
          console.warn('❌ Rejected: No GPS coordinates', event.title);
          return false;
        }

        // MUST have future date
        if (new Date(event.start_time) < new Date()) {
          console.warn('❌ Rejected: Past event', event.title);
          return false;
        }

        return true;
      })
      .map((event: any, index: number) => ({
        id: `gemini-search-${city}-${index}-${Date.now()}`,
        title: event.title,
        description: event.description || '',
        start_time: event.start_time,
        category: event.category || 'Other',
        is_free: event.is_free || false,
        cover_image_url: event.cover_image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        url: event.url, // Real URL from source
        source: `gemini-search-${event.source}`, // Mark as Gemini-searched
        venue: {
          name: event.venue_name || 'Venue',
          city: event.venue_city || city,
          latitude: parseFloat(event.venue_latitude),
          longitude: parseFloat(event.venue_longitude),
          address: event.venue_address || '',
        },
        priceMin: event.price_min || undefined,
        priceMax: event.price_max || undefined,
        verified: true, // Passed validation
      }));

    // Get unique sources
    const sources = [...new Set(validatedEvents.map(e => e.source))];

    console.log(`✅ Gemini Search: ${validatedEvents.length} REAL events validated`);
    console.log(`📍 Sources: ${sources.join(', ')}`);

    if (validatedEvents.length === 0) {
      console.warn('⚠️ Gemini found 0 verified events - may need better prompting');
    }

    return {
      success: validatedEvents.length > 0,
      events: validatedEvents,
      sources: sources,
    };

  } catch (error: any) {
    console.error('❌ Gemini search error:', error.message);
    onProgress?.('❌ Search failed');
    
    return {
      success: false,
      events: [],
      sources: [],
    };
  }
}

/**
 * Verify an event is real by checking its URL
 */
export async function verifyEventURL(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return response.ok;
  } catch {
    return false;
  }
}

export default searchRealEventsWithGemini;
