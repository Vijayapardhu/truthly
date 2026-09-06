# Truthly — Current Progress

## Frontend
- **Framework**: React + TypeScript + Vite + Tailwind CSS v4
- **Design**:
  - Fonts: Matcha Mint, Chillin on Sunday, Internet Friends
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
  - IconButton, Avatar, OTPInput
- **State**:
  - Zustand store: `src/stores/room-store.ts`
- **Routing**:
  - React Router in `src/App.tsx` with `ProtectedRoute`
- **Build status**:
  - `npm run build` passes
  - Dev server: `http://localhost:5174`
- **Git**:
  - Initialized and pushed 59 files to `https://github.com/Vijayapardhu/truthly.git` on branch `main`

## Backend
- **Framework**: Node.js + Express + Socket.io + TypeScript (ESM)
- **Project structure**:
  - `server/package.json`
  - `server/tsconfig.json`
  - `server/src/index.ts`
  - `server/src/routes/rooms.ts`
  - `server/src/routes/chat.ts`
  - `server/src/socket/handlers.ts`
  - `server/src/services/ai.ts`
  - `server/src/models/store.ts`
  - `server/src/types/index.ts`
  - `server/src/utils/helpers.ts`
- **In-memory data layer**:
  - `RoomStore` with room CRUD
  - Player management
  - Game state management
  - Question bank
  - Chat messages
  - Active room listing
- **Build status**:
  - TypeScript build passes
  - Server runs on port 3001
- **Socket.io events implemented**:
  - `join-room`, `leave-room`, `chat-message`
  - `select-truth`, `select-dare`, `complete-turn`
  - `game-state`, `game-state-updated`, `player-joined`, `player-left`, `new-chat-message`
- **AI service**:
  - Stub with fallback question banks
  - Optional OpenAI integration via env vars

## Frontend-Backend Integration
- Created `src/lib/api.ts` for REST API calls
- Created `src/lib/socket.ts` for Socket.io client
- Updated `CreateRoom` to POST to `/api/rooms/create`
- Updated `JoinRoom` to validate room code via `/api/rooms/code/:roomCode`
- Updated `IdentitySetup` to POST to `/api/rooms/:roomId/join`
- Updated `HostIdentitySetup` to pass `roomId` and `hostId`
- Updated `Lobby` to:
  - Fetch room data via API
  - Connect to Socket.io for real-time player updates
  - Start game via `/api/rooms/:roomId/start`
- Updated `Game` to:
  - Use Socket.io for game state updates
  - Emit `select-truth`, `select-dare`, `complete-turn` events
  - Navigate back to lobby on leave
- Both servers run concurrently:
  - Backend: `http://localhost:3001`
  - Frontend: `http://localhost:5174`

## Game Experience Enhancements
- Added circular "spin the bottle" game board (`src/components/game/CircularGame.tsx`)
- Players arranged in a circle around a central bottle
- Bottle spins with realistic deceleration and stops at a random player
- Selected player gets highlighted with "your turn" indicator
- Added sound effects using Web Audio API (`src/lib/sound.ts`):
  - Spin sound (ascending tones)
  - Selection sound (chime)
  - Win/completion sound (celebration)
  - Click sound
- Added haptic feedback using Vibration API (`src/lib/haptic.ts`):
  - Light/medium/heavy impacts
  - Success/warning patterns
- Integrated sounds and haptics into game interactions:
  - Spin triggers spin sound + heavy impact
  - Truth/Dare selection triggers select sound + medium impact
  - Skip triggers select sound + light impact
  - Next turn triggers win sound + success impact pattern
- Added Apple Color Emoji font preference in global CSS
- Created `Emoji` component for consistent emoji rendering
- Replaced emoji text in Game page with Emoji component
- Removed emoji fallbacks from Avatar component (uses icons8 images instead)

## Known Issues / Blockers
- `better-sqlite3` cannot be installed on Node 25.8.1 win32 due to missing native build tools; dependency was removed.
- Backend is entirely in-memory; data is lost on server restart.

## Room Link & Access Fixes
- Room URLs now use short room codes instead of internal IDs
- Direct links like `/room/ABC123` work without asking for code again
- Removed `ProtectedRoute` wrapper from room routes; identity checks are handled per page
- `Lobby` redirects unauthenticated users to `IdentitySetup` with room context preserved
- Added `api.resolveRoomId` to look up rooms by code first, then fallback to ID
- Updated `JoinRoom`, `IdentitySetup`, `HostIdentitySetup`, `PrivateRoomShare`, and `Discover` to use room codes for navigation and links
- Fixed host start button by changing host detection from nickname match to `playerId === host.id`

## Next Steps
1. Add chat/reactions UI in Game page.
2. Implement Discover backend and page with real room data.
3. Integrate AI question generation into game flow.
4. Add database layer when a compatible option is available.
5. Security hardening, tests, and Vercel deployment.
