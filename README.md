# VibeCheck

**Plan together, show up together**

A React Native app built with Expo that helps friends commit to plans and track accountability through commitment scores.

## Features

- 📱 Phone authentication via Supabase
- 👤 User profiles with commitment scores
- 📅 Event feed (coming soon)
- 👥 Group management (coming soon)
- ✅ Plan tracking (coming soon)

## Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Backend**: Supabase
- **UI**: React Native Paper
- **Language**: TypeScript

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/EVAnunit1307/VibeCheckV2.git
cd VibeCheckV2
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Create a `.env` file in the root directory:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Enable Phone authentication in Authentication → Providers
   - Create a `profiles` table with the following schema:
     ```sql
     create table profiles (
       id uuid references auth.users on delete cascade primary key,
       phone_number text,
       full_name text not null,
       username text unique not null,
       commitment_score integer default 100,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
     );
     ```

5. Start the development server:
```bash
npx expo start
```

6. Press `w` for web, `a` for Android, or `i` for iOS

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── feed.tsx       # Events feed
│   │   ├── groups.tsx     # User groups
│   │   ├── plans.tsx      # User plans
│   │   └── profile.tsx    # User profile
│   ├── _layout.tsx        # Root layout with auth protection
│   ├── index.tsx          # Phone auth screen
│   ├── verify.tsx         # OTP verification
│   └── profile-setup.tsx  # First-time user setup
├── lib/
│   └── supabase.ts        # Supabase client configuration
├── store/
│   └── auth.ts            # Zustand auth store
└── assets/                # Images and icons
```

## Authentication Flow

1. User enters phone number
2. Supabase sends SMS with OTP code
3. User verifies code
4. If first-time user: profile setup
5. If returning user: redirect to feed

## Contributing

This is a personal project, but feel free to fork and adapt for your own use!

## License

MIT
