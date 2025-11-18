# 🏗️ Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Next.js Client (React + Tailwind)            │  │
│  │  • Landing, Games, Rooms, Game Room pages            │  │
│  │  • Socket.io Client Hook (useSocket)                 │  │
│  │  • Real-time UI updates                              │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      │ HTTP + WebSocket
                      ▼
         ┌────────────────────────────┐
         │   Node.js Backend          │
         │  (Express + Socket.io)     │
         │  • Room management         │
         │  • Real-time events        │
         │  • Game state sync         │
         └────────────┬───────────────┘
                      │
                      │ Mongoose ODM
                      ▼
         ┌────────────────────────────┐
         │    MongoDB Atlas           │
         │  • User profiles           │
         │  • Game sessions           │
         │  • Room history            │
         └────────────────────────────┘
```

---

## 📂 Frontend Structure (Next.js App Router)

```
client/src/app/
├── page.tsx                 # Landing page (Hero + CTA)
├── layout.tsx               # Root layout (fonts, metadata)
├── globals.css              # Theme colors, animations, Tailwind
├── games/
│   └── page.tsx            # Game selection grid
├── rooms/
│   └── page.tsx            # Create/Join room form
└── room/
    └── [code]/
        └── page.tsx        # Game room (canvas + chat)

client/src/hooks/
└── useSocket.ts            # Socket.io connection hook
```

### Key Frontend Components

| File | Purpose |
|------|---------|
| `layout.tsx` | Defines site-wide metadata, fonts (Poppins, JetBrains Mono) |
| `globals.css` | Theme palette, animated gradient background |
| `games/page.tsx` | Displays game cards (Ludo, Chess) with Create/Join buttons |
| `rooms/page.tsx` | Handles room creation (generates 6-char code) and join logic |
| `room/[code]/page.tsx` | Game room UI with Socket.io chat and placeholder game canvas |
| `useSocket.ts` | Manages WebSocket connection lifecycle |

---

## 🔌 Backend Structure (Express + Socket.io)

```
server/src/
└── index.ts                # Main server entry point

Key responsibilities:
├── Express HTTP server     # Health check, REST APIs (future)
├── Socket.io server        # Real-time event handling
├── MongoDB connection      # Mongoose setup (optional, for persistence)
└── CORS configuration      # Allow client origin
```

### Socket.io Events

| Event | Direction | Parameters | Purpose |
|-------|-----------|------------|---------|
| `join_room` | Client → Server | `roomCode`, `username` | User joins a room |
| `system` | Server → Client | `message` | System notifications |
| `chat` | Client → Server | `roomCode`, `msg` | Send chat message |
| `chat` | Server → Client | `{from, msg}` | Broadcast chat to room |

**Future events to implement:**
- `game_move` - Player makes a move
- `game_start` - Game begins
- `game_end` - Victory/draw
- `player_disconnect` - Handle player leaving

---

## 🎨 Theming System

### Color Palette (CSS Variables)

Defined in `client/src/app/globals.css`:

```css
--teal-900: #264653    /* Deep teal - backgrounds */
--teal-600: #2a9d8f    /* Cyan - buttons, highlights */
--sand-400: #e9c46a    /* Sand - neutral UI */
--orange-400: #f4a261  /* Orange - hover effects */
--coral-500: #e76f51   /* Coral - alerts, CTA */
```

### Tailwind Color Mapping

Colors are exposed as Tailwind utilities via `@theme inline`:

```css
.text-cyan     /* #2a9d8f */
.bg-coral      /* #e76f51 */
.border-sand   /* #e9c46a */
```

### Animated Background

```css
.bg-animated-gradient {
  background: linear-gradient(120deg, var(--teal-900), #1f4e57, var(--teal-600));
  background-size: 200% 200%;
  animation: floatGradient 18s ease infinite;
}
```

---

## 🔐 Environment Variables

### Client (`.env.local`)
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### Server (`.env`)
```env
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://...
```

---

## 🔄 Data Flow Examples

### 1. Create Room Flow
```
User → Clicks "Create Room" in /rooms
  ↓
Client generates 6-char code (e.g., ABC123)
  ↓
Code displayed with 1.5s delay
  ↓
Router navigates to /room/ABC123
  ↓
Socket connects and emits "join_room"
  ↓
Server logs join, emits "system" message
  ↓
Client displays "User joined room ABC123"
```

### 2. Real-time Chat Flow
```
User types message in /room/[code]
  ↓
Client emits "chat" event with {roomCode, msg}
  ↓
Server receives event, broadcasts to all in room
  ↓
All connected clients (including sender) receive "chat" event
  ↓
Message appears in chat panel for all users
```

---

## 🚀 Deployment Strategy

### Frontend (Vercel)
1. Push to GitHub
2. Import repo in Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app`
4. Auto-deploy on push to `main`

### Backend (Railway / Render / Fly.io)
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Set environment variables:
   - `PORT=4000` (or dynamic port)
   - `CLIENT_ORIGIN=https://your-vercel-app.vercel.app`
   - `MONGODB_URI=mongodb+srv://...`

---

## 🧩 Future Architecture Enhancements

### Phase 1 - Game Logic
- Add game engines for Ludo and Chess
- Implement turn-based state machine
- Add move validation

### Phase 2 - Persistence
- Store game sessions in MongoDB
- Add user accounts (OAuth with NextAuth)
- Implement leaderboards

### Phase 3 - Scaling
- Add Redis for Socket.io adapter (multi-server)
- Implement room expiration
- Add reconnection logic

### Phase 4 - Features
- Add more games (Uno, Connect 4)
- Implement spectator mode
- Add replay system
- Add in-game voice chat (WebRTC)

---

## 🛠️ Tech Stack Rationale

| Technology | Why? |
|------------|------|
| **Next.js 16** | Latest features, App Router, Turbopack, SSG/SSR |
| **Tailwind CSS 4** | Rapid UI dev, PostCSS-only (no config file) |
| **Socket.io** | Reliable WebSocket with fallbacks, room support |
| **TypeScript** | Type safety, better DX, fewer runtime errors |
| **MongoDB** | Flexible schema, free tier, easy integration |
| **Vercel** | Zero-config Next.js deployment, edge network |

---

## 📊 Performance Considerations

- **Lazy loading**: Game components loaded on demand
- **Code splitting**: Next.js automatic route-based splitting
- **WebSocket compression**: Socket.io default compression
- **CSS animations**: GPU-accelerated transforms
- **Image optimization**: Next.js `<Image>` component (future)
- **Caching**: MongoDB queries cached with TTL (future)

---

## 🧪 Testing Strategy (Future)

```
client/
├── __tests__/
│   ├── pages/
│   ├── hooks/
│   └── components/

server/
├── __tests__/
│   ├── socket-events.test.ts
│   └── game-logic.test.ts
```

**Tools:**
- Jest + React Testing Library (frontend)
- Jest + Supertest (backend)
- Playwright (E2E tests)

---

## 📝 API Documentation (Future REST Endpoints)

When REST APIs are added:

```
GET  /api/rooms          # List active rooms
POST /api/rooms          # Create room
GET  /api/rooms/:code    # Get room details
GET  /api/games          # List available games
GET  /api/leaderboard    # Top players
```

---

## 🤝 Contributing Guidelines

1. Follow existing code style (ESLint rules)
2. Use meaningful commit messages
3. Test locally before pushing
4. Update documentation for new features
5. Keep components small and focused
6. Use TypeScript strict mode

---

**Built with ❤️ for gamers who love to play together!**
