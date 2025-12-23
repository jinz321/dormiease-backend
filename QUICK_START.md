# 🎯 Quick Reference - Connecting Mobile App to Render

## ⚡ 3-Step Setup

### Step 1️⃣: Get Your Render URL
1. Go to https://dashboard.render.com/
2. Find your backend service
3. Copy the URL (e.g., `https://dormiease-xyz.onrender.com`)

### Step 2️⃣: Update config.ts
```typescript
const USE_RENDER = true;
const RENDER_URL = 'https://YOUR-URL-HERE.onrender.com/api';
```

### Step 3️⃣: Run the App
```bash
npm run test-backend  # Test connection first
npm start             # Start the app
```

---

## 🚀 Quick Commands

| Command | What it does |
|---------|-------------|
| `npm start` | Start the app |
| `npm run test-backend` | Test if backend is reachable |
| `npm run clear` | Clear cache and restart |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |

---

## 🔧 Common Issues

### ❌ "Network Error"
**Fix:** Update `RENDER_URL` in `config.ts` with your actual Render URL

### ❌ "Connection Timeout"
**Fix:** Visit your Render URL in browser first (wait 30-60 sec to wake up)

### ❌ "Cannot find module"
**Fix:** Run `npm run clear`

---

## 📝 Current Configuration

Check `config.ts` to see your current settings:
- `USE_RENDER`: Should be `true` for Render
- `RENDER_URL`: Your Render backend URL
- `LOCAL_IP`: Your local network IP (for local dev)

---

## ✅ Checklist

Before running the app:
- [ ] Updated `RENDER_URL` in `config.ts`
- [ ] Set `USE_RENDER = true`
- [ ] Tested connection with `npm run test-backend`
- [ ] Backend is awake and running

---

**Need detailed help?** See `SETUP_GUIDE.md`
