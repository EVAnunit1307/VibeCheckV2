# 🔑 Complete API Keys Setup Guide

**Get REAL events from multiple sources! Each API is FREE and takes 5 minutes.**

---

## ✅ **What You'll Have:**

After this guide, your app will show events from:
- 🎫 **Ticketmaster** - 200K+ events (concerts, sports, theater)
- 🎟️ **SeatGeek** - 50K+ events (concerts, sports, comedy)
- 🤝 **Meetup** - Social events (perfect for 18-30!)
- 🎭 **Eventbrite** - Community events (requires org account)

**Total: 300K+ REAL events!**

---

## 1️⃣ **Ticketmaster API** (RECOMMENDED - Best Coverage)

### **Why Ticketmaster?**
- ✅ 200,000+ events across US & Canada
- ✅ 5,000 FREE API calls per day
- ✅ Concerts, sports, theater, family events
- ✅ Easiest to set up (5 minutes)

### **Setup:**

1. **Go to:** https://developer.ticketmaster.com/products-and-docs/apis/getting-started/

2. **Click "Register"** (top right corner)

3. **Fill out the form:**
   - App Name: `VibeCheck`
   - Email: Your email
   - Use Case: `Event discovery mobile app`
   - App URL: `https://vibecheck.app` (or your domain)

4. **Check your email** for confirmation

5. **Copy your Consumer Key** (looks like: `7elxdku573FAK...`)

6. **Add to `.env` file:**
   ```bash
   EXPO_PUBLIC_TICKETMASTER_API_KEY=your_consumer_key_here
   ```

7. **Restart app:** `npx expo start --clear`

**✅ Done! You'll now see 200K+ real events!**

---

## 2️⃣ **SeatGeek API** (Great for 18-30!)

### **Why SeatGeek?**
- ✅ 50,000+ events (concerts, sports, comedy)
- ✅ 1,000 FREE calls per hour
- ✅ Popular with younger crowd (18-30)
- ✅ 5-minute setup

### **Setup:**

1. **Go to:** https://platform.seatgeek.com/

2. **Click "Sign Up"**

3. **Create account:**
   - Name & Email
   - Company: `VibeCheck` (or personal)

4. **Verify email**

5. **Go to Dashboard** → **API Credentials**

6. **Copy your Client ID** (looks like: `MjQxMjM4Nz...`)

7. **Add to `.env` file:**
   ```bash
   EXPO_PUBLIC_SEATGEEK_CLIENT_ID=your_client_id_here
   ```

8. **Restart app**

**✅ Done! Now getting SeatGeek events too!**

---

## 3️⃣ **Meetup API** (PERFECT for Social Events!)

### **Why Meetup?**
- ✅ Social events, networking, parties
- ✅ Young professional groups (18-35)
- ✅ Niche interests (gaming, tech, fitness)
- ✅ 200 FREE calls per hour

### **Setup:**

**Note:** Meetup recently changed their API access. Here are two options:

### **Option A: OAuth API (Recommended)**

1. **Go to:** https://www.meetup.com/api/oauth/list/

2. **Log in** to your Meetup account

3. **Click "Create New OAuth Consumer"**

4. **Fill out:**
   - Name: `VibeCheck`
   - Redirect URI: `http://localhost:8081`
   - Description: `Event discovery app`

5. **Copy your Key** (Client ID)

6. **Add to `.env`:**
   ```bash
   EXPO_PUBLIC_MEETUP_API_KEY=your_key_here
   ```

### **Option B: GraphQL API** (More Advanced)

Meetup now primarily uses GraphQL. For simpler setup, use Option A or skip Meetup for now.

---

## 4️⃣ **Eventbrite API** (Needs Organization Account)

### **Why Eventbrite?**
- ✅ Community events, workshops, classes
- ✅ Local events (food, arts, networking)
- ✅ FREE API access
- ⚠️ **Requires organization account** (extra steps)

### **Setup:**

#### **Step 1: Create Organization Account**

1. **Go to:** https://www.eventbrite.com/

2. **Sign up** for a free account (if you haven't)

3. **Click "Create Events"** in top menu

4. **Complete organization setup:**
   - Click your profile icon (top right)
   - Select "Account Settings"
   - Go to "Organization"
   - Click "Create Organization"
   - Fill out:
     - Organization Name: `VibeCheck Events`
     - Organization Type: `Technology`
     - Country: `United States` (or your country)
     - Click "Create"

#### **Step 2: Get API Key**

1. **Go to:** https://www.eventbrite.com/platform/api

2. **Click "Get Started"** or "Create an App"

3. **Fill out application:**
   - App Name: `VibeCheck`
   - Description: `Mobile app for event discovery`
   - Website: Your website or `https://vibecheck.app`
   - OAuth Redirect URI: `http://localhost:8081`

4. **Click "Create Key"**

5. **Copy your Private Token** (looks like: `DWRFRVU5VBB...`)

6. **Add to `.env`:**
   ```bash
   EXPO_PUBLIC_EVENTBRITE_API_KEY=your_private_token_here
   ```

7. **Restart app**

**✅ Done! Eventbrite events now included!**

---

## 🎯 **Your Complete `.env` File**

After setting up all APIs:

```bash
# Supabase (for groups, plans, voting)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Event APIs (add all you can get!)
EXPO_PUBLIC_TICKETMASTER_API_KEY=your_ticketmaster_key_here
EXPO_PUBLIC_SEATGEEK_CLIENT_ID=your_seatgeek_client_id_here
EXPO_PUBLIC_MEETUP_API_KEY=your_meetup_key_here
EXPO_PUBLIC_EVENTBRITE_API_KEY=your_eventbrite_key_here
```

**Don't have all keys?** That's fine! The app works with ANY combination:
- ✅ Just Ticketmaster? Works!
- ✅ Ticketmaster + SeatGeek? Even better!
- ✅ All 4 APIs? Maximum events! 🎉

---

## 🚀 **Testing Your Setup**

After adding keys to `.env`:

1. **Restart app:**
   ```bash
   npx expo start --clear
   ```

2. **Check console logs:**
   ```
   🔑 API Keys Status:
     Ticketmaster: ✅ Loaded (7elxdku573...)
     SeatGeek: ✅ Loaded (MjQxMjM4...)
     Meetup: ✅ Loaded (abc123...)
     Eventbrite: ✅ Loaded (DWRFRVU5...)
   ```

3. **Open app** → Click "Explore Demo Mode"

4. **Check console logs for events:**
   ```
   ✅ Added 50 Ticketmaster events
   ✅ Added 42 SeatGeek events
   ✅ Added 28 Meetup events
   ✅ Added 15 Eventbrite events
   
   🎉 TOTAL: 135 REAL events from multiple sources!
   ```

5. **Browse events!** You should see TONS of real events!

---

## 🐛 **Troubleshooting**

### **"API Key Status: ❌ Missing"**
- Check `.env` file exists in project root
- Verify key name matches exactly (e.g., `EXPO_PUBLIC_TICKETMASTER_API_KEY`)
- Restart app with `npx expo start --clear`

### **"401 Unauthorized" in console**
- API key is invalid or expired
- Get a new key from the platform
- Double-check you copied the entire key

### **"404 Not Found" (Eventbrite)**
- You don't have an organization account yet
- Follow "Create Organization Account" steps above
- Or skip Eventbrite for now (not required!)

### **"No events showing"**
- Check browser console (F12) for error messages
- Try different city (some have more events)
- Make sure at least ONE API key is configured

---

## 📊 **API Comparison**

| API | Events | Free Tier | Best For | Setup Time |
|-----|--------|-----------|----------|------------|
| **Ticketmaster** | 200K+ | 5K/day | Concerts, Sports, Theater | 5 min |
| **SeatGeek** | 50K+ | 1K/hour | Concerts, Sports, Comedy | 5 min |
| **Meetup** | 100K+ | 200/hour | Social, Networking | 10 min |
| **Eventbrite** | Varies | Unlimited | Community, Workshops | 15 min* |

*Requires organization account

---

## 💡 **Recommendations**

### **Minimum Setup (5 minutes):**
- ✅ Just get Ticketmaster
- You'll have 200K+ events - plenty!

### **Optimal Setup (15 minutes):**
- ✅ Ticketmaster (mainstream events)
- ✅ SeatGeek (more concerts/sports)
- ✅ Meetup (social events for 18-30)
- Skip Eventbrite unless you want to create an org

### **Maximum Coverage (30 minutes):**
- ✅ All 4 APIs
- 300K+ events
- Perfect mix of mainstream + social + local

---

## 🎉 **You're All Set!**

With these APIs, your app will show:
- 🎸 **Concerts** - Drake, Taylor Swift, Travis Scott
- 🏀 **Sports** - NBA, NHL, NFL games
- 🎭 **Theater** - Broadway shows, comedy
- 🤝 **Social Events** - Meetups, networking
- 🍕 **Food Events** - Food festivals, tastings
- 💼 **Professional** - Conferences, workshops

**All REAL, all UPCOMING, all based on the city you select!**

Start with Ticketmaster (5 min) and add more as you go! 🚀
