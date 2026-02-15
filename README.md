# MeetKP

**Stop Swiping. Start Meeting.**

MeetKP is a modern dating platform built for people who actually want to connect. No bots, no games — just real people making real connections.

## Features

- **Profile Creation** — Build your profile with photos, bio, vibe tagline, and interests
- **Discovery Feed** — Tinder-style card stack with like, pass, and superlike actions
- **Smart Matching** — Mutual likes create matches instantly
- **Real-time Messaging** — Chat with your matches directly in-app
- **Dark Mode UI** — Sleek, mobile-first dark theme with smooth animations

## Tech Stack

- **Next.js 14** (App Router) — Full-stack React framework
- **TypeScript** — Type-safe everything
- **Tailwind CSS** — Utility-first styling with custom theme
- **Prisma** — Type-safe ORM with SQLite (swap to Postgres for production)
- **NextAuth.js** — Authentication with JWT sessions
- **Framer Motion** — Smooth swipe and page animations
- **Zustand** — Lightweight state management
- **Lucide React** — Beautiful icons

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Generate Prisma client and create database
npx prisma generate
npx prisma db push

# Seed demo profiles
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo login:** `demo@meetkp.com` / `demo123`

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── (auth)/
│   │   ├── login/            # Login page
│   │   └── register/         # Registration page
│   ├── (app)/
│   │   ├── layout.tsx        # App shell with bottom nav
│   │   ├── discover/         # Swipe/discovery feed
│   │   ├── matches/          # Matches grid
│   │   ├── messages/[userId] # Chat with a match
│   │   └── profile/
│   │       ├── page.tsx      # View/edit profile
│   │       └── create/       # Profile creation wizard
│   └── api/
│       ├── auth/             # NextAuth + registration
│       ├── profile/          # Profile CRUD
│       ├── discover/         # Discovery feed
│       ├── swipe/            # Swipe actions + match detection
│       ├── matches/          # Mutual matches
│       └── messages/         # Messaging + conversations
├── components/
│   └── providers/            # Auth provider
└── lib/
    ├── auth.ts               # NextAuth configuration
    └── db.ts                 # Prisma client singleton
```

## License

MIT
