# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Multiplayer gaming platform with:
- **Backend**: Node.js + Express + Socket.io + TypeScript (present in this repo under `server/`).
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS 4 (documented in `README.md` / `ARCHITECTURE.md`, expected under `client/`, though the folder may be absent in some checkouts).
- **Database**: MongoDB Atlas via Mongoose (optional in development; backend runs without it if `MONGODB_URI` is unset).

Key documentation files:
- `README.md`: high-level overview, tech stack, and basic commands.
- `QUICKSTART.md`: step-by-step setup (especially for Windows/PowerShell).
- `ARCHITECTURE.md`: detailed system and UI architecture.
- `PROJECT_STATUS.md`: what is implemented vs. future work.

When in doubt about flows or behavior, prefer `ARCHITECTURE.md` and `PROJECT_STATUS.md` over guessing.

## Core Commands

All commands below are intended to be run from the repository root unless stated otherwise.

### Backend (`server/` – Express + Socket.io)

From `server/`:

- **Install dependencies**
  - `npm install`
- **Run dev server with hot reload**
  - `npm run dev`
- **Build TypeScript**
  - `npm run build`
- **Run production build** (after `npm run build`)
  - `npm start`
- **Health check**
  - Once running, `GET /health` should return `{ ok: true }`.

> Tests are **not configured** yet: `npm test` is a placeholder that exits with an error. There is currently no way to run a single automated test.

### Frontend (`client/` – Next.js + Tailwind)

The frontend is described in the docs but may not exist in all clones. If `client/` is present, use these commands from `client/` (from `README.md` / `PROJECT_STATUS.md`):

- **Install dependencies**
  - `npm install`
- **Run dev server** (Next.js dev server at `http://localhost:3000`)
  - `npm run dev`
- **Build for production**
  - `npm run build`
- **Run production build**
  - `npm start`
- **Lint**
  - `npm run lint`

## Environment & Running Both Sides

Environment variables are described consistently in `README.md`, `QUICKSTART.md`, and `ARCHITECTURE.md`. The backend can start without MongoDB, but certain logs/features assume it.

### Backend env (`server/.env`)

- `PORT` – HTTP/Socket.io port (default 4000 if unset).
- `CLIENT_ORIGIN` – Allowed origin for CORS and Socket.io (e.g. `http://localhost:3000`).
- `MONGODB_URI` – MongoDB connection string. If omitted, the server logs a warning and skips connecting.

### Frontend env (`client/.env.local`)

- `NEXT_PUBLIC_SOCKET_URL` – URL of the Socket.io backend (e.g. `http://localhost:4000`).

### Typical local dev setup

1. **Start backend**
   - `cd server`
   - Ensure `.env` is present (can be copied from `.env.example`).
   - `npm run dev`
2. **Start frontend** (if `client/` exists)
   - `cd client`
   - Ensure `.env.local` is present (often from `.env.example`).
   - `npm run dev`
3. Visit `http://localhost:3000` for the UI; backend runs on `http://localhost:4000`.

Refer to `QUICKSTART.md` for a full, PowerShell-oriented sequence including MongoDB Atlas setup and troubleshooting.

## High-Level Architecture

### Big Picture

From `ARCHITECTURE.md` and `PROJECT_STATUS.md`, the system is structured as:

- **Browser / Next.js client**
  - App Router under `client/src/app/` with routes such as `/`, `/games`, `/rooms`, and dynamic `/room/[code]` game rooms.
  - A custom hook `client/src/hooks/useSocket.ts` manages the Socket.io client connection.
  - Theming, fonts, and animations are defined primarily in `globals.css` and `layout.tsx`.
- **Node.js backend (`server/src/index.ts`)**
  - Express server with JSON handling and CORS constrained to `CLIENT_ORIGIN`.
  - HTTP health endpoint at `/health`.
  - Socket.io server with room-based events and basic room/chat logic.
- **MongoDB (via Mongoose)**
  - Connection is declared in `server/src/index.ts` but models and persistence logic are intentionally minimal/"future" work.

The current implementation focuses on real-time room and chat behavior; game logic (Ludo/Chess) is mostly planned, not implemented.

### Backend Details (`server/src/index.ts`)

Key behaviors to preserve when modifying the backend:

- **Startup & MongoDB**
  - `connectMongo()` connects using `MONGODB_URI` if present; otherwise it logs a warning and continues.
  - `main()` awaits `connectMongo()`, then sets up Express and Socket.io.
- **CORS & JSON**
  - CORS is restricted to `CLIENT_ORIGIN` for both HTTP and Socket.io.
  - JSON body parsing is enabled globally.
- **Socket.io events**
  - `connection` – logs when a client connects/disconnects.
  - `join_room` – accepts `(roomCode: string, username: string)`:
    - Trims and uppercases `roomCode`.
    - Rejects codes that are not exactly 6 characters.
    - Joins the Socket.io room with that code.
    - Stores `username` on `socket.data.username`.
    - Emits a `system` event to that room with a join message.
  - `chat` – accepts `(roomCode: string, msg: string)`:
    - Emits `chat` to the given `roomCode` with `{ from: socket.data.username, msg }`.
  - `disconnect` – logs disconnections.

If you add new events (e.g., `game_move`, `game_start`, `game_end`), keep the pattern of:
- Validating room codes and user identity early.
- Using room-based broadcasts (`io.to(roomCode).emit(...)`).
- Avoiding trust in client-provided data beyond what is necessary.

### Frontend Structure & Flows (from docs)

Even if the `client/` tree is missing, other files define the intended behavior:

- **Routes** (from `ARCHITECTURE.md` / `PROJECT_STATUS.md`):
  - `/` – Landing page with animated gradient hero.
  - `/games` – Game selection grid (Ludo, Chess, extensible for more games).
  - `/rooms` – Page to create or join a room; creation generates a 6-character code and navigates to `/room/[code]`.
  - `/room/[code]` – Real-time game room UI with chat, placeholder area for game boards.
- **Socket client**
  - `useSocket` hook encapsulates connection lifecycle to `NEXT_PUBLIC_SOCKET_URL`, wiring the events described in `ARCHITECTURE.md` (`join_room`, `system`, `chat`).
- **Theming**
  - Colors and animations come from CSS variables in `globals.css` and Tailwind utilities mapped to those variables.
  - Fonts: Poppins (primary UI) and JetBrains Mono (codes/titles) are configured in `layout.tsx`.

When adding new pages or components, align with this routing and theming model rather than introducing parallel styling or routing conventions.

## Working with Existing Documentation

- **Setup and troubleshooting**: Prefer `QUICKSTART.md` for precise environment setup and common issues (ports in use, MongoDB connectivity, Socket.io errors).
- **Architecture questions**: Use `ARCHITECTURE.md` for flows (create room, chat), component responsibilities, and planned future events/features.
- **Status and roadmap**: Use `PROJECT_STATUS.md` to understand what is considered "done" versus future work (game logic, auth, leaderboards, etc.).

Avoid duplicating these documents; instead, reference them or keep changes in sync when updating behavior.
