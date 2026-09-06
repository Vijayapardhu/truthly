# truthly — Product Requirements Document

**Version:** 1.0  
**Platform:** Responsive Web Application  
**Frontend:** React  
**Deployment:** Vercel  
**Authentication:** Guest/session-based  
**Real-time:** Required  
**Media:** WebRTC-based video/audio  
**AI:** Dynamic Truth/Dare generation  

---

## 1. Product Overview

Build a modern, premium multiplayer **Truth or Dare web application** where users can instantly create or join rooms without creating an account.

The experience is designed around **friendship, bonding, fun, and comfortable interaction**.

Users create rooms, select topics and one intensity level, invite friends, and play Truth or Dare with:

* Real-time multiplayer
* Video calling
* Voice communication
* Text chat
* Reactions
* AI-generated questions and dares
* Custom topics
* Host controls
* Public/private rooms
* Custom avatars, emojis, typography and icons
* Responsive desktop/mobile UI

**Primary product principle:**

> **The right Truth or Dare for the right people.**

---

## 2. User Types

### Player

Can:

* Join/create a room
* Set nickname
* Select avatar
* Choose Truth/Dare
* Answer questions
* Complete dares
* Skip when permitted
* Chat
* Send reactions
* Enable/disable camera
* Enable/disable microphone
* Leave room

### Host

Has all player capabilities plus:

* Create/configure room
* Start/pause/resume game
* Control game flow
* Control skip availability
* Configure topics
* Add custom topics
* Manage players
* Remove players
* Manage chat/voice permissions
* Generate/regenerate AI content
* End/restart game
* Transfer host privileges

If the host disconnects, ownership automatically transfers to another active player.

---

## 3. Guest Identity

No account creation is required.

When entering:

```text
Nickname
Avatar
```

A temporary session identity is created.

### Requirements

* Nickname is unique within a room.
* Default/customized avatars are provided.
* User data is session-based.
* Refreshing/leaving starts a new session.
* No permanent user profile is required.

---

## 4. Room System

### Create Room

Host configures:

#### Room name

Example: `Friday Night 🎉`

#### Visibility

**Public** — Appears in Discover/Browse. Can be joined through the room listing.  
**Private** — Not publicly listed. Join through room code or invite link.

#### Topics

Default topics:

* Funny
* Friendship
* Memories
* Relationships
* College
* Random
* Embarrassing
* Personal
* Creative

Host can select **multiple topics** and enter a **custom topic**.

Example custom topic: `Our college memories`

AI should understand the semantic meaning of the custom topic.

#### Intensity

Only one intensity per room:

* **General** — Light, fun, for everyone.
* **Close** — Personal, friendly, bold.
* **Deep** — Meaningful and introspective.

**Core rule:**

```text
Topic = WHAT the question is about
Intensity = HOW personal the question is
```

---

## 5. AI Content Engine

The application must dynamically generate Truth and Dare content.

### Initial pool

Generate approximately:

```text
50 Truth questions
50 Dares
```

### Content is based on

```text
Selected topics
+
Custom topics
+
Intensity
+
Game context
```

### Dynamic generation

The system should automatically generate additional content before the existing pool becomes empty. Players should **never wait** for generation during their turn.

### No repetition

Prevent:

* Exact duplicates
* Near-duplicates
* Semantically similar questions

Track previously used content per room/game.

Example — these should be considered duplicates:

> "What's your biggest fear?"

> "What are you most afraid of?"

### AI quality requirements

Generated content must:

* Match selected topics
* Match intensity
* Be natural and conversational
* Avoid awkward wording
* Avoid repetitive structures
* Be appropriate for the selected intensity
* Avoid unsafe/uncomfortable content
* Avoid requiring private information
* Avoid dangerous dares

---

## 6. Game Flow

### Lobby

Display:

* Room name
* Players + avatars
* Selected topics
* Intensity
* Host indicator
* Invite/share controls
* Start Game (host only)

Host starts the game.

---

### Turn System

Turns automatically rotate between players.

```
Mvp
↓
Rahul
↓
Priya
↓
Arjun
↓
Mvp
```

New players joining during an active game enter the rotation at the next round without interrupting the current turn.

---

## 7. Truth / Dare Selection

When it is a player's turn:

```
YOUR TURN

Mvp

What do you choose?

[ TRUTH ]     [ DARE ]
```

The application retrieves an unused item matching:

* Room topics
* Room intensity
* Truth/Dare type

---

## 8. Truth Interaction

```
TRUTH

What's something you've
always wanted to tell
your closest friend?

[ 🎤 Answer ]

[ Type your answer... ]

[ Done ]

[ Skip · 2 remaining ]
```

Player can:

* Speak
* Type
* Complete answer
* Skip if allowed

Answers are visible to room participants.

---

## 9. Dare Interaction

```
DARE

Do your best celebrity
impression for 20 seconds.

[ 🎤 Start ]

[ Done ]

[ Skip · 2 remaining ]
```

Dares may optionally include a timer depending on the generated challenge.

---

## 10. Skip System

Host controls whether skipping is enabled.

If enabled:

```
Skips per player: 3
```

Each player has an **individual skip count**.

```
Skip · 2 remaining
```

Once exhausted, the player cannot skip additional challenges.

No score or punishment system.

---

## 11. Video Calling

Integrated real-time video/audio communication.

### Features

* Camera on/off
* Microphone on/off
* Speaker controls
* Participant video tiles
* Active speaker indication
* Video focus on current player
* Leave call
* Responsive video layout

### Game integration

During a player's turn:

* Current player receives visual focus.
* Other participants remain visible in smaller tiles.
* Game content remains prominent.

**Technology:** WebRTC with SFU-based architecture (not browser mesh).

---

## 12. Voice Communication

Players can:

* Speak live
* Mute/unmute microphone
* Turn camera on/off

Video is optional. A player can participate with:

* Video + audio
* Audio only
* Chat only

---

## 13. Chat

Each room has real-time chat.

### Features

* Text messages
* Emoji
* Reactions
* Timestamps
* Player avatars
* Scrollable history

**Desktop layout:** Game | Video | Chat  
**Mobile layout:** Chat as bottom sheet

---

## 14. Reactions

Custom reactions:

* 😂 ❤️ 🔥 💀 😭 👏

Lightweight animated/floating feedback. No karma/social system.

---

## 15. Host Controls

Contextual — never a large admin dashboard.

Host can:

* Start game
* Pause/resume game
* Skip current turn
* Move to another player
* Remove player
* Change topics
* Generate more AI content
* Regenerate current content
* Control skip availability
* Manage voice/chat permissions
* Transfer host
* End/restart game

---

## 16. Host Transfer

If the host disconnects:

1. Room remains active.
2. System selects another active player.
3. New host receives host privileges.
4. Game continues without restarting.

Display: `👑 You are now the host`

---

## 17. Public Discover

Public room discovery page.

Display:

```
LIVE NOW

Friday Night 🎉
12 players
Close · Funny · Friendship

[ Join ]

College Gang
24 players
General · College · Funny

[ Join ]
```

Features:

* Live player count
* Search
* Topic filters
* Intensity filters
* Join button
* Active rooms only

Private rooms **never** appear in public discovery.

---

## 18. Private Rooms

Private rooms support:

### Room code

Example: `A7K92X`

### Invite link

```
[ Copy Invite Link ]
```

Both methods join the same room.

---

## 19. Room Lifecycle

Rooms remain active while players are present. When a room becomes empty, it expires automatically after a reasonable inactivity period.

---

## 20. Game Restart

After the game ends:

```
Game Over 🎉

14 rounds completed

[ Play Again ]
[ Leave Room ]
```

**Play Again:**

* Keeps players, room, topics, intensity
* Creates a fresh question pool
* Clears previous game history

---

## 21. No Competitive System

Do **not** implement:

* Points
* Leaderboards
* Winners
* Rankings
* Competitive scoring

The product is social and casual.

---

## 22. UI/UX Requirements

The UI should feel:

* Premium
* Modern
* Playful
* Social
* Warm
* Minimal
* Spacious
* Highly polished

Avoid generic SaaS/dashboard styling.

**Primary UX principle:** The user should immediately understand:

> **Whose turn is it?**  
> **What do I need to do?**

The game should always be the visual focus.

---

## 23. Custom Visual Design System

### Brand

Name: **truthly**

Small custom logo combining a simple playful symbol with the word **truthly**.

Typography: modern and clean.

* Strong modern display/heading font
* Highly readable body font
* Large bold headlines
* Small, subtle supporting text
* Excellent spacing and hierarchy

### Custom visual assets

* Illustrated avatars
* Reaction graphics
* Truth icon
* Dare icon
* AI icon
* Room icon
* Host icon
* Custom UI symbols

All icons share the same visual geometry and stroke/shape language.

---

## 24. Responsive Design

### Desktop

```
Video / Game / Chat
```

### Mobile

```
Room + player count
Current player/video
Question
Truth / Dare / controls
```

Chat opens as a bottom sheet. Do not simply shrink the desktop layout onto mobile.

---

## 25. Accessibility

* Keyboard navigation
* Visible focus states
* Readable contrast
* Accessible buttons
* Screen-reader labels
* Clear error states
* Camera/microphone permission messaging

---

## 26. Error Handling

Handle:

* Camera/microphone permission denied
* AI generation failure
* Network disconnect / reconnection
* Host disconnect
* Room not found / invalid room code
* Room full
* Duplicate nickname
* Empty room
* AI content unavailable

Friendly messages — never technical errors.

---

## 27. Real-Time Requirements

Room state is **server-authoritative**.

Server controls:

* Current host
* Player membership
* Turn order
* Current turn
* Used questions
* Skip counts
* Game state
* Room state

Client must not modify authoritative game state directly.

Support reconnection where possible.

---

## 28. Application Structure

```
/
├── Landing
├── Create Room
├── Join Room
├── Discover
│
├── /room/:roomId
│   ├── Lobby
│   ├── Game
│   ├── Video
│   ├── Chat
│   └── Host Controls
│
└── Error / Not Found
```

---

## 29. Suggested React Architecture

Organize components around product functionality:

```
components/
├── room/
├── game/
├── video/
├── chat/
├── players/
├── ai/
├── host/
├── avatars/
├── icons/
├── reactions/
└── ui/
```

Reusable components, no duplicated UI logic.

---

## 30. Vercel Deployment

* Environment variables for AI API keys, database credentials, realtime credentials, WebRTC/SFU credentials, application configuration
* Never expose private API keys in browser-side code

---

## 31. Performance

* Load quickly
* Lazy-load video/media components
* Avoid unnecessary React re-renders
* Maintain smooth animations
* Optimize avatar/icon assets
* Keep chat performant
* Handle dynamic room updates efficiently

---

## 32. Security & Privacy

* Never expose AI/API secrets to clients
* Validate room permissions server-side
* Validate host actions server-side
* Sanitize chat input
* Validate generated AI content
* Protect private room access
* Avoid storing unnecessary personal information
* Use temporary guest identities

---

## 33. MVP Priority

### P0 — Must Have

* Guest nickname + custom avatars
* Create room (public/private)
* Join room (code + invite link)
* Topics + custom topics
* Intensity
* AI question generation (50 Truths + 50 Dares)
* No-repeat system
* Turn system
* Skip system
* Host controls
* Real-time room state
* Chat
* Video/audio
* Responsive UI

### P1 — Important

* Discover page
* AI regeneration
* Reactions
* Host transfer
* Reconnection
* Play Again

### P2 — Future

* More avatar packs
* More visual themes
* Additional game modes
* Advanced AI personalization

---

## 34. Design Philosophy

> **Simple to join.**  
> **Easy to understand.**  
> **Fun to play.**  
> **Comfortable for everyone.**  
> **Never repetitive.**  
> **AI should feel invisible and helpful.**  
> **The game should always be the focus.**

The interface should communicate: **"This is a beautiful place to hang out with your friends."**

**Core experience flow:**

```
CREATE / JOIN
      ↓
   LOBBY
      ↓
CHOOSE VIBE (Topics + Intensity)
      ↓
AI PREPARES CONTENT
      ↓
START GAME
      ↓
PLAYER'S TURN
      ↓
TRUTH / DARE
      ↓
ANSWER / COMPLETE
      ↓
REACTIONS + VIDEO + CHAT
      ↓
NEXT PLAYER
      ↓
AI CONTINUES GENERATING
      ↓
   PLAY AGAIN
```
