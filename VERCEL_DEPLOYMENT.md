# Vercel Deployment Guide - Hireblaze Frontend

**Step-by-step deployment guide for Vercel platform.**

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have:
- [x] All code committed to git
- [x] Frontend repo pushed to GitHub
- [x] Created Vercel account
- [x] Backend API running at `https://hireblaze-api-production.up.railway.app`

---

## 🚀 Step 1: Push Frontend to GitHub

### Option A: New Repository

1. **Initialize git (if not already done):**
   ```bash
   cd C:\hireblaze-frontend
   git init
   git add .
   git commit -m "Initial commit: Hireblaze frontend"
   ```

2. **Create GitHub repository:**
   - Go to [GitHub](https://github.com)
   - Click **"New repository"**
   - Name: `hireblaze-frontend`
   - Description: "Hireblaze AI Frontend - Next.js 14"
   - Keep it **Public** (or Private if you prefer)
   - Click **"Create repository"**

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/hireblaze-frontend.git
   git branch -M main
   git push -u origin main
   ```

### Option B: Existing Repository

If the repository already exists on GitHub:
```bash
cd C:\hireblaze-frontend
git add .
git commit -m "Update: production-ready frontend with live API integration"
git push origin main
```

---

## 🚀 Step 2: Import to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Sign up or log in** (use GitHub to link accounts)
3. **Click "New Project"**
4. **Select "Import Git Repository"**
5. **Choose your `hireblaze-frontend` repository**
6. **Vercel will auto-detect:**
   - Framework: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`

---

## ⚙️ Step 3: Configure Environment Variables

In Vercel → Your Project → **Settings** → **Environment Variables**, add:

### Required Variable

```
Variable Name: NEXT_PUBLIC_API_URL
Value: https://hireblaze-api-production.up.railway.app
Environment: Production, Preview, Development
```

**Important:**
- Variable name must be exact: `NEXT_PUBLIC_API_URL`
- Include the `https://` protocol
- Add to all environments (Production, Preview, Development)

### How to Add:

1. Go to Vercel → Your Project → **Settings**
2. Click **"Environment Variables"** in sidebar
3. Click **"Add New"**
4. Enter:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://hireblaze-api-production.up.railway.app`
   - **Environment:** Select all (Production, Preview, Development)
5. Click **"Save"**

---

## 🔧 Step 4: Configure Build Settings

Vercel auto-detects Next.js, but verify:

1. **Go to Settings → General**
2. **Framework Preset:** Should show "Next.js"
3. **Build Command:** `next build` (default)
4. **Output Directory:** `.next` (default)
5. **Install Command:** `npm install` (default)

**These should be auto-detected correctly.**

---

## 📦 Step 5: Deploy

1. **Go to Deployments tab**
2. **Click "Deploy"** or push to `main` branch (auto-deploy)
3. **Monitor deployment:**
   - Build logs appear in real-time
   - Wait for "Building" → "Compiling" → "Ready"

4. **Once deployed, Vercel provides:**
   - Production URL: `https://hireblaze-frontend.vercel.app`
   - Preview URL (for PRs): `https://hireblaze-frontend-git-branch-username.vercel.app`

---

## ✅ Step 6: Verify Deployment

### 1. Health Check

Open your Vercel URL in browser:
```
https://your-app.vercel.app
```

**Expected:**
- Redirects to `/login` if not authenticated
- Login page displays correctly

### 2. Test Authentication

1. **Register:**
   - Click "Sign up" on login page
   - Fill in registration form
   - Submit → Should redirect to login with success message

2. **Login:**
   - Enter credentials
   - Submit → Should redirect to dashboard
   - Check browser console for errors

### 3. Test Dashboard

1. **Verify usage data loads:**
   - Dashboard should show usage cards
   - Plan badge displays correctly
   - Progress bars show usage

2. **Check API connection:**
   - Open browser DevTools → Network tab
   - Look for `GET /me/usage` request
   - Should return 200 with usage data

### 4. Test AI Tools

1. **Navigate to `/ai-tools`**
2. **Try a tool (e.g., JD Parse):**
   - Paste job description
   - Click "Generate"
   - Verify output appears
   - Check quota is consumed

### 5. Test Billing

1. **Navigate to `/billing`**
2. **Click "Upgrade to Pro":**
   - If Stripe configured → Redirects to Stripe checkout
   - If Stripe NOT configured → Shows friendly banner

### 6. Test Settings

1. **Navigate to `/settings`**
2. **Verify:**
   - Profile information displays
   - API key shows masked/unmasked
   - Logout button works

### 7. Check Browser Console

Open DevTools → Console:
- ✅ No errors
- ✅ API requests succeed (200 status)
- ✅ No CORS errors

---

## 🔍 Troubleshooting

### Issue: Build Fails

**Symptoms:**
- Deployment shows "Build Failed"
- Error logs show compilation errors

**Solution:**
1. **Check Vercel Build Logs:**
   - Go to Deployments → Latest → Logs
   - Look for specific error messages

2. **Common Issues:**
   - Missing dependencies: Add to `package.json`
   - TypeScript errors: Fix type errors
   - Environment variables: Ensure `NEXT_PUBLIC_API_URL` is set

3. **Fix and Redeploy:**
   - Fix errors locally
   - Push to GitHub
   - Vercel auto-redeploys

### Issue: API Connection Failed

**Symptoms:**
- Login/Register fails
- Dashboard shows "Failed to load usage data"
- Network errors in browser console

**Solution:**
1. **Verify Environment Variable:**
   - Vercel → Settings → Environment Variables
   - Ensure `NEXT_PUBLIC_API_URL` is set correctly
   - Value should be: `https://hireblaze-api-production.up.railway.app`

2. **Test Backend API:**
   ```bash
   curl https://hireblaze-api-production.up.railway.app/system/health
   ```
   Should return: `{"status": "ok", ...}`

3. **Check CORS on Backend:**
   - Backend should allow your Vercel domain
   - Check `app/main.py` CORS config:
     ```python
     allow_origins=[
         "http://localhost:3000",
         "https://your-app.vercel.app",  # Add your Vercel domain
     ]
     ```

### Issue: 401 Unauthorized Errors

**Symptoms:**
- API requests return 401
- User gets redirected to login repeatedly

**Solution:**
1. **Clear browser localStorage:**
   - Open DevTools → Application → Local Storage
   - Clear all items
   - Reload page

2. **Verify token format:**
   - Check `localStorage.getItem('token')` in console
   - Should be a JWT token string

3. **Check backend authentication:**
   - Verify `/auth/login` returns `access_token`
   - Check backend logs for auth errors

### Issue: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- API requests fail with CORS policy errors

**Solution:**
1. **Update backend CORS:**
   - Go to `C:\hireblaze-api\app\main.py`
   - Add your Vercel domain to `allow_origins`:
     ```python
     allow_origins=[
         "http://localhost:3000",
         "https://your-app.vercel.app",  # Add your Vercel domain
     ]
     ```
   - Push changes to GitHub
   - Redeploy backend on Railway

2. **Verify CORS config:**
   - Check Railway logs for CORS errors
   - Ensure backend allows credentials: `allow_credentials=True`

---

## 🎯 Production Checklist

After deployment, verify:

- [ ] Frontend loads at Vercel URL
- [ ] Login page displays correctly
- [ ] Registration works
- [ ] Dashboard shows usage data
- [ ] AI tools generate content
- [ ] Quota enforcement works (429 errors when exceeded)
- [ ] Billing page loads (with or without Stripe banner)
- [ ] Settings page works
- [ ] Logout works
- [ ] No console errors
- [ ] Toast notifications appear
- [ ] Responsive design works on mobile
- [ ] Sidebar collapses on mobile

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to `main` branch.

**To disable auto-deploy:**
1. Go to Settings → Git
2. Toggle **"Auto Deploy"** off

**To deploy from specific branch:**
1. Go to Settings → Git
2. Set **"Production Branch"** to your preferred branch

---

## 🌐 Custom Domain (Optional)

1. **In Vercel project → Settings → Domains**
2. **Click "Add Domain"**
3. **Enter your domain:**
   - Example: `hireblaze.ai` or `app.hireblaze.ai`
4. **Follow DNS instructions:**
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation
5. **Vercel auto-provides SSL certificate**

---

## 📊 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | Backend API URL | `https://hireblaze-api-production.up.railway.app` |

---

## 🚢 Post-Deployment

After successful deployment:

1. **Update Backend CORS:**
   - Add your Vercel domain to backend `allow_origins`
   - Redeploy backend on Railway

2. **Test Full Flow:**
   - Register → Login → Dashboard → AI Tools → Billing
   - Verify all features work end-to-end

3. **Monitor Logs:**
   - Check Vercel logs for errors
   - Check Railway logs for backend errors
   - Monitor browser console for client errors

4. **Share Demo:**
   - Share Vercel URL with stakeholders
   - Test on different devices/browsers
   - Collect feedback

---

## ✅ Success Indicators

Your deployment is successful when:

1. ✅ Frontend loads at Vercel URL
2. ✅ Login/Register pages work
3. ✅ Dashboard shows usage data from API
4. ✅ AI tools generate content
5. ✅ Billing page loads correctly
6. ✅ Settings page works
7. ✅ No console errors
8. ✅ Toast notifications appear
9. ✅ Responsive design works
10. ✅ All pages load correctly

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**🎉 Your frontend is now live on Vercel!**
