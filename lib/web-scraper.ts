/**
 * WEB SCRAPER - Extract event data from URLs
 * Scrapes Eventbrite, Facebook Events, venue pages, etc.
 */

export interface ScrapedEventData {
  url: string;
  title?: string;
  description?: string;
  date?: string;
  venue?: string;
  price?: string;
  imageUrl?: string;
  rawHtml?: string; // For Gemini to parse
  success: boolean;
}

/**
 * Fetch webpage content (CORS-free using proxy if needed)
 */
async function fetchPageContent(url: string): Promise<string | null> {
  try {
    console.log('📥 Fetching:', url);
    
    // Try direct fetch first
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      if (response.ok) {
        const html = await response.text();
        console.log(`✅ Fetched ${html.length} chars from ${url}`);
        return html;
      }
    } catch (directError) {
      console.log('⚠️ Direct fetch failed, trying CORS proxy...');
    }
    
    // If CORS blocked, use a proxy (for development only)
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const html = await response.text();
      console.log(`✅ Fetched via proxy: ${html.length} chars`);
      return html;
    }
    
    return null;
  } catch (error: any) {
    console.error('❌ Fetch error:', error.message);
    return null;
  }
}

/**
 * Extract text content from HTML (simple parser)
 */
function extractTextFromHtml(html: string): string {
  // Remove scripts and styles
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Extract structured data from HTML (JSON-LD, Open Graph, meta tags)
 */
function extractStructuredData(html: string): any {
  const data: any = {};
  
  // Try to find JSON-LD (schema.org structured data)
  const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      console.log('✅ Found JSON-LD structured data');
      return jsonData;
    } catch (e) {
      console.warn('⚠️ Could not parse JSON-LD');
    }
  }
  
  // Extract Open Graph tags
  const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
  if (ogTitle) data.title = ogTitle[1];
  
  const ogDescription = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
  if (ogDescription) data.description = ogDescription[1];
  
  const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
  if (ogImage) data.imageUrl = ogImage[1];
  
  return Object.keys(data).length > 0 ? data : null;
}

/**
 * Scrape a single event page
 */
export async function scrapeEventPage(url: string): Promise<ScrapedEventData> {
  console.log('\n📄 Scraping event page:', url);
  
  const html = await fetchPageContent(url);
  
  if (!html) {
    return { url, success: false };
  }
  
  // Extract structured data
  const structured = extractStructuredData(html);
  
  // Extract clean text (first 5000 chars for Gemini to parse)
  const text = extractTextFromHtml(html).substring(0, 5000);
  
  return {
    url,
    title: structured?.title || structured?.name,
    description: structured?.description,
    date: structured?.startDate,
    venue: structured?.location?.name,
    imageUrl: structured?.image || structured?.imageUrl,
    rawHtml: text, // Cleaned text for Gemini to parse
    success: true,
  };
}

/**
 * Scrape multiple event pages in parallel
 */
export async function scrapeMultiplePages(
  urls: string[],
  maxConcurrent: number = 5
): Promise<ScrapedEventData[]> {
  console.log(`\n📄 Scraping ${urls.length} pages...`);
  
  const results: ScrapedEventData[] = [];
  
  // Process in batches to avoid overwhelming the browser
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(url => scrapeEventPage(url))
    );
    results.push(...batchResults);
    
    console.log(`✅ Scraped batch ${Math.floor(i / maxConcurrent) + 1}`);
  }
  
  const successful = results.filter(r => r.success);
  console.log(`✅ Successfully scraped ${successful.length}/${urls.length} pages`);
  
  return successful;
}

export default scrapeEventPage;
