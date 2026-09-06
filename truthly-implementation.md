# truthly — Implementation Guide

**Stack:** React + TypeScript + Vite / Next.js  
**Deployment:** Vercel  
**Realtime:** WebSocket-based server  
**Media:** WebRTC + SFU  
**Database:** PostgreSQL (Supabase / Neon / similar)  
**AI:** LLM API (OpenAI-compatible)  

---

## Development Order

Follow these phases in order. Do not build AI or video before the game loop works.

```
1. Design System
       ↓
2. Static UI
       ↓
3. Room Backend
       ↓
4. Realtime Game Engine
       ↓
5. AI Question Engine
       ↓
6. Chat + Reactions
       ↓
7. Video/Audio
       ↓
8. Host Controls
       ↓
9. Discover
       ↓
10. Edge Cases
       ↓
11. Mobile
       ↓
12. Polish
       ↓
13. Security
       ↓
14. Testing
       ↓
15. Vercel Deployment
```

---

## Phase 1 — Foundation

**1. Project setup**

* React + TypeScript
* Vite or Next.js
* Tailwind/CSS architecture
* ESLint + formatting
* Environment variables
* Folder structure
* Design tokens

**2. Build the design system**

Create first, before any screens:

* Typography
* Colors
* Spacing
* Buttons
* Inputs
* Chips
* Toggles
* Modal / Drawer
* Avatar
* Icons
* Toasts

---

## Phase 2 — Static UI

Build every screen with **mock data only**. No realtime, no backend.

**3. Landing page**  
**4. Create Room**  
**5. Join Room**  
**6. Identity Setup**  
**7. Lobby**  
**8. Main Game UI**  
**9. Truth Question**  
**10. Dare Question**  
**11. Completed Turn**  
**12. Game Over**  
**13. Discover**  
**14. Chat UI**  
**15. Host Controls**  
**16. Private Room Share**

At the end of this phase, the entire app should be navigable end-to-end with mock data.

---

## Phase 3 — Backend + Database

### Architecture

```
Frontend
   ↓
API / Realtime Server
   ↓
Database
```

### Data models

**Room**

```ts
{
  roomId: string
  name: string
  visibility: 'public' | 'private'
  roomCode: string
  hostId: string
  topics: string[]
  intensity: 'general' | 'close' | 'deep'
  allowSkipping: boolean
  skipsPerPlayer: number
  status: 'lobby' | 'playing' | 'paused' | 'ended'
  createdAt: Date
  lastActivity: Date
}
```

**Player**

```ts
{
  playerId: string
  roomId: string
  nickname: string
  avatarId: string
  isHost: boolean
  skipCount: number
  joinedAt: Date
  isConnected: boolean
}
```

**Game**

```ts
{
  gameId: string
  roomId: string
  turnOrder: string[]      // playerIds
  currentIndex: number
  currentState: string     // TURN_CHOICE | ANSWERING | COMPLETED | NEXT_TURN
  usedQuestionIds: string[]
  createdAt: Date
}
```

**Turn**

```ts
{
  turnId: string
  gameId: string
  playerId: string
  type: 'truth' | 'dare'
  questionId: string
  status: 'active' | 'completed' | 'skipped'
  startedAt: Date
  completedAt: Date
}
```

**Question**

```ts
{
  questionId: string
  roomId: string
  type: 'truth' | 'dare'
  text: string
  topics: string[]
  intensity: string
  isUsed: boolean
  createdAt: Date
}
```

**ChatMessage**

```ts
{
  messageId: string
  roomId: string
  playerId: string
  text: string
  reactions: Record<string, string[]>
  createdAt: Date
}
```

---

## Phase 4 — Room System

Implement real room operations:

**18. Create public room**  
**19. Create private room**  
**20. Join using room code**  
**21. Join using invite link**  
**22. Nickname validation**  
**23. Avatar selection**  
**24. Prevent duplicate nickname in room**  
**25. Player join/leave**  
**26. Host assignment**  
**27. Host transfer**  
**28. Room expiration**

The lobby must now actually work with real players.

---

## Phase 5 — Real-Time Game Engine

This is the most important engineering phase.

### Server-authoritative state machine

```
LOBBY
   ↓
PREPARING
   ↓
PLAYING
   ↓
TURN_CHOICE
   ↓
ANSWERING
   ↓
COMPLETED
   ↓
NEXT_TURN
   ↓
PLAYING
```

### Implement:

**29. Server-authoritative room state**  
**30. Automatic turn rotation**  
**31. Current-player state**  
**32. Truth/Dare selection**  
**33. Skip system**  
**34. Skip limits**  
**35. Host skip**  
**36. Host next-player**  
**37. Pause/resume**  
**38. End game**  
**39. Play again**

**Critical milestone:** Two people can open two browsers, join the same room, see each other, start the game, take turns choosing Truth/Dare, answer, skip within the limit, and automatically move to the next player.

Test this heavily with multiple browser windows before moving on.

---

## Phase 6 — AI Question Engine

Only after the basic game works.

### AI question-generation service

**Input:**

```ts
{
  topics: string[]
  intensity: string
  type: 'truth' | 'dare'
  count: number
}
```

**Output:**

```ts
string[]
```

### Implement:

**40. AI question-generation service**  
**41. Generate initial pool (50 Truths + 50 Dares)**  
**42. Store generated questions**  
**43. Mark questions as used**  
**44. Prevent exact duplicates**  
**45. Add semantic duplicate detection**  
**46. Automatically replenish pool**

Trigger replenishment when remaining questions fall below a threshold.

Players should **never wait** for AI generation during their turn.

---

## Phase 7 — Chat + Reactions

**47. Real-time chat**  
**48. Message timestamps**  
**49. Custom reactions**  
**50. Message reactions**  
**51. Floating reactions**

Keep chat secondary to the game.

---

## Phase 8 — Video + Audio

Do this only after the game/realtime architecture is stable.

**52. WebRTC/SFU integration**  
**53. Join voice**  
**54. Microphone controls**  
**55. Camera controls**  
**56. Participant video tiles**  
**57. Current-player focus**  
**58. Active speaker**  
**59. Screen responsive video layout**  
**60. Reconnection**  
**61. Camera/mic permission handling**  
**62. Leave call**

Use SFU-based architecture. Do not build a browser mesh for larger rooms.

---

## Phase 9 — Host System

Connect the UI to real permissions. **Server validates every host action.**

**63. Host controls**

Pause  
Resume  
Next player  
Skip turn  
Remove player  
Transfer host  
Change topics  
Change permissions  
Control skipping  
End game  
Restart game

---

## Phase 10 — Discover

**64. Public room listing**  
**65. Search**  
**66. Topic filters**  
**67. Intensity filters**  
**68. Player count**  
**69. Join room**

Private rooms **never** appear in Discover.

---

## Phase 11 — Error + Edge Cases

Test exhaustively:

* Player refreshes / closes browser
* Host disconnects (auto-transfer)
* Player loses internet
* Two players join simultaneously
* Room doesn't exist / invalid room code
* Duplicate nickname
* AI fails / returns invalid content
* Camera/mic permission denied
* Player joins during a game
* Last player leaves / room expires

### Host disconnect flow

```
Host leaves
      ↓
Server detects disconnect
      ↓
Select another active player
      ↓
Transfer host
      ↓
Everyone receives update
```

---

## Phase 12 — Mobile

Once stable, properly optimize for mobile.

**70. Mobile game layout**

```
Room header
      ↓
Video
      ↓
Current player
      ↓
Question
      ↓
Truth / Dare
      ↓
Controls
```

Chat becomes a bottom sheet.

---

## Phase 13 — Visual Polish

Make it look like the design direction.

**71. Spacing refinement**  
**72. Typography refinement**  
**73. Avatar illustrations**  
**74. Custom icons**  
**75. Truth visual language**  
**76. Dare visual language**  
**77. Button states**  
**78. Hover states**  
**79. Loading states**  
**80. Empty states**  
**81. Error states**  
**82. Micro animations**  
**83. Turn transitions**  
**84. Reaction animations**

---

## Phase 14 — Security

Before deployment:

**85. Validate room permissions server-side**  
**86. Validate host actions server-side**  
**87. Sanitize chat**  
**88. Protect private room access**  
**89. Validate AI responses**  
**90. Rate-limit AI generation**  
**91. Protect API keys**  
**92. Prevent room abuse/spam**

---

## Phase 15 — Testing

Test with:

```
1 player
2 players
5 players
10 players
20+ players
```

Test on:

```
Chrome
Edge
Firefox
Android
iPhone
```

And especially:

```
Multiple browser windows
Multiple devices
Different networks
Camera + microphone
Reconnect scenarios
```

---

## Phase 16 — Deployment

**93. Production database**  
**94. Production realtime server**  
**95. AI API**  
**96. WebRTC/SFU**  
**97. Environment variables**  
**98. Vercel deployment**  
**99. Production testing**  
**100. Domain + final polish**

---

## Design Direction

Use a **light/off-white background** with subtle pastel lavender, pink, peach, and soft blue accents. Mostly white with very subtle borders and extremely soft shadows.

**Avoid:**

* Heavy gradients
* Dark/neon gaming aesthetics
* Excessive glassmorphism
* Huge decorative illustrations
* Excessive cards
* Thick borders
* Generic stock illustrations
* Generic icon-library styling
* Overly rounded everything
* Unnecessary UI elements

### Colors

| Role | Color |
|------|-------|
| Primary background | Warm off-white / near white |
| Primary text | Near-black |
| Secondary text | Soft gray |
| Accent | Lavender, soft purple, pink, peach, light blue |
| Truth identity | Subtle lavender/purple |
| Dare identity | Subtle peach/coral |

Do not rely on color alone to distinguish Truth and Dare.

---

## Critical Rule

**Do not start with AI or video.**

The first real milestone:

> **Two people can open two browsers, join the same room, see each other, start the game, take turns choosing Truth/Dare, answer, skip within the limit, and automatically move to the next player.**

Once that works reliably, everything else becomes much easier to add.
