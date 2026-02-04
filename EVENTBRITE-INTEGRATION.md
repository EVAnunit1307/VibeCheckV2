# 🎉 Eventbrite Integration Guide

## Overview

VibeCheck is now integrated with **Eventbrite API** to pull real, live events from your area! This means users get access to thousands of real events happening nearby.

---

## 🔑 API Credentials Setup

### Step 1: Add to `.env` File

Your Eventbrite API credentials have been configured. Make sure your `.env` file contains:

```env
# Eventbrite API Configuration
EXPO_PUBLIC_EVENTBRITE_API_KEY=UXTHCJLODARKAHIJMR2
EXPO_PUBLIC_EVENTBRITE_CLIENT_SECRET=B0IWJIT3JRHGQAP3AHC257BY4AEW0BA7T2KZTEKRYRUR7TGL3F
```

### Step 2: Restart Expo Server

After adding the credentials, **you MUST restart** the Expo server with the `--clear` flag:

```bash
npx expo start --clear
```

This ensures environment variables are loaded properly.

---

## 🚀 How It Works

### 1. **Eventbrite Service** (`lib/eventbrite.ts`)

The Eventbrite service provides several functions:

#### **Search Events**
```typescript
import { searchEvents } from '@/lib/eventbrite';

const result = await searchEvents({
  location_address: 'New York, NY',
  location_within: '25mi',
  start_date_range_start: new Date().toISOString(),
  sort_by: 'date',
});

console.log(result.events); // Array of Eventbrite events
```

#### **Get Nearby Events**
```typescript
import { getEventsNearLocation } from '@/lib/eventbrite';

const result = await getEventsNearLocation(
  40.7589, // latitude
  -73.9851, // longitude
  25 // radius in miles
);
```

#### **Get Event by ID**
```typescript
import { getEventById } from '@/lib/eventbrite';

const result = await getEventById('123456789');
```

#### **Search by Category**
```typescript
import { getEventsByCategory } from '@/lib/eventbrite';

// Popular categories:
// 103 - Music
// 105 - Performing & Visual Arts
// 110 - Food & Drink
// 113 - Community & Culture
// 108 - Sports & Fitness

const result = await getEventsByCategory('103'); // Music events
```

---

## 🔄 Syncing Events to Supabase

The service includes a function to sync Eventbrite events to your Supabase database:

```typescript
import { syncEventsToDatabase, searchEvents } from '@/lib/eventbrite';
import { supabase } from '@/lib/supabase';

// Search for events
const { events } = await searchEvents({
  location_address: 'Los Angeles, CA',
  location_within: '50mi',
});

// Sync to database
const result = await syncEventsToDatabase(supabase, events);
console.log(`Synced ${result.count} events!`);
```

---

## 📱 Updating the Feed Screen

### Current Implementation

The feed screen (`app/(tabs)/feed.tsx`) currently pulls from Supabase. To use **live Eventbrite data**:

### Option 1: Direct Eventbrite Fetch (Real-Time)

Update `app/(tabs)/feed.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { getEventsNearLocation } from '../../lib/eventbrite';

export default function FeedScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventbriteEvents();
  }, []);

  async function fetchEventbriteEvents() {
    setLoading(true);
    
    // Use user's location or default
    const result = await getEventsNearLocation(40.7589, -73.9851, 25);
    
    if (result.success) {
      // Transform to our format
      const transformed = result.events.map(e => ({
        id: e.id,
        title: e.name.text,
        description: e.description.text,
        start_time: e.start.local,
        cover_image_url: e.logo?.original?.url,
        is_free: e.is_free,
        venue: {
          name: e.venue?.name || 'TBA',
          latitude: parseFloat(e.venue?.address.latitude || '0'),
          longitude: parseFloat(e.venue?.address.longitude || '0'),
        },
      }));
      
      setEvents(transformed);
    }
    
    setLoading(false);
  }

  // ... rest of component
}
```

### Option 2: Sync to Database (Recommended)

Create a sync script to periodically update Supabase with Eventbrite events:

```typescript
// scripts/sync-events.ts
import { searchEvents, syncEventsToDatabase } from './lib/eventbrite';
import { supabase } from './lib/supabase';

async function syncEvents() {
  const cities = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
  ];

  for (const city of cities) {
    console.log(`Syncing events for ${city}...`);
    
    const { events } = await searchEvents({
      location_address: city,
      location_within: '50mi',
      start_date_range_start: new Date().toISOString(),
    });

    await syncEventsToDatabase(supabase, events);
    console.log(`✅ Synced ${events.length} events from ${city}`);
  }
}

syncEvents();
```

Run this script:
- **Manually**: `npx ts-node scripts/sync-events.ts`
- **Scheduled**: Set up a cron job or cloud function to run daily

---

## 🎨 Event Data Structure

### Eventbrite Event Object

```typescript
{
  id: "123456789",
  name: {
    text: "Amazing Concert"
  },
  description: {
    text: "Full description..."
  },
  start: {
    local: "2026-02-15T19:00:00",
    timezone: "America/New_York"
  },
  url: "https://www.eventbrite.com/e/123456789",
  logo: {
    original: {
      url: "https://img.evbuc.com/..."
    }
  },
  venue: {
    name: "Madison Square Garden",
    address: {
      city: "New York",
      latitude: "40.7505",
      longitude: "-73.9934"
    }
  },
  is_free: false,
  ticket_availability: {
    minimum_ticket_price: {
      major_value: 50,
      currency: "USD"
    }
  }
}
```

---

## 🔐 Security Best Practices

✅ **DO:**
- Store API keys in environment variables (`.env`)
- Never commit `.env` to git (already in `.gitignore`)
- Use `.env.example` for documentation
- Rotate keys if exposed

❌ **DON'T:**
- Hardcode API keys in source code
- Share keys in public repos
- Expose keys in client-side code (use a backend proxy for production)

---

## 📊 Rate Limits

Eventbrite API has these limits:

- **1000 requests/hour** for search endpoints
- **5000 requests/hour** for single event endpoints

**Recommendation**: Cache events in Supabase and sync periodically (every 6-24 hours).

---

## 🚀 Production Deployment

### For Production Apps:

1. **Set up a backend proxy** (Next.js API route or serverless function)
2. **Store API keys on the server**, not in the Expo app
3. **Rate limit your requests**
4. **Cache aggressively**

Example serverless function:

```typescript
// api/events.ts (Vercel/Netlify)
export default async function handler(req, res) {
  const { searchEvents } = require('./eventbrite');
  
  const result = await searchEvents({
    location_address: req.query.location,
    location_within: '25mi',
  });
  
  res.json(result);
}
```

Then call from your app:

```typescript
const response = await fetch('https://yourapp.com/api/events?location=NYC');
const { events } = await response.json();
```

---

## 🎯 Next Steps

1. ✅ **Test the integration**: Run `npx expo start --clear`
2. ✅ **Update feed screen**: Implement Eventbrite fetching
3. ✅ **Set up sync script**: Automate event syncing
4. ✅ **Add filters**: Category, price, date range
5. ✅ **Implement location**: Use device GPS for nearby events
6. ✅ **Add Instagram**: (Coming soon)

---

## 🐛 Troubleshooting

### "Failed to fetch events" Error

1. Check that `.env` has the correct API key
2. Restart Expo with `npx expo start --clear`
3. Check network connection
4. Verify API key is valid in Eventbrite dashboard

### Empty Results

- Try a different location
- Adjust the search radius
- Check date range (don't search for past events)
- Some areas may have fewer events

### API Key Not Found

```typescript
// Check if loaded
console.log('API Key:', process.env.EXPO_PUBLIC_EVENTBRITE_API_KEY);
```

If undefined, restart Expo with `--clear` flag.

---

## 📞 Support

- **Eventbrite API Docs**: https://www.eventbrite.com/platform/api
- **VibeCheck Support**: Check TESTING-GUIDE.md

---

**🎉 You're all set! Your app now has access to thousands of real events!**
