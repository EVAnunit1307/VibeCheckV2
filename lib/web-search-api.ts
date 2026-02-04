/**
 * WEB SEARCH API - Actually search Google/Bing for real events
 * Options: Google Custom Search, SerpAPI, Tavily AI
 */

// Option 1: Google Custom Search (100 free searches/day, then $5/1000)
const GOOGLE_SEARCH_KEY = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_KEY || '';
const GOOGLE_CX = process.env.EXPO_PUBLIC_GOOGLE_CX || ''; // Custom Search Engine ID

// Option 2: SerpAPI (100 free searches/month)
const SERPAPI_KEY = process.env.EXPO_PUBLIC_SERPAPI_KEY || '';

// Option 3: Tavily AI (1000 free searches/month)
const TAVILY_KEY = process.env.EXPO_PUBLIC_TAVILY_KEY || '';

console.log('🔍 Search APIs configured:');
console.log('  Google Custom Search:', GOOGLE_SEARCH_KEY && GOOGLE_CX ? '✓' : '✗');
console.log('  SerpAPI:', SERPAPI_KEY ? '✓' : '✗');
console.log('  Tavily AI:', TAVILY_KEY ? '✓' : '✗');

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string; // Domain name
}

/**
 * Search using Google Custom Search API
 */
async function searchWithGoogle(query: string): Promise<SearchResult[]> {
  if (!GOOGLE_SEARCH_KEY || !GOOGLE_CX) {
    console.warn('⚠️ Google Custom Search not configured');
    return [];
  }

  try {
    console.log('🔍 Google Search:', query);
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items) {
      console.warn('⚠️ No Google search results');
      return [];
    }
    
    const results: SearchResult[] = data.items.map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: new URL(item.link).hostname,
    }));
    
    console.log(`✅ Google found ${results.length} results`);
    return results;
  } catch (error: any) {
    console.error('❌ Google Search error:', error.message);
    return [];
  }
}

/**
 * Search using SerpAPI (Google results)
 */
async function searchWithSerpAPI(query: string): Promise<SearchResult[]> {
  if (!SERPAPI_KEY) {
    console.warn('⚠️ SerpAPI not configured');
    return [];
  }

  try {
    console.log('🔍 SerpAPI Search:', query);
    
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.organic_results) {
      console.warn('⚠️ No SerpAPI results');
      return [];
    }
    
    const results: SearchResult[] = data.organic_results.map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: new URL(item.link).hostname,
    }));
    
    console.log(`✅ SerpAPI found ${results.length} results`);
    return results;
  } catch (error: any) {
    console.error('❌ SerpAPI error:', error.message);
    return [];
  }
}

/**
 * Search using Tavily AI (optimized for LLMs)
 */
async function searchWithTavily(query: string): Promise<SearchResult[]> {
  if (!TAVILY_KEY) {
    console.warn('⚠️ Tavily AI not configured');
    return [];
  }

  try {
    console.log('🔍 Tavily AI Search:', query);
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_KEY,
        query: query,
        search_depth: 'advanced',
        max_results: 10,
        include_domains: [
          'eventbrite.com',
          'facebook.com/events',
          'dice.fm',
          'residentadvisor.net',
          'songkick.com',
          'timeout.com',
        ],
      }),
    });
    
    const data = await response.json();
    
    if (!data.results) {
      console.warn('⚠️ No Tavily results');
      return [];
    }
    
    const results: SearchResult[] = data.results.map((item: any) => ({
      title: item.title,
      url: item.url,
      snippet: item.content,
      source: new URL(item.url).hostname,
    }));
    
    console.log(`✅ Tavily found ${results.length} results`);
    return results;
  } catch (error: any) {
    console.error('❌ Tavily error:', error.message);
    return [];
  }
}

/**
 * Unified search - tries available APIs in priority order
 */
export async function searchWeb(query: string): Promise<SearchResult[]> {
  console.log(`\n🔍 WEB SEARCH: "${query}"`);
  
  // Try APIs in order of quality
  let results: SearchResult[] = [];
  
  // 1. Try Tavily (best for event discovery)
  if (TAVILY_KEY) {
    results = await searchWithTavily(query);
    if (results.length > 0) return results;
  }
  
  // 2. Try SerpAPI (Google results)
  if (SERPAPI_KEY) {
    results = await searchWithSerpAPI(query);
    if (results.length > 0) return results;
  }
  
  // 3. Try Google Custom Search
  if (GOOGLE_SEARCH_KEY && GOOGLE_CX) {
    results = await searchWithGoogle(query);
    if (results.length > 0) return results;
  }
  
  console.warn('⚠️ No search APIs configured or all failed');
  return [];
}

/**
 * Search for events in a specific city
 */
export async function searchEventsInCity(
  city: string,
  state: string,
  category?: string
): Promise<SearchResult[]> {
  const queries = [
    `${city} ${state} upcoming events ${category || 'concerts nightlife festivals'}`,
    `things to do in ${city} ${state} tonight this week`,
    `${city} ${state} event calendar ${category || 'music parties clubs'}`,
  ];
  
  const allResults: SearchResult[] = [];
  
  for (const query of queries) {
    const results = await searchWeb(query);
    allResults.push(...results);
  }
  
  // Deduplicate by URL
  const uniqueResults = Array.from(
    new Map(allResults.map(r => [r.url, r])).values()
  );
  
  console.log(`✅ Total unique search results: ${uniqueResults.length}`);
  return uniqueResults;
}

export default searchWeb;
