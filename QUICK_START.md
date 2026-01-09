# Hireblaze Frontend - Quick Start Guide

## 🚀 Local Development

### 1. Install Dependencies

```bash
cd C:\hireblaze-frontend
npm install
```

### 2. Configure Environment

The `.env.local` file is already created with:
```
NEXT_PUBLIC_API_URL=https://hireblaze-api-production.up.railway.app
```

If you need to change it, edit `.env.local`.

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open in Browser

Navigate to: [http://localhost:3000](http://localhost:3000)

---

## 📝 Test Credentials

To test the frontend, you can:

1. **Register a new account:**
   - Go to `/register`
   - Fill in the form
   - Submit → Redirects to login

2. **Login:**
   - Go to `/login`
   - Use your registered credentials
   - Submit → Redirects to dashboard

---

## ✅ Quick Verification Checklist

### Authentication
- [ ] `/login` page loads
- [ ] `/register` page loads
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Redirects to dashboard after login
- [ ] Logout works

### Dashboard
- [ ] Dashboard loads: `/dashboard`
- [ ] Shows "Welcome back, [name]"
- [ ] Plan badge displays
- [ ] Usage cards show for all 4 features
- [ ] Progress bars display
- [ ] Remaining quota shows

### AI Tools
- [ ] AI Tools page loads: `/ai-tools`
- [ ] All 4 tabs work
- [ ] Can generate content
- [ ] Output displays
- [ ] Copy button works

### Billing
- [ ] Billing page loads: `/billing`
- [ ] Pricing cards display
- [ ] Upgrade buttons work (if Stripe configured) or show banner (if not)

### Settings
- [ ] Settings page loads: `/settings`
- [ ] Profile displays
- [ ] Logout button works

---

## 🐛 Common Issues

### Issue: `npm` not found

**Solution:**
- Install Node.js from [nodejs.org](https://nodejs.org)
- Ensure npm is in your PATH
- Restart terminal/PowerShell

### Issue: Build fails

**Solution:**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Issue: API connection fails

**Check:**
- Backend is running: `curl https://hireblaze-api-production.up.railway.app/system/health`
- `.env.local` has correct API URL
- Browser console for errors

### Issue: 401 errors

**Solution:**
- Clear localStorage: `localStorage.clear()` in browser console
- Login again

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🚀 Deploy to Vercel

See `VERCEL_DEPLOYMENT.md` for detailed deployment instructions.

**Quick Steps:**
1. Push to GitHub
2. Import to Vercel
3. Add `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

---

## 📚 Documentation

- `README.md` - Complete documentation
- `VERCEL_DEPLOYMENT.md` - Vercel deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment checklist

---

**Ready to deploy!** 🎉
