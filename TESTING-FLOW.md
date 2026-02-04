# 🧪 VibeCheck - Complete Testing Flow

## 🎯 Test All Features in 10 Minutes

---

## **Test 1: Homepage & Event Discovery** (No Account) ⏱️ 2 min

### **Steps:**
1. Open `http://localhost:8081`
2. See beautiful gradient homepage
3. Click **"Explore Events"**
4. Should see 20 Toronto events with real venues

### **What to Check:**
- ✅ Homepage loads with gradient
- ✅ Two buttons visible ("Explore Events" + "Sign Up")
- ✅ Events feed shows cards with images
- ✅ Each card shows: title, venue, date, price
- ✅ "Toronto, ON" shown in header

### **Try These:**
- **Search:** Type "concert" → Should filter events
- **Category:** Tap "🎵 Music" → Should show only music events
- **Filters:** Tap "Filters" → Select "Free Only" → Should show only free events
- **City:** Tap "Toronto, ON" → Select "Vancouver" → Should show Vancouver events
- **Pull to refresh:** Drag down → Should reload events

---

## **Test 2: Event Details with Maps** ⏱️ 1 min

### **Steps:**
1. From feed, tap any event card
2. Should see full event details
3. Scroll down to see map

### **What to Check:**
- ✅ Hero image loads
- ✅ Price badge shows (FREE or $XX-$XX)
- ✅ Date & time in card
- ✅ Venue name + address
- ✅ **Google Maps preview** showing venue location
- ✅ Red marker on venue
- ✅ "Get Directions" button visible

### **Try These:**
- **Get Directions:** Tap button → Should open native maps app
- **Share:** Tap share icon in header → Should log to console
- **Back:** Tap back arrow → Should return to feed

---

## **Test 3: Create Account** ⏱️ 2 min

### **Steps:**
1. Go back to homepage (tap logo or navigate)
2. Click **"Sign Up to Create Plans"**
3. Enter phone: `+1 555 123 4567` (or your real number if Twilio enabled)
4. Click "Send Code"
5. If Twilio enabled: Check phone for SMS
6. Enter 6-digit code
7. Fill profile: Name + Username
8. Click "Get Started"

### **What to Check:**
- ✅ Phone input formats as you type
- ✅ "Send Code" button works
- ✅ Verification screen shows
- ✅ 6-digit code input
- ✅ Profile setup screen
- ✅ Redirects to feed after setup

### **Demo Mode (No Twilio):**
If you don't have Twilio:
1. Check Supabase dashboard
2. Copy the OTP from "Authentication" → "Users"
3. Or just click "Explore Events" to skip auth

---

## **Test 4: Create Group** ⏱️ 1 min

### **Steps:**
1. Go to **Groups** tab (bottom nav)
2. Tap **+ button** (FAB)
3. Enter group name: "Weekend Crew"
4. Search for members by phone (if you have test users)
5. Tap "Create Group"

### **What to Check:**
- ✅ Groups tab shows empty state (if first time)
- ✅ Create group screen opens
- ✅ Can enter group name
- ✅ Can search members
- ✅ Group created successfully
- ✅ Redirects to groups list

---

## **Test 5: Create Plan from Event** ⏱️ 2 min

### **Steps:**
1. Go to **Feed** tab
2. Tap any event
3. Tap **"Create Plan with Friends"** (bottom button)
4. Select your group
5. Set date (default is event date)
6. Set min attendees (default 3)
7. Tap "Create Plan"

### **What to Check:**
- ✅ Event preview shows at top
- ✅ Group dropdown works
- ✅ Date picker works
- ✅ Min attendees slider works
- ✅ Plan created successfully
- ✅ Redirects to plan detail

---

## **Test 6: Vote on Plan** ⏱️ 1 min

### **Steps:**
1. Should be on plan detail screen
2. See three vote buttons: **YES**, **MAYBE**, **NO**
3. Tap **YES**
4. Vote should highlight
5. Vote count should update

### **What to Check:**
- ✅ Three vote buttons visible
- ✅ Buttons are large and tappable
- ✅ Your vote highlights
- ✅ Vote count updates ("1 Yes • 0 Maybe • 0 No")
- ✅ Progress bar shows ("1 of X voted")
- ✅ Participant list shows your vote

### **Real-Time Test (Advanced):**
1. Open app in two browsers/devices
2. Vote on one → Should update on other instantly
3. When min attendees reached → Status changes to "Confirmed"

---

## **Test 7: Chat in Plan** ⏱️ 1 min

### **Steps:**
1. Still on plan detail screen
2. Scroll to **Chat** section
3. Type message: "I'm in! 🎉"
4. Tap send button
5. Message should appear

### **What to Check:**
- ✅ Chat section visible
- ✅ Message input at bottom
- ✅ Can type message
- ✅ Send button works
- ✅ Message appears with your name
- ✅ Timestamp shows ("Just now")

### **Real-Time Test:**
1. Open in two browsers
2. Send message on one → Should appear on other instantly

---

## **Test 8: View Plans List** ⏱️ 30 sec

### **Steps:**
1. Go to **Plans** tab
2. Should see your created plan
3. Tap "Upcoming" / "Past" tabs

### **What to Check:**
- ✅ Plan card shows event image
- ✅ Shows title, date, venue
- ✅ Shows status badge ("Proposed" or "Confirmed")
- ✅ Shows participant count ("1 of 3 voted")
- ✅ Tabs work (Upcoming / Past)

---

## **Test 9: View Profile & Commitment Score** ⏱️ 30 sec

### **Steps:**
1. Go to **Profile** tab
2. See your name, phone, commitment score
3. Score should be 100 (default for new users)

### **What to Check:**
- ✅ Profile shows your name
- ✅ Phone number visible
- ✅ Commitment score: 100
- ✅ Progress bar shows
- ✅ Stats show (0 attended, 0 flaked)
- ✅ "Sign Out" button works

---

## **Test 10: Group Detail & Leaderboard** ⏱️ 30 sec

### **Steps:**
1. Go to **Groups** tab
2. Tap your group
3. See member list with commitment scores
4. See group stats

### **What to Check:**
- ✅ Group name at top
- ✅ Member list shows all members
- ✅ Each member shows commitment score
- ✅ Sorted by score (highest first)
- ✅ Group stats card (total members, plans, success rate)
- ✅ Recent plans section

---

## 🎉 All Tests Passed? You're Ready to Launch!

### **Quick Checklist:**
- ✅ Homepage loads beautifully
- ✅ Events feed shows real Toronto venues
- ✅ Event details show Google Maps
- ✅ Can create account (or skip with demo mode)
- ✅ Can create groups
- ✅ Can create plans from events
- ✅ Voting works with real-time updates
- ✅ Chat works with real-time messages
- ✅ Plans list shows all plans
- ✅ Profile shows commitment score
- ✅ Group detail shows leaderboard

---

## 🐛 Common Issues & Fixes

### **Issue: Events not loading**
```bash
# Check API keys
cat .env

# Should see:
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
EXPO_PUBLIC_TICKETMASTER_API_KEY=...

# Restart server
npx expo start --clear
```

### **Issue: Maps not showing**
```bash
# Install maps package
npm install react-native-maps --legacy-peer-deps

# Restart
npx expo start --clear
```

### **Issue: Phone auth failing**
**Option 1:** Enable Twilio in Supabase dashboard
**Option 2:** Use demo mode (click "Explore Events" instead)

### **Issue: Real-time not working**
1. Check Supabase Realtime is enabled
2. Check internet connection
3. Try refreshing the page

### **Issue: White screen**
```bash
# Clear cache
npx expo start --clear

# Or reinstall
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start --clear
```

---

## 📱 Test on Real Devices

### **iOS (TestFlight)**
```bash
# Build for iOS
eas build --platform ios

# Submit to TestFlight
eas submit --platform ios

# Share link with testers
```

### **Android (Internal Testing)**
```bash
# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android

# Share link with testers
```

---

## 🚀 Load Testing

### **Test with Multiple Users**
1. Create 10 test accounts
2. Create a group with all 10
3. Create a plan
4. Have all 10 vote simultaneously
5. Send 50 chat messages
6. Check if real-time updates work

### **Expected Performance:**
- Vote update: < 500ms
- Chat message: < 500ms
- Event load: < 1s
- Map render: < 2s

---

## 📊 Analytics to Track

### **User Behavior:**
- Homepage → Feed conversion rate
- Feed → Event detail click rate
- Event detail → Create plan rate
- Plan creation → Vote rate
- Vote → Attendance rate

### **Technical Metrics:**
- App load time
- API response time
- Map render time
- Real-time latency
- Error rate

---

## 🎯 Success Criteria

### **For Launch:**
- ✅ All 10 tests pass
- ✅ No critical bugs
- ✅ Works on iOS + Android
- ✅ Real-time updates work
- ✅ Maps load correctly
- ✅ Performance < 3s load time

### **For Scale:**
- ✅ 100+ concurrent users
- ✅ 1000+ events in database
- ✅ 50+ cities supported
- ✅ 99%+ uptime
- ✅ < 1s API response time

---

**Ready to launch! 🚀**

**Questions? Check [MOBILE-LAUNCH-READY.md](./MOBILE-LAUNCH-READY.md)**
