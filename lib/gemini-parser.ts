/**
 * GEMINI PARSER - Use Gemini to intelligently parse scraped event data
 * Gemini reads the scraped HTML and extracts structured event information
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScrapedEventData } from './web-scraper';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export interface ParsedEvent {
  title: string;
  description: string;
  start_time: string; // ISO format
  end_time?: string;
  category: string;
  is_free: boolean;
  price_min?: number;
  price_max?: number;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_latitude?: number;
  venue_longitude?: number;
  image_url?: string;
  source_url: string;
  confidence: number; // 0-1 score of how confident the extraction was
}

/**
 * Use Gemini to parse scraped event data
 */
export async function parseScrapedDataWithGemini(
  scrapedData: ScrapedEventData[],
  city: string
): Promise<ParsedEvent[]> {
  
  if (!GEMINI_API_KEY) {
    console.error('❌ Gemini API key not configured');
    return [];
  }
  
  if (scrapedData.length === 0) {
    console.warn('⚠️ No scraped data to parse');
    return [];
  }
  
  try {
    console.log(`\n🤖 Parsing ${scrapedData.length} scraped pages with Gemini...`);
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.1, // Very low for factual extraction
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });
    
    // Build prompt with all scraped data
    const prompt = `You are an expert at extracting event information from web pages.

I will give you text content from ${scrapedData.length} event pages. Extract ONLY the factual information you can find.

RULES:
- ONLY extract information that is clearly present in the text
- If you cannot find a field, use null
- Dates must be in ISO format (2026-02-15T20:00:00)
- Prices: extract min and max if range is given
- Category: Music, Sports, Arts, Nightlife, Food, or Other
- DO NOT make up information

Expected city: ${city}

SCRAPED DATA:
${scrapedData.map((data, i) => `
--- Page ${i + 1} ---
URL: ${data.url}
Title: ${data.title || 'Not found'}
Description: ${data.description || 'Not found'}
Date: ${data.date || 'Not found'}
Venue: ${data.venue || 'Not found'}
Content: ${data.rawHtml?.substring(0, 1000) || 'Not available'}
`).join('\n')}

Return a JSON array with this exact structure:
[
  {
    "title": "Event title from page",
    "description": "Event description",
    "start_time": "2026-02-15T20:00:00",
    "end_time": null,
    "category": "Music",
    "is_free": false,
    "price_min": 20,
    "price_max": 50,
    "venue_name": "Venue name",
    "venue_address": "123 Street",
    "venue_city": "${city}",
    "venue_latitude": null,
    "venue_longitude": null,
    "image_url": "https://...",
    "source_url": "https://...",
    "confidence": 0.85
  }
]

Return ONLY the JSON array. No other text.`;

    console.log('🤖 Sending to Gemini for parsing...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('🤖 Gemini response length:', text.length);
    
    // Parse JSON
    let parsed;
    try {
      // Try direct parse
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[([\s\S]*?)\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    }
    
    const events: ParsedEvent[] = Array.isArray(parsed) ? parsed : [];
    
    // Filter out low confidence or missing data
    const validEvents = events.filter(event => {
      if (!event.title || !event.start_time || !event.venue_name) {
        console.warn('⚠️ Skipping event with missing required fields:', event.title);
        return false;
      }
      if (event.confidence && event.confidence < 0.5) {
        console.warn('⚠️ Skipping low confidence event:', event.title);
        return false;
      }
      return true;
    });
    
    console.log(`✅ Gemini parsed ${validEvents.length}/${events.length} valid events`);
    
    return validEvents;
    
  } catch (error: any) {
    console.error('❌ Gemini parsing error:', error.message);
    console.error('❌ Stack:', error.stack);
    return [];
  }
}

export default parseScrapedDataWithGemini;
