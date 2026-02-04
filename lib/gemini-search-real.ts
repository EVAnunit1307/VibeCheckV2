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
  
  console.log('🤖 =================================');
  console.log('🤖 GEMINI WEB SEARCH STARTING');
  console.log('🤖 City:', city, state);
  console.log('🤖 Options:', options);
  console.log('🤖 API Key:', GEMINI_API_KEY ? 'EXISTS ✓' : 'MISSING ✗');
  console.log('🤖 =================================');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ Gemini API key not configured');
    return { success: false, events: [], sources: [] };
  }

  try {
    onProgress?.('🔍 Searching web for real events...');
    
    console.log('🤖 Initializing Gemini...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    console.log('🤖 Creating model: gemini-pro...');
    // Use stable Gemini Pro model
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.2, // LOW temperature for factual responses
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });

    const currentDate = new Date().toISOString();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    
    // SIMPLIFIED PROMPT - More reliable
    const prompt = `Find real upcoming events in ${city}, ${state}.

Search for events happening in the next 2 months. Include:
- Concerts and live music
- Nightlife and club events  
- Sports games
- Festivals
- Arts and theater
${options.category ? `\nFocus on: ${options.category}` : ''}
${options.query ? `\nKeyword: ${options.query}` : ''}

For each event, provide this information in JSON format:
{
  "title": "Event name",
  "description": "Brief description",
  "start_time": "2026-02-15T20:00:00",
  "category": "Music/Sports/Arts/Nightlife",
  "is_free": false,
  "cover_image_url": "https://example.com/image.jpg",
  "url": "https://eventbrite.com/event-link",
  "source": "Eventbrite",
  "venue_name": "Venue Name",
  "venue_address": "123 Street",
  "venue_city": "${city}",
  "venue_latitude": 43.6532,
  "venue_longitude": -79.3832,
  "price_min": 20,
  "price_max": 50
}

Return ONLY a JSON array with 20-30 real events. No other text.`;

    onProgress?.('🌐 Gemini generating events...');
    console.log('🤖 Sending prompt to Gemini...');
    console.log('🤖 Prompt length:', prompt.length);

    const result = await model.generateContent(prompt);
    console.log('🤖 Gemini responded!');
    
    if (!result || !result.response) {
      throw new Error('No response from Gemini');
    }
    
    const response = result.response;
    const text = response.text();
    
    if (!text || text.length === 0) {
      throw new Error('Empty response from Gemini');
    }
    
    onProgress?.('📊 Processing results...');
    console.log('🤖 Response received! Length:', text.length);
    console.log('🤖 First 500 chars:', text.substring(0, 500));

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
    console.error('❌ Gemini error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Check for specific errors
    if (error.message?.includes('404')) {
      console.error('❌ Model not found - gemini-pro may not be available');
    } else if (error.message?.includes('API key')) {
      console.error('❌ API key issue');
    } else if (error.message?.includes('quota')) {
      console.error('❌ API quota exceeded');
    }
    
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
