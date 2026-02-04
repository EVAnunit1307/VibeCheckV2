# Troubleshooting: "No events found"

## Issue
You see "No events found" instead of real events loading.

## Quick Fix Checklist

### 1. Check if you have a Ticketmaster API Key

**Do you have a `.env` file in your project root with this line?**
```bash
EXPO_PUBLIC_TICKETMASTER_API_KEY=your_actual_key_here
```

**If NO:**
1. Go to https://developer.ticketmaster.com/
2. Sign up (free)
3. Create an app
4. Copy the "Consumer Key"
5. Create `.env` in project root:
   ```bash
   EXPO_PUBLIC_TICKETMASTER_API_KEY=paste_your_key_here
   ```

### 2. Restart the Server

**IMPORTANT: Expo doesn't hot-reload environment variables!**

```bash
# Stop the current server (Ctrl+C)
# Then restart with --clear flag:
npx expo start --clear
```

Press `w` to open in browser again.

### 3. Check Browser Console for Errors

**Open browser console (F12) and look for:**

✅ **Good Signs:**
```
✅ Ticketmaster: 50 REAL events fetched
✅ TOTAL REAL EVENTS: 50 from Ticketmaster
```

❌ **Bad Signs:**
```
⚠️ Ticketmaster API key not configured
❌ Ticketmaster API Error: Invalid API key
```

## Common Issues

### "API keys not configured"

**Problem:** No `.env` file or missing API key

**Solution:**
```bash
# Create .env in project root
echo "EXPO_PUBLIC_TICKETMASTER_API_KEY=your_key_here" > .env

# Restart
npx expo start --clear
```

### "Invalid API key"

**Problem:** Wrong key or typo

**Solution:**
1. Check Ticketmaster dashboard: https://developer.ticketmaster.com/
2. Copy the "Consumer Key" (not Application Key!)
3. Make sure no spaces or quotes in `.env`
4. Restart server

### "0 events returned"

**Problem:** API is working but no events in that city

**Solution:**
- Try a bigger city (NYC, LA, Chicago, Toronto)
- Check if the city is spelled correctly
- Try "All" category instead of specific

### Still not working?

**Check these:**

1. **Is your internet connected?**
   - APIs need internet access

2. **Is the API key valid?**
   - Test your key: https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_KEY_HERE&city=Toronto

3. **Are you in the right directory?**
   ```bash
   pwd
   # Should show: /path/to/planlock
   ls -la .env
   # Should show .env file exists
   ```

4. **Check the .env file format:**
   ```bash
   # GOOD:
   EXPO_PUBLIC_TICKETMASTER_API_KEY=abc123def456
   
   # BAD (has quotes):
   EXPO_PUBLIC_TICKETMASTER_API_KEY="abc123def456"
   
   # BAD (has spaces):
   EXPO_PUBLIC_TICKETMASTER_API_KEY = abc123def456
   ```

## Test Your Setup

Run this in your browser console after the app loads:

```javascript
console.log('Ticketmaster Key:', process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY);
// Should show your key (first 10 chars)
```

## Still Stuck?

1. Check browser console (F12) for error messages
2. Check terminal output for API errors
3. Make sure you restarted the server after adding the key
4. Try a different city (NYC or LA)

## Emergency Fallback

If you just want to test the app without setting up APIs:

```typescript
// Temporarily add this to app/(tabs)/feed.tsx at line 82:
console.log('🔍 Debug - API Key exists?', !!process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY);
console.log('🔍 Debug - Location:', userLocation);
```

Then check the console output when you refresh.
