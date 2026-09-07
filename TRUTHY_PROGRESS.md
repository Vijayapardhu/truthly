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
- `vercel.json` configured for SPA routing
- Firebase config in `src/lib/firebase.ts`
- Build output in `dist/`

## Completed Steps
1. ✅ Migrated from Express/Socket.io to Firebase/Firestore
2. ✅ Added Firebase Anonymous Auth
3. ✅ Implemented Discover page with live Firestore data
4. ✅ Added chat UI to Game page
5. ✅ Integrated AI question generation (intensity-aware pools)
6. ✅ Added session hydration and localStorage persistence
7. ✅ Fixed lobby/game reset on player join
8. ✅ Added production Firestore security rules
9. ✅ Added mobile optimizations
10. ✅ Added Vercel SPA routing config

## Next Steps
1. Add Firebase Authentication for persistent user accounts (Google, Apple, etc.)
2. Implement AI question generation via OpenAI/LLM API
3. Add reactions and timestamps to chat UI
4. Add room categories and search to Discover page
5. Implement game statistics and history
6. Add push notifications for room invites
7. Deploy to Vercel and configure Firebase hosting
