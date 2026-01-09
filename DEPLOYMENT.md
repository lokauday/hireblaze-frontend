# Deployment Guide - Hireblaze Frontend

This guide covers deploying the Hireblaze frontend to **Vercel**.

## 🚀 Deploy to Vercel

### Prerequisites

- GitHub account
- Vercel account (free tier works)
- Backend API deployed (Railway or other)

### Step 1: Push to GitHub

1. **Initialize git repository** (if not already done):
   ```bash
   cd C:\hireblaze-frontend
   git init
   git add .
   git commit -m "feat: Hireblaze premium frontend (dashboard v2, drive, editor, jobs, history)"
   ```

2. **Create GitHub repository:**
   - Go to [GitHub](https://github.com/new)
   - Create a new repository (e.g., `hireblaze-frontend`)
   - **Do NOT** initialize with README, .gitignore, or license

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/hireblaze-frontend.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Import to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Create New Project:**
   - Click **"Add New..."** → **"Project"**
   - Select your `hireblaze-frontend` repository
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

### Step 3: Set Environment Variables

**Before deploying**, configure environment variables:

1. **In Vercel Project Settings:**
   - Go to **Settings** → **Environment Variables**

2. **Add Required Variable:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://hireblaze-api-production.up.railway.app
   ```

3. **Apply to Environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **Save and deploy**

### Step 4: Deploy

1. **Click "Deploy"**
   - Vercel will automatically:
     - Install dependencies (`npm install`)
     - Build the Next.js app (`npm run build`)
     - Deploy to production

2. **Wait for Build:**
   - Monitor build logs in real-time
   - Build should complete successfully (no errors)

3. **Get Deployment URL:**
   - Once deployed, Vercel provides a URL like:
     ```
     https://hireblaze-frontend.vercel.app
     ```

### Step 5: Update Backend CORS

**Important:** Update your backend CORS settings to allow your Vercel domain.

1. **Get your Vercel domain:**
   - Copy the deployment URL from Vercel
   - Example: `https://hireblaze-frontend.vercel.app`

2. **Update backend CORS:**
   - In your backend (Railway), update CORS origins:
     ```python
     # app/main.py
     CORS_origins = [
         "http://localhost:3000",
         "https://hireblaze-frontend.vercel.app",  # Add your Vercel domain
     ]
     ```

3. **Redeploy backend** (if needed)

### Step 6: Verify Deployment

1. **Open your Vercel URL:**
   ```
   https://your-app.vercel.app
   ```

2. **Test Authentication:**
   - ✅ Register a new account
   - ✅ Login with credentials
   - ✅ Dashboard loads correctly

3. **Test Features:**
   - ✅ Dashboard shows usage data
   - ✅ AI Tools work
   - ✅ Drive page loads
   - ✅ Job Tracker works
   - ✅ History page loads

4. **Check Browser Console:**
   - Open DevTools → Console
   - Verify no errors
   - Check API requests are successful

5. **Check Vercel Logs:**
   - Vercel → Your Project → **Deployments** → Latest → **Logs**
   - Verify no build or runtime errors

## 🔧 Troubleshooting

### Build Fails

**Error:** TypeScript errors or build warnings
- **Fix:** Run `npm run build` locally first
- **Fix:** Check Vercel logs for specific errors
- **Fix:** Ensure all dependencies are in `package.json`

**Error:** Missing environment variables
- **Fix:** Add `NEXT_PUBLIC_API_URL` in Vercel Settings
- **Fix:** Redeploy after adding env vars

### Runtime Errors

**Error:** API connection fails
- **Fix:** Verify `NEXT_PUBLIC_API_URL` is set correctly
- **Fix:** Check backend is running and accessible
- **Fix:** Verify CORS settings on backend allow Vercel domain

**Error:** CORS errors in browser
- **Fix:** Update backend CORS with Vercel domain
- **Fix:** Ensure `Access-Control-Allow-Origin` includes Vercel URL

**Error:** 401 Unauthorized
- **Fix:** Check JWT token is stored in localStorage
- **Fix:** Verify backend `/auth/login` endpoint works
- **Fix:** Check token expiration

### Performance Issues

**Issue:** Slow page loads
- **Fix:** Enable Vercel Analytics (optional)
- **Fix:** Check bundle size (should be < 1MB)
- **Fix:** Verify images are optimized

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] `npm run build` passes locally
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Environment variables configured
- [ ] Backend API is accessible
- [ ] CORS settings updated for Vercel domain
- [ ] No secrets committed to git
- [ ] `.gitignore` excludes sensitive files

## 🎯 Post-Deployment

After successful deployment:

1. **Test all features:**
   - Authentication flow
   - Dashboard and usage stats
   - AI Tools generation
   - Document management
   - Job tracker
   - PDF export

2. **Monitor Vercel:**
   - Check deployment logs
   - Monitor error rates
   - Review analytics (if enabled)

3. **Update Documentation:**
   - Update any hardcoded URLs
   - Document production URL
   - Update backend CORS if needed

## 🔐 Security Reminders

- ✅ Never commit `.env.local` or `.env` files
- ✅ Use environment variables for all secrets
- ✅ Backend API keys should be server-side only
- ✅ JWT tokens stored client-side (in localStorage) are acceptable for this app
- ✅ Verify HTTPS is enabled on Vercel (default)

## 📞 Need Help?

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Check Vercel Logs:** Project → Deployments → Latest → Logs
- **Check Browser Console:** DevTools → Console for client-side errors

---

**Ready to deploy!** 🚀
