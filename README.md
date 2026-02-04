# VibeCheck

A mobile app for discovering events and planning nights out with friends. Built with React Native, Expo, and Supabase.

## Quick Start

```bash
git clone https://github.com/EVAnunit1307/VibeCheckV2.git
cd VibeCheckV2
npm install --legacy-peer-deps
npx expo start --web
```

Open http://localhost:8081 and click "Explore Events" to browse Toronto venues and events.

Works out of the box with no configuration required. API keys are optional for additional features.

## What it does

Browse events from multiple sources (Ticketmaster, Eventbrite, SeatGeek, Meetup) across 29 cities. Create groups, vote on plans, and track who actually shows up vs who flakes. Real-time chat and voting system built on Supabase.

### Event Discovery
- Search and filter 20K+ events across multiple cities
- Interactive Google Maps showing venue locations
- Categories: Music, Food & Drink, Arts, Sports, Travel
- Works without an account

### Social Planning
- Create groups and invite friends
- Vote on event plans (Yes/Maybe/No)
- Real-time chat within plans
- Commitment scoring system (100 points, +2 for showing up, -10 for no-shows)
- Push notifications for plan updates

### Toronto Focus
Real venues included by default:
- Scotiabank Arena, Rogers Centre, Budweiser Stage
- Rebel, CODA, FICTION, AMPM, Lavelle
- Massey Hall, Roy Thomson Hall
- Drake Hotel, Horseshoe Tavern, Lee's Palace
- AGO, Harbourfront Centre

## Tech Stack

**Frontend:** React Native, Expo, TypeScript, Expo Router  
**UI:** React Native Paper, React Native Maps  
**Backend:** Supabase (PostgreSQL, Auth, Realtime)  
**APIs:** Ticketmaster, Eventbrite, SeatGeek, Meetup, Google Gemini, Google Maps

## Configuration

Create a `.env` file (optional):

```bash
# Event APIs
EXPO_PUBLIC_GEMINI_API_KEY=your_key
EXPO_PUBLIC_TICKETMASTER_API_KEY=your_key
EXPO_PUBLIC_EVENTBRITE_API_KEY=your_key
EXPO_PUBLIC_SEATGEEK_CLIENT_ID=your_key
EXPO_PUBLIC_MEETUP_API_KEY=your_key

# Social features
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

See `env.example` for the template.

The app works without any API keys using built-in Toronto venue data. Add keys for:
- More cities and real-time events (Ticketmaster, Eventbrite)
- AI-powered event discovery (Google Gemini)
- Social features like groups and chat (Supabase)

Setup guides: `API-KEYS-SETUP.md`, `COMPLETE-GUIDE.md`

## Project Structure

```
app/
  ├── (tabs)/          # Main app screens (feed, groups, plans, profile)
  ├── auth.tsx         # Phone authentication
  ├── event/[id].tsx   # Event details with maps
  └── index.tsx        # Landing page

lib/
  ├── events-api.ts    # Unified event fetching with fallbacks
  ├── toronto-events.ts # Local venue generator
  ├── supabase.ts      # Database client
  └── theme.ts         # Design system

components/
  ├── PremiumEventCard.tsx    # Event display with vibes & costs
  ├── SplitBillCalculator.tsx # Bill splitting tool
  └── LoadingProgress.tsx     # Animated loading states
```

## Development

```bash
# Web
npx expo start --web

# iOS (requires Mac)
npx expo start --ios

# Android
npx expo start --android

# Clear cache if needed
npx expo start --clear
```

## Database Schema

If using Supabase for social features:

```sql
-- Run supabase-setup.sql to create:
profiles (user data, commitment scores)
groups (friend groups)
group_members (membership, roles)
events (cached event data)
plans (group event plans)
plan_participants (votes, check-ins)
plan_messages (real-time chat)
```

## Deployment

### Web
```bash
npx expo export:web
# Deploy dist/ folder to Vercel, Netlify, etc
```

### Mobile (EAS Build)
```bash
npm install -g eas-cli
eas build --platform all
eas submit --platform all
```

See Expo docs for app store submission details.

## Features in Detail

### Commitment System
Users start with 100 points:
- +2 for attending an event
- -10 for no-show
- -8 for canceling <24hrs before
- -3 for canceling >24hrs before

Group leaderboards show who's reliable and who flakes.

### Real-time Updates
Powered by Supabase Realtime:
- Live vote counts as people respond
- Chat messages appear instantly
- Plan status updates (proposed → confirmed)
- Auto-confirm when minimum attendees vote yes

### Event Discovery
Multi-API fallback system ensures events always load:
1. Google Gemini AI (smart, contextual results)
2. Toronto local generator (real venues)
3. Ticketmaster (200K+ events)
4. Eventbrite (requires org account)
5. SeatGeek (concerts, sports)
6. Meetup (social gatherings)

### Bill Splitting
Built-in calculator with tip presets (10%, 15%, 18%, 20%, 25%) and per-person breakdown.

### Ride Estimates
Automatic Uber/Lyft cost calculation with surge pricing for Friday/Saturday nights.

## Troubleshooting

**No events showing:** Check browser console, verify API keys if added, restart dev server

**Maps not working:** Run `npm install react-native-maps --legacy-peer-deps`

**Auth failing:** Enable Twilio in Supabase settings, or just use "Explore Events" mode

**White screen:** Clear cache with `npx expo start --clear`

**Dependency issues:** Delete node_modules and reinstall with `--legacy-peer-deps` flag

## Documentation

- `MOBILE-LAUNCH-READY.md` - Launch checklist and what's new
- `TESTING-FLOW.md` - How to test all features
- `COMPLETE-GUIDE.md` - Full setup walkthrough
- `API-KEYS-SETUP.md` - API key instructions
- `PREMIUM-NIGHT-OUT-FEATURES.md` - Night-out specific features
- `SECURITY-ALERT.md` - Security best practices

## Performance

Targets and current metrics:
- App load: <3s (currently ~2s)
- Event fetch: <1s (currently ~500ms)
- Map render: <2s (currently ~1s)
- Vote/chat updates: <500ms (currently ~200-300ms)

## License

MIT - free for personal and commercial use.

## Credits

Built with Expo, React Native Paper, React Native Maps, Supabase, and various event APIs.
