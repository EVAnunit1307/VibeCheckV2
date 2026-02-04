# Intelligent Event Search Setup

## 🚀 How It Works

VibeCheck now uses an **intelligent 5-step pipeline** to find real events:

```
1. 🔍 Web Search → Search Google/Bing for event pages
2. 📥 Scrape → Extract HTML from event pages  
3. 🤖 Parse → Gemini reads HTML and extracts structured data
4. 🎫 APIs → Add Ticketmaster/Eventbrite direct API results
5. ✅ Verify → Deduplicate and validate all events
```

## 🎯 The Result

- ✅ **REAL events** from actual web sources
- ✅ **REAL images** from event pages
- ✅ **REAL venues** with GPS coordinates
- ✅ **Verified** - no hallucinations
- ✅ **Comprehensive** - multiple sources combined

## 🔑 API Keys Needed

### Minimum Setup (Option A - Free)

**Just Ticketmaster:**
```bash
EXPO_PUBLIC_TICKETMASTER_API_KEY=your_key
```
- 200k+ events
- 5,000 free API calls/day
- Get key: https://developer.ticketmaster.com/

### Recommended Setup (Option B - Best Results)

**Ticketmaster + Tavily + Gemini:**
```bash
EXPO_PUBLIC_TICKETMASTER_API_KEY=your_ticketmaster_key
EXPO_PUBLIC_TAVILY_KEY=your_tavily_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

**Why these 3?**
- **Ticketmaster**: Direct event API (5k free/day)
- **Tavily AI**: Search for event pages (1k free/month) 🔥
- **Gemini**: Parse scraped event data (1.5k free/day)

**Get Keys:**
1. Ticketmaster: https://developer.ticketmaster.com/
2. Tavily: https://tavily.com/ (Email signup)
3. Gemini: https://makersuite.google.com/app/apikey

### Maximum Coverage (Option C - Pro)

Add even more sources:
```bash
# All of Option B, plus:
EXPO_PUBLIC_SERPAPI_KEY=your_serpapi_key  # 100 free/month
EXPO_PUBLIC_EVENTBRITE_API_KEY=your_eventbrite_key
EXPO_PUBLIC_SEATGEEK_CLIENT_ID=your_seatgeek_id
```

## 📋 Step-by-Step Setup

### 1. Get Tavily API Key (Best for events)

```
1. Go to: https://tavily.com/
2. Click "Get Started" / "Sign Up"
3. Enter your email
4. Check email for API key
5. Copy the key
```

Add to `.env`:
```bash
EXPO_PUBLIC_TAVILY_KEY=tvly-xxxxxxxxxxxxxxx
```

### 2. Get Gemini API Key

```
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
```

Add to `.env`:
```bash
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Already Have Ticketmaster

You already have this in your `.env`:
```bash
EXPO_PUBLIC_TICKETMASTER_API_KEY=7elxdku573FAK...
```

### 4. Restart Server

```bash
# Stop current server (Ctrl+C)
npx expo start --clear
```

## 🎬 What to Expect

After restarting, you'll see in the app:

```
🚀 Starting intelligent search...
🔍 Step 1: Searching web for event pages...
📥 Step 2: Scraping event pages...
🤖 Step 3: Gemini parsing scraped data...
🎫 Step 4: Fetching from Ticketmaster & APIs...
🔄 Step 5: Removing duplicates...
✅ Found 45 events from Web Search, Scraped + Parsed, Ticketmaster
```

## 🐛 Troubleshooting

### "No search APIs configured"

**Problem:** Missing API keys

**Solution:**
- Add at least Ticketmaster key
- Or add Tavily + Gemini for web search

### Tavily Signup Not Working

**Alternative:** Use SerpAPI instead

```bash
# Get key: https://serpapi.com/
EXPO_PUBLIC_SERPAPI_KEY=your_serpapi_key
```

### Still No Events?

**Check console (F12) for:**
- API key errors
- Quota exceeded
- Network errors
- Parsing errors

## 📊 Free Tier Limits

| API | Free Tier | Best For |
|-----|-----------|----------|
| Tavily AI | 1,000/month | Event discovery 🔥 |
| Gemini | 1,500/day | Parsing HTML |
| Ticketmaster | 5,000/day | Direct events |
| SerpAPI | 100/month | Google results |
| Google Custom Search | 100/day | Google results |

## 🎯 Recommended: Tavily

**Why Tavily is best:**
- ✅ Optimized for LLM/AI use cases
- ✅ Returns clean, structured results
- ✅ Filters for relevant event sites automatically
- ✅ 1,000 free searches/month
- ✅ Built for this exact use case

**Get it here:** https://tavily.com/

## 💡 How to Test

1. Add Tavily + Gemini keys to `.env`
2. Restart: `npx expo start --clear`
3. Open browser console (F12)
4. Click "Refresh Feed"
5. Watch the 5-step pipeline in action!

You should see detailed logs showing:
- Web search results
- Pages scraped
- Events parsed by Gemini
- Final deduplicated results

## 🚀 Ready?

Add the API keys and restart the server. You'll have a production-ready event search system that actually works!
