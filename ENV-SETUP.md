# 🔐 Environment Variables Setup Guide

## Quick Setup

### 1. Create `.env` File

In the project root (`planlock/`), create a `.env` file:

```bash
touch .env
```

### 2. Add Your Credentials

Copy and paste this into `.env`:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://tznhxoumebhmgfbivhpp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6bmh4b3VtZWJobWdmYml2aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNjM3MjUsImV4cCI6MjA4NTczOTcyNX0.VPiSX6aXu81YotbU0VnPNY7kwOAXuh6yrrWxkK-kQvk

# Eventbrite API Configuration
EXPO_PUBLIC_EVENTBRITE_API_KEY=UXTHCJLODARKAHIJMR2
EXPO_PUBLIC_EVENTBRITE_CLIENT_SECRET=B0IWJIT3JRHGQAP3AHC257BY4AEW0BA7T2KZTEKRYRUR7TGL3F

# Optional: Instagram Integration (Future)
# EXPO_PUBLIC_INSTAGRAM_APP_ID=
# EXPO_PUBLIC_INSTAGRAM_APP_SECRET=
```

### 3. Restart Expo

**CRITICAL**: After creating/modifying `.env`, you MUST restart with the `--clear` flag:

```bash
npx expo start --clear
```

---

## Verification

### Check If Variables Are Loaded

Add this to any file to test:

```typescript
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Eventbrite Key:', process.env.EXPO_PUBLIC_EVENTBRITE_API_KEY);
```

If they show `undefined`, restart Expo with `--clear`.

---

## Security Notes

✅ **The `.env` file is in `.gitignore`** - your secrets are safe!

❌ **NEVER commit `.env` to git**

✅ **For production**, use environment variables in your deployment platform:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **EAS**: `eas secret:create --name EVENTBRITE_KEY`

---

## Troubleshooting

### Variables Not Loading

1. **Check file name**: Must be `.env` (not `env.txt` or `.env.local`)
2. **Check location**: Must be in project root (same level as `package.json`)
3. **Restart properly**: Use `npx expo start --clear`
4. **No quotes**: Variables should be `KEY=value` not `KEY="value"`

### Still Not Working?

Try this:

```bash
# Kill all Expo processes
npx expo start --clear

# Or manually:
# 1. Close terminal
# 2. Delete .expo folder
# 3. Restart: npx expo start
```

---

## For Team Members

When sharing the project:

1. **Don't share `.env`** - it's private!
2. **Share this guide** instead
3. **Each person creates their own `.env`** with their credentials

---

**🎉 Setup complete! Your environment variables are now configured.**
