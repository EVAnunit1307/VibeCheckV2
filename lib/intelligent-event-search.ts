/**
 * INTELLIGENT EVENT SEARCH - Complete Pipeline
 * 1. Search web for event pages (Google/SerpAPI/Tavily)
 * 2. Scrape those pages for content
 * 3. Use Gemini to intelligently parse scraped data
 * 4. Combine with direct API results (Ticketmaster, etc.)
 */

import { searchEventsInCity } from './web-search-api';
import { scrapeMultiplePages } from './web-scraper';
import { parseScrapedDataWithGemini } from './gemini-parser';
import { fetchRealEvents } from './events-api-real';

export interface IntelligentSearchResult {
  id: string;
  title: string;
  description: string;
  start_time: string;
  category: string;
  is_free: boolean;
  cover_image_url: string;
  url: string;
  source: string;
  venue: {
    name: string;
    city: string;
    latitude: number;
    longitude: number;
    address: string;
  };
  priceMin?: number;
  priceMax?: number;
}

/**
 * Complete intelligent search pipeline
 */
export async function intelligentEventSearch(
  city: string,
  state: string,
  latitude: number,
  longitude: number,
  options: {
    category?: string;
    onProgress?: (status: string) => void;
  } = {}
): Promise<{ success: boolean; events: IntelligentSearchResult[]; sources: string[] }> {
  
  const { category, onProgress } = options;
  const allEvents: IntelligentSearchResult[] = [];
  const sources: string[] = [];
  
  console.log('\n🚀 INTELLIGENT EVENT SEARCH PIPELINE');
  console.log('City:', city, state);
  console.log('Category:', category || 'all');
  
  try {
    // STEP 1: Search web for event pages
    onProgress?.('🔍 Step 1: Searching web for event pages...');
    console.log('\n📍 STEP 1: Web Search');
    
    const searchResults = await searchEventsInCity(city, state, category);
    console.log(`✅ Found ${searchResults.length} event pages`);
    
    if (searchResults.length > 0) {
      sources.push('Web Search');
      
      // STEP 2: Scrape event pages
      onProgress?.('📥 Step 2: Scraping event pages...');
      console.log('\n📄 STEP 2: Scraping');
      
      // Limit to top 10 results to avoid overwhelming
      const topResults = searchResults.slice(0, 10);
      const scrapedData = await scrapeMultiplePages(
        topResults.map(r => r.url)
      );
      console.log(`✅ Scraped ${scrapedData.length} pages`);
      
      if (scrapedData.length > 0) {
        // STEP 3: Parse with Gemini
        onProgress?.('🤖 Step 3: Gemini parsing scraped data...');
        console.log('\n🤖 STEP 3: Gemini Parsing');
        
        const parsedEvents = await parseScrapedDataWithGemini(scrapedData, city);
        console.log(`✅ Gemini extracted ${parsedEvents.length} events`);
        
        // Convert to standard format
        parsedEvents.forEach((event, index) => {
          allEvents.push({
            id: `intelligent-${city}-${index}-${Date.now()}`,
            title: event.title,
            description: event.description,
            start_time: event.start_time,
            category: event.category,
            is_free: event.is_free,
            cover_image_url: event.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
            url: event.source_url,
            source: 'web-scraped',
            venue: {
              name: event.venue_name,
              city: event.venue_city,
              latitude: event.venue_latitude || latitude,
              longitude: event.venue_longitude || longitude,
              address: event.venue_address,
            },
            priceMin: event.price_min,
            priceMax: event.price_max,
          });
        });
        
        sources.push('Scraped + Parsed');
      }
    }
    
    // STEP 4: Add direct API results (Ticketmaster, Eventbrite)
    onProgress?.('🎫 Step 4: Fetching from Ticketmaster & APIs...');
    console.log('\n🎟️ STEP 4: Direct APIs');
    
    const apiResult = await fetchRealEvents(latitude, longitude, 25, category);
    
    if (apiResult.success && apiResult.events.length > 0) {
      console.log(`✅ APIs: ${apiResult.events.length} events`);
      allEvents.push(...(apiResult.events as any));
      sources.push(...apiResult.sources);
    }
    
    // STEP 5: Deduplicate
    onProgress?.('🔄 Step 5: Removing duplicates...');
    console.log('\n🔄 STEP 5: Deduplication');
    
    const uniqueEvents = deduplicateEvents(allEvents);
    console.log(`✅ ${uniqueEvents.length} unique events (removed ${allEvents.length - uniqueEvents.length} duplicates)`);
    
    // STEP 6: Sort by date
    uniqueEvents.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    
    console.log('\n✅ PIPELINE COMPLETE');
    console.log(`📊 Total events: ${uniqueEvents.length}`);
    console.log(`📍 Sources: ${[...new Set(sources)].join(', ')}`);
    
    return {
      success: uniqueEvents.length > 0,
      events: uniqueEvents,
      sources: [...new Set(sources)],
    };
    
  } catch (error: any) {
    console.error('❌ Pipeline error:', error.message);
    return {
      success: false,
      events: [],
      sources: [],
    };
  }
}

/**
 * Remove duplicate events
 */
function deduplicateEvents(events: IntelligentSearchResult[]): IntelligentSearchResult[] {
  const seen = new Set<string>();
  return events.filter(event => {
    const key = `${event.title.toLowerCase().trim()}_${event.venue.name.toLowerCase().trim()}_${event.start_time.substring(0, 10)}`;
    if (seen.has(key)) {
      console.log('🔄 Duplicate removed:', event.title);
      return false;
    }
    seen.add(key);
    return true;
  });
}

export default intelligentEventSearch;
