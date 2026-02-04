# Quick Start Guide

## Get VibeCheck Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Get a Ticketmaster API Key (Required)

**Free tier: 5,000 API calls/day - Perfect for development**

1. Go to https://developer.ticketmaster.com/
2. Click "Get Your API Key"
3. Sign up (free)
4. Create an app
5. Copy your "Consumer Key"

### 3. Configure Environment

```bash
# Copy the example file
cp env.example .env

# Edit .env and add your key
EXPO_PUBLIC_TICKETMASTER_API_KEY=paste_your_key_here
```

### 4. Start the App

```bash
npx expo start --clear
```

Press `w` to open in browser!

### 5. Test It

- Select a major city (NYC, LA, Chicago, Toronto)
- Real events should load with real images
- Click an event to see venue on Google Maps
- Click "Buy Tickets" to go to Ticketmaster

## That's It! 🎉

You're now running VibeCheck with **real event data** from Ticketmaster.

## Optional: Add More Event Sources

### Eventbrite (More Event Coverage)
```bash
# Get key: https://www.eventbrite.com/platform/
EXPO_PUBLIC_EVENTBRITE_API_KEY=your_key
```

### SeatGeek (Sports & Concerts)
```bash
# Get key: https://platform.seatgeek.com/
EXPO_PUBLIC_SEATGEEK_CLIENT_ID=your_id
EXPO_PUBLIC_SEATGEEK_CLIENT_SECRET=your_secret
```

## Troubleshooting

### "No events found"
- Check that you added Ticketmaster API key to `.env`
- Restart server: `npx expo start --clear`
- Try a different city

### "API key not configured"
- Make sure `.env` file exists in project root
- Restart Expo server
- Check for typos in `.env` file

## Next Steps

- Set up Supabase for authentication
- Configure Google OAuth
- Deploy to production

See `PRODUCTION-READY.md` for full documentation.
