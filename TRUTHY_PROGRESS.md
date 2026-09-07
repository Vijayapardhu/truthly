# Truthly — Current Progress

## Frontend
- **Framework**: React + TypeScript + Vite + Tailwind CSS v4
- **Design**:
  - Fonts: Inter, Plus Jakarta Sans, Dancing Script
  - Custom SVG logo
  - Design tokens and global styles in `src/styles/globals.css`
  - Responsive utilities, hidden scrollbars, Fluent UI icons
- **Pages implemented**:
  - Landing
  - Create Room
  - Join Room (OTP-style)
  - Identity Setup
  - Host Identity Setup
  - Lobby
  - Game
  - Discover
  - Private Room Share
  - 404 Not Found
- **Shared UI components**:
  - Button, Input, Chip, Toggle, Modal, Drawer
  - IconButton, Avatar, OTPInput, Emoji, SessionHydrator
- **State**:
  - Zustand store: `src/stores/room-store.ts`
  - Zustand store: `src/stores/identity-store.ts`
- **Routing**:
  - React Router in `src/App.tsx`
  - Session hydration on app load
- **Build status**:
  - `npm run build` passes
  - Dev server: `http://localhost:5174`
- **Git**:
  - Pushed to `https://github.com/Vijayapardhu/truthly.git` on branch `main`

## Backend
- **Service**: Firebase (Firestore + Anonymous Auth)
- **Data layer**:
  - `src/services/firestore.ts` — Firestore CRUD + realtime subscriptions
  - `src/services/auth.ts` — Anonymous Firebase Auth with local fallback
  - `src/services/questions.ts` — Intensity-aware question pools
- **Firestore collections**:
  - `rooms/{roomCode}` — Room metadata
  - `rooms/{roomCode}/players/{playerId}` — Player documents
  - `rooms/{roomCode}/game/current` — Game state document
  - `rooms/{roomCode}/chat/{messageId}` — Chat messages
- **Realtime subscriptions**:
  - Players list updates via `onSnapshot`
  - Game state updates via `onSnapshot`
  - Chat messages via `onSnapshot`
- **Security**:
  - `firestore.rules` — Authenticated writes, public reads
- **Compatibility layer**:
  - `src/lib/socket.ts` — Emulates Socket.io events using Firestore listeners

## Frontend-Backend Integration
- `src/lib/api.ts` wraps Firestore service calls
- `src/lib/socket.ts` provides Socket.io-compatible interface
- `src/lib/firebase.ts` — Firebase app initialization
- All pages use Firebase for data and realtime updates

## Game Experience
- Circular "spin the bottle" game board (`src/components/game/CircularGame.tsx`)
- Sound effects using Web Audio API (`src/lib/sound.ts`)
- Haptic feedback using Vibration API (`src/lib/haptic.ts`)
- Realtime chat in Game page
- Session persistence in `localStorage`

## Mobile Optimization
- Responsive Tailwind utilities throughout
- `touch-manipulation` on buttons for touch devices
- Viewport meta tag configured
- OTP input with mobile-friendly sizing
- Circular game radius adapts to screen width

## Deployment
- **Hosting**: Vercel (frontend) + Firebase Hosting (optional)
- **Config files**: `vercel.json` for SPA routing, `firebase.json` for hosting rewrites
- **Build output**: `dist/`
- **Free-tier setup**: Firebase Spark plan with Vercel serverless functions (`/api/*`) for backend needs
- **Deploy frontend**: Vercel with build command `npm run build`, output `dist`

## Backend (Free Tier)
- **Primary**: Firebase Firestore + Auth (Spark plan)
- **Serverless fallback**: Vercel Functions (`/api/*`) for any backend logic if needed
- **Note**: Cloud Functions removed from repo; push notifications require either Blaze plan or Vercel function implementation

## Next Steps
1. Deploy frontend to Vercel
2. Add Vercel serverless functions if backend logic is needed
3. Test OpenRouter config in Firestore (`config/openrouter`)
4. Optional: Firebase Auth providers setup in console
5. Optional: Add push notification delivery via Vercel function
