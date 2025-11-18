# 🚀 Quick Start Guide

Get your multiplayer gaming hub running in 5 minutes!

## 📋 Prerequisites

- **Node.js 18+** and npm installed
- **MongoDB Atlas** account (free tier) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)

## ⚡ Setup Steps

### 1️⃣ Backend Setup (Terminal 1)

```powershell
# Navigate to server folder
cd "C:\Users\Abir\Play with friends\server"

# Install dependencies (already done if you followed initial setup)
npm install

# Create environment file
Copy-Item .env.example .env

# Edit .env file with your MongoDB connection string
notepad .env
```

**In `.env`, update:**
```env
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/funtogether?retryWrites=true&w=majority
```

**Start the backend:**
```powershell
npm run dev
```

✅ You should see:
```
🚀 Server listening on http://localhost:4000
✅ Connected to MongoDB
```

---

### 2️⃣ Frontend Setup (Terminal 2)

Open a **new PowerShell terminal**:

```powershell
# Navigate to client folder
cd "C:\Users\Abir\Play with friends\client"

# Install dependencies (already done)
npm install

# Create environment file
Copy-Item .env.example .env.local

# Start the frontend
npm run dev
```

✅ You should see:
```
▲ Next.js 16.0.3
- Local:   http://localhost:3000
```

---

## 🎮 Test the App

1. **Open browser:** http://localhost:3000
2. **Click "Choose Game"** → Select Ludo or Chess
3. **Create a room** → Enter your username and click "Create Room"
4. **You'll get a 6-char code** (e.g., `ABC123`)
5. **Open another browser tab** (or incognito window)
6. **Join the same room** using the code
7. **Test real-time chat** between both tabs!

---

## 🛠️ Troubleshooting

### Backend won't start?
- Check MongoDB connection string is correct
- Ensure MongoDB Atlas IP whitelist includes your IP (or use `0.0.0.0/0` for development)
- Check port 4000 is not in use: `Get-NetTCPConnection -LocalPort 4000`

### Frontend won't start?
- Check port 3000 is not in use
- Run `npm install` again if dependencies are missing

### Socket.io not connecting?
- Ensure backend is running on port 4000
- Check browser console for connection errors (F12 → Console)
- Verify `NEXT_PUBLIC_SOCKET_URL` in `.env.local` matches backend URL

---

## 📦 MongoDB Atlas Setup (If Needed)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a **free M0 cluster**
3. Create a **database user** (username + password)
4. **Whitelist your IP** or add `0.0.0.0/0` (for dev only)
5. Click **Connect** → **Drivers** → Copy connection string
6. Replace `<username>`, `<password>`, and `<dbname>` in your `.env` file

---

## 🎉 Next Steps

- Build game logic for **Ludo** and **Chess**
- Add **player avatars** and animations
- Implement **turn-based mechanics**
- Add **victory screens** with confetti
- Deploy to **Vercel** (frontend) and **Render/Railway** (backend)

Happy coding! 🕹️
