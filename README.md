# 🕹️ Fun Together

An online multiplayer gaming hub where users can play real-time games with friends by creating or joining private rooms using unique codes.

## 🎨 Visual Theme

- **Color Palette:**
  - `#264653` – Deep teal (backgrounds)
  - `#2a9d8f` – Vibrant cyan (buttons, highlights)
  - `#e9c46a` – Warm sand (neutral UI)
  - `#f4a261` – Sunset orange (hover effects)
  - `#e76f51` – Coral red (alerts, game start)

- **Fonts:**
  - Primary: Poppins (rounded, friendly)
  - Secondary: JetBrains Mono (for codes and game titles)

- **Background:** Animated gradient with floating geometric shapes

## 🧱 Tech Stack

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS 4
- **Backend:** Node.js + Express + Socket.io + TypeScript
- **Database:** MongoDB Atlas (Mongoose)
- **Hosting:** Vercel (frontend) + any Node.js host (backend)
- **Real-time:** Socket.io for multiplayer sync

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)

### 1. Clone & Install

```bash
cd "C:\Users\Abir\Play with friends"
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

Run backend:
```bash
npm run dev
```

Server starts at `http://localhost:4000`

### 3. Setup Frontend

Open a new terminal:
```bash
cd "C:\Users\Abir\Play with friends\client"
npm install
npm run dev
```

Frontend starts at `http://localhost:3000`

## 🎮 Features

### Current
- ✅ Landing page with animated gradient background
- ✅ Game selection (Ludo, Chess)
- ✅ Create/Join room with 6-character codes
- ✅ Real-time Socket.io backend
- ✅ MongoDB connection ready
- ✅ Responsive UI with theme colors

### Coming Soon
- 🎲 Ludo game implementation
- ♟️ Chess game implementation
- 💬 In-game chat panel
- 👥 Player avatars and status
- 🏆 Victory screens with confetti
- 📊 Leaderboards
- 🎨 More game skins

## 📁 Project Structure

```
Play with friends/
├── client/              # Next.js frontend
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx         # Landing page
│   │       ├── games/page.tsx   # Game selection
│   │       ├── rooms/page.tsx   # Create/Join room
│   │       ├── layout.tsx       # Root layout + fonts
│   │       └── globals.css      # Theme + animations
│   ├── package.json
│   └── tailwind.config.ts
│
├── server/              # Express + Socket.io backend
│   ├── src/
│   │   └── index.ts    # Main server with Socket.io
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── README.md
```

## 🔧 Development Commands

### Backend
```bash
npm run dev      # Start with hot-reload
npm run build    # Compile TypeScript
npm start        # Run production build
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint
```

## 🌐 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Deploy automatically

### Backend
- Deploy to Railway, Render, or Fly.io
- Set environment variables
- Update `CLIENT_ORIGIN` in `.env`

## 🤝 Contributing

Feel free to add new games, improve animations, or enhance the multiplayer experience!

## 📝 License

ISC
