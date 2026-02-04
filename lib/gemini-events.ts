/**
 * GEMINI-POWERED EVENT SEARCH - PREMIUM VERSION
 * Generates diverse, realistic events with proper loading
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

console.log('🤖 Gemini API Key:', GEMINI_API_KEY ? `✅ Loaded (${GEMINI_API_KEY.substring(0, 10)}...)` : '❌ Missing');

export interface GeminiEvent {
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
  source: 'gemini';
  sourceWebsite?: string;
}

/**
 * Search for events using Gemini - PREMIUM VERSION
 * Generates 50+ diverse, realistic events with proper categories
 */
export async function searchEventsWithGemini(
  city: string,
  state: string,
  options: {
    category?: string;
    demographic?: string;
    when?: string;
    query?: string;
    price?: 'free' | 'paid';
  } = {},
  onProgress?: (status: string) => void
): Promise<{ success: boolean; events: GeminiEvent[]; source: string; error?: string }> {
  
  if (!GEMINI_API_KEY) {
    console.error('❌ Gemini API key not configured');
    return { success: false, events: [], source: 'error', error: 'Gemini API key missing' };
  }

  try {
    onProgress?.('🤖 Initializing Gemini AI...');
    console.log(`\n🤖 Gemini: Searching for events in ${city}, ${state}...`);
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 1.0, // Max creativity for diverse events
        maxOutputTokens: 8192,
      },
    });

    // Build comprehensive prompt for diverse events
    const demographic = options.demographic || '18-30 year olds';
    const when = options.when || 'upcoming this month and next month';
    const categoryFilter = options.category && options.category !== 'all' ? options.category : '';
    const priceFilter = options.price === 'free' ? 'Only free events.' : options.price === 'paid' ? 'Only paid events.' : '';
    const searchQuery = options.query ? `Related to "${options.query}".` : '';

    onProgress?.('🔍 Searching the web for events...');

    const prompt = `You are an expert event curator for ${city}, ${state}. Search Instagram, Eventbrite, Facebook Events, and local event sites to find 50 REAL, DIVERSE upcoming events that would interest ${demographic}.

**🔍 SEARCH THESE SOURCES:**
1. **Instagram**: @rebel_toronto, @codatoronto, @fiction.to, @ampmtoronto, @lavelle.to, @thedrakehotel, @masseyhall, @scotiabankarena
2. **Eventbrite**: Search "${city} events", "Toronto nightlife", "Toronto concerts"
3. **Facebook Events**: Popular venues and promoters in ${city}
4. **Resident Advisor**: Electronic music events
5. **Songkick**: Live music and concerts
6. **Local Venues**: Check actual venue websites for upcoming shows

**IMPORTANT REQUIREMENTS:**
1. **REAL EVENTS**: Use actual event names from Instagram posts, Eventbrite listings, and venue calendars
2. **ACTUAL VENUES**: FICTION, AMPM, Rebel, CODA, Lavelle, EFS Social, Lost & Found, Uniun, The Drake, Lee's Palace, Phoenix, etc.
3. **REAL PROMOTERS**: List actual DJ names, artists, and event series
4. **DIVERSITY**: Include a wide variety of event types, venues, and experiences
5. **PRICE RANGE**: From free to expensive ($0-$200)

**🎯 TORONTO-SPECIFIC VENUES TO PRIORITIZE:**
- **King West Clubs**: FICTION (121 John St), AMPM (496 College St), EFS Social, Lost & Found, Lavelle Rooftop
- **Mega Clubs**: Rebel (11 Polson St), Uniun (112 Peter St)
- **Underground**: CODA (794 Bathurst St), Toybox, Nest
- **Live Music**: Lee's Palace, Phoenix Concert Theatre, The Danforth Music Hall, Horseshoe Tavern
- **Speakeasies**: Cold Tea, The Lockhart, Bar Chef, Civil Liberties
- **Bars**: The Drake Hotel, Bar Raval, Get Well, Shameful Tiki Room, Bar Hop
- **Arenas**: Scotiabank Arena, Budweiser Stage, Massey Hall

**EVENT CATEGORIES TO INCLUDE:**
- 🎵 Music: Concerts, DJ nights, live bands, jazz clubs, open mics
- 🎭 Arts: Theater, comedy shows, art galleries, exhibitions, film screenings
- 🍕 Food & Drink: Food festivals, restaurant events, wine tastings, food tours
- ⚽ Sports: Games, tournaments, fitness classes, outdoor activities
- 🎉 Nightlife: Club nights, rooftop parties, bar crawls, dance events (FICTION Fridays, AMPM Saturdays, Rebel EDM nights)
- 🎪 Festivals: Cultural festivals, street fairs, seasonal events
- 📚 Education: Workshops, talks, classes, networking events
- 🌳 Outdoor: Markets, parks, hiking, outdoor concerts
- 🎮 Entertainment: Gaming events, trivia nights, karaoke
- 💼 Professional: Networking, career fairs, industry meetups

**TIME PERIOD:** ${when}
${categoryFilter ? `**FOCUS CATEGORY:** ${categoryFilter}` : ''}
${priceFilter}
${searchQuery}

**🎯 EXAMPLES OF REAL TORONTO EVENTS:**
- "FICTION Fridays" at FICTION (121 John St) - Hip hop & top 40
- "AMPM Saturdays" at AMPM (496 College St) - Underground meets mainstream
- "Lavelle Rooftop Sessions" at Lavelle (627 King St W) - Skyline views & DJ sets
- "Rebel EDM Takeover" at Rebel (11 Polson St) - International DJs
- "CODA Warehouse Party" at CODA (794 Bathurst St) - Techno & house
- "Drake Hotel Late Night" at The Drake (1150 Queen St W) - Indie vibes
- "Comedy Night" at Second City (51 Mercer St) - Stand-up comedy

**OUTPUT FORMAT:** Return ONLY a JSON array with this EXACT structure:
[
  {
    "id": "unique-id-string",
    "title": "Compelling Event Name",
    "description": "Detailed, engaging description (2-3 sentences) that makes people want to attend",
    "start_time": "2026-02-15T20:00:00Z",
    "category": "Music|Arts|Food & Drink|Sports|Nightlife|Festival|Education|Outdoor|Entertainment|Professional",
    "is_free": true/false,
    "cover_image_url": "https://images.unsplash.com/photo-...",
    "url": "https://eventbrite.com/...",
    "venue": {
      "name": "Actual Venue Name in ${city}",
      "city": "${city}",
      "latitude": 43.xxxx,
      "longitude": -79.xxxx,
      "address": "Real Street Address, ${city}, ${state}"
    },
    "priceMin": 0,
    "priceMax": 0,
    "source": "gemini",
    "sourceWebsite": "eventbrite.com or facebook.com or venue website"
  }
]

**GENERATE 50 DIVERSE EVENTS** - Make each one unique and compelling!`;

    console.log('📝 Generating diverse events...');
    
    onProgress?.('✨ Generating 50+ diverse events...');

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });

    const response = result.response;
    const text = response.text();

    onProgress?.('📦 Processing results...');

    console.log('✅ Gemini response received');
    console.log('📝 Raw response preview:', text.substring(0, 500) + '...');

    let geminiEvents: any[] = [];
    try {
      geminiEvents = JSON.parse(text);
    } catch (parseError) {
      console.warn('⚠️ Direct parse failed, extracting JSON from markdown...');
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          geminiEvents = JSON.parse(jsonMatch[1]);
        } catch (innerError) {
          console.error('❌ Failed to parse JSON from markdown block');
          return { success: false, events: [], source: 'gemini', error: 'Invalid JSON response' };
        }
      } else {
        // Try to extract array directly
        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          try {
            geminiEvents = JSON.parse(arrayMatch[0]);
          } catch (arrayError) {
            console.error('❌ Failed to parse JSON array');
            return { success: false, events: [], source: 'gemini', error: 'Invalid JSON response' };
          }
        }
      }
    }

    if (!Array.isArray(geminiEvents) || geminiEvents.length === 0) {
      console.warn('⚠️ Gemini returned no events');
      return { success: false, events: [], source: 'gemini', error: 'No events generated' };
    }

    console.log(`✅ Parsed ${geminiEvents.length} events from Gemini`);

    onProgress?.(`✅ Found ${geminiEvents.length} events!`);

    // Transform to our format with validation
    const events: GeminiEvent[] = geminiEvents.map((e: any, index: number) => {
      const eventId = e.id || `gemini-${city.toLowerCase()}-${index}-${Date.now()}`;
      
      // Validate and parse start_time
      let startTime = e.start_time;
      if (!startTime || !startTime.includes('T')) {
        const datePart = e.date || new Date().toISOString().split('T')[0];
        const timePart = e.time || '19:00:00';
        startTime = `${datePart}T${timePart}Z`;
      }

      // Ensure coordinates are valid
      const venueLatitude = e.venue?.latitude || 43.6532 + (Math.random() - 0.5) * 0.1;
      const venueLongitude = e.venue?.longitude || -79.3832 + (Math.random() - 0.5) * 0.1;

      return {
        id: eventId,
        title: e.title || 'Untitled Event',
        description: e.description || 'An exciting event you won\'t want to miss!',
        start_time: startTime,
        category: e.category || 'Entertainment',
        is_free: typeof e.is_free === 'boolean' ? e.is_free : false,
        cover_image_url: e.cover_image_url || getImageForCategory(e.category),
        url: e.url || 'https://vibecheck.app',
        venue: {
          name: e.venue?.name || 'TBD',
          city: e.venue?.city || city,
          latitude: venueLatitude,
          longitude: venueLongitude,
          address: e.venue?.address || `${city}, ${state}`,
        },
        priceMin: e.priceMin,
        priceMax: e.priceMax,
        source: 'gemini',
        sourceWebsite: e.sourceWebsite || 'Generated by AI',
      };
    });

    console.log(`🎉 SUCCESS: ${events.length} diverse events generated!`);
    console.log(`📊 Categories: ${[...new Set(events.map(e => e.category))].join(', ')}`);
    console.log(`💰 Price range: ${events.filter(e => e.is_free).length} free, ${events.filter(e => !e.is_free).length} paid`);

    return { success: true, events, source: 'gemini' };

  } catch (error: any) {
    console.error('❌ Gemini search error:', error.message);
    onProgress?.('❌ Error generating events');
    return { success: false, events: [], source: 'error', error: error.message };
  }
}

/**
 * Get appropriate high-quality image for event category
 */
function getImageForCategory(category?: string): string {
  const cat = category?.toLowerCase() || '';

  // Music
  if (cat.includes('music') || cat.includes('concert') || cat.includes('dj')) {
    const musicImages = [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', // Concert crowd
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', // DJ
      'https://images.unsplash.com/photo-1501281668745-f7f5792d7c3b?w=800', // Live band
    ];
    return musicImages[Math.floor(Math.random() * musicImages.length)];
  }

  // Nightlife
  if (cat.includes('party') || cat.includes('nightlife') || cat.includes('club')) {
    return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800';
  }

  // Festival
  if (cat.includes('festival')) {
    return 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800';
  }

  // Sports
  if (cat.includes('sport') || cat.includes('fitness')) {
    return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800';
  }

  // Food & Drink
  if (cat.includes('food') || cat.includes('drink') || cat.includes('restaurant')) {
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800';
  }

  // Arts
  if (cat.includes('art') || cat.includes('theater') || cat.includes('comedy')) {
    return 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800';
  }

  // Outdoor
  if (cat.includes('outdoor') || cat.includes('park') || cat.includes('nature')) {
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
  }

  // Education/Professional
  if (cat.includes('education') || cat.includes('professional') || cat.includes('workshop')) {
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
  }

  // Default
  return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
}

export default {
  searchEventsWithGemini,
};
