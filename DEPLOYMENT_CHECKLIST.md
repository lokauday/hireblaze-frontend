# Hireblaze Frontend - Deployment Checklist

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] All pages implemented (login, register, dashboard, billing, ai-tools, settings)
- [x] React Hook Form + zod validation on all forms
- [x] Toast notifications throughout
- [x] Error handling for API errors
- [x] Quota exceeded handling with upgrade CTA
- [x] Loading states and skeletons
- [x] Responsive design implemented

### API Integration
- [x] API client configured with live Railway URL
- [x] Authentication flow working (login/signup)
- [x] Usage endpoint wired (`/me/usage`)
- [x] AI tools endpoints wired
- [x] Billing endpoints wired (with Stripe not configured handling)
- [x] 401 errors redirect to login
- [x] 429 quota errors show upgrade CTA

### Dependencies
- [x] All required packages in `package.json`
- [x] React Hook Form installed
- [x] Zod installed
- [x] @hookform/resolvers installed
- [x] Toast components created
- [x] All shadcn/ui components present

### Environment Configuration
- [x] `.env.local` created with production API URL
- [x] `.env.example` created
- [x] `NEXT_PUBLIC_API_URL` configured

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
cd C:\hireblaze-frontend
npm install
```

**Verify:**
- [ ] No errors during install
- [ ] All packages installed successfully
- [ ] `node_modules` directory created

### Step 2: Test Locally

```bash
npm run dev
```

**Verify:**
- [ ] App starts on `http://localhost:3000`
- [ ] Login page loads
- [ ] Can register new account
- [ ] Can login
- [ ] Dashboard loads usage data
- [ ] AI tools work
- [ ] No console errors

### Step 3: Build Test

```bash
npm run build
```

**Verify:**
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No build warnings (or acceptable warnings)
- [ ] `.next` directory created

### Step 4: Push to GitHub

```bash
git init  # If not already initialized
git add .
git commit -m "feat: production-ready frontend with live API integration"
git remote add origin https://github.com/yourusername/hireblaze-frontend.git
git push -u origin main
```

**Verify:**
- [ ] Code pushed to GitHub
- [ ] All files committed
- [ ] Repository is accessible

### Step 5: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Click "New Project"**
3. **Import `hireblaze-frontend` repository**
4. **Configure environment variable:**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://hireblaze-api-production.up.railway.app`
   - Environment: Production, Preview, Development
5. **Click "Deploy"**

**Verify:**
- [ ] Build succeeds on Vercel
- [ ] Deployment completes
- [ ] Production URL is provided

### Step 6: Update Backend CORS

1. **Go to `C:\hireblaze-api\app\main.py`**
2. **Add Vercel domain to CORS:**
   ```python
   allow_origins=[
       "http://localhost:3000",
       "http://127.0.0.1:3000",
       "https://your-app.vercel.app",  # Add your Vercel domain
   ]
   ```
3. **Commit and push:**
   ```bash
   git add app/main.py
   git commit -m "chore: add Vercel domain to CORS"
   git push origin main
   ```
4. **Railway auto-redeploys**

**Verify:**
- [ ] CORS updated in backend
- [ ] Backend redeployed on Railway
- [ ] No CORS errors in browser console

---

## ✅ Post-Deployment Verification

### Authentication Flow
- [ ] Register page loads: `https://your-app.vercel.app/register`
- [ ] Can create new account
- [ ] Login page loads: `https://your-app.vercel.app/login`
- [ ] Can login with credentials
- [ ] Redirects to dashboard after login
- [ ] Logout works

### Dashboard
- [ ] Dashboard loads: `https://your-app.vercel.app/dashboard`
- [ ] Shows "Welcome back, [name]"
- [ ] Plan badge displays (Free/Pro/Elite)
- [ ] Usage cards display for all 4 features
- [ ] Progress bars show correct percentages
- [ ] Remaining quota displays correctly
- [ ] Upgrade CTAs appear when quota is low
- [ ] Quick actions link correctly

### AI Tools
- [ ] AI Tools page loads: `https://your-app.vercel.app/ai-tools`
- [ ] All 4 tabs work (Resume Tailor, Cover Letter, ATS Scan, JD Parse)
- [ ] Form validation works
- [ ] Can generate content
- [ ] Output displays correctly
- [ ] Copy button works
- [ ] Loading states show during generation
- [ ] Quota exceeded error shows upgrade CTA

### Billing
- [ ] Billing page loads: `https://your-app.vercel.app/billing`
- [ ] Pricing cards display correctly
- [ ] "Most Popular" badge on Pro plan
- [ ] Upgrade buttons work (if Stripe configured) or show banner (if not)
- [ ] Manage Billing button works (if subscription exists)
- [ ] FAQ accordion works

### Settings
- [ ] Settings page loads: `https://your-app.vercel.app/settings`
- [ ] Profile information displays
- [ ] API key shows masked/unmasked
- [ ] Logout button works

### Error Handling
- [ ] Network errors show toast notifications
- [ ] 401 errors redirect to login
- [ ] 429 quota errors show upgrade CTA
- [ ] Form validation errors display inline
- [ ] Loading states show during API calls

### UI/UX
- [ ] Responsive design works on mobile
- [ ] Sidebar collapses on mobile
- [ ] Animations are smooth and subtle
- [ ] Toast notifications appear and disappear
- [ ] Loading skeletons show during data fetching
- [ ] Empty states display correctly

### Browser Console
- [ ] No errors in console
- [ ] No warnings (or acceptable warnings)
- [ ] API requests succeed (200 status)
- [ ] No CORS errors
- [ ] No network errors

---

## 🎯 Demo Checklist

### Test Account Creation
1. [ ] Go to `/register`
2. [ ] Fill in form (full name, email, password)
3. [ ] Submit → Should redirect to login with success message
4. [ ] Login with new credentials
5. [ ] Should redirect to dashboard

### Test Usage Display
1. [ ] Login to dashboard
2. [ ] Verify usage cards show:
   - ATS Scan: Used / Limit
   - Resume Tailor: Used / Limit
   - Cover Letter: Used / Limit
   - JD Parse: Used / Limit
3. [ ] Verify progress bars show correct percentages
4. [ ] Verify remaining quota displays

### Test AI Tool (Quota Consumption)
1. [ ] Go to `/ai-tools`
2. [ ] Select "JD Parse" tab
3. [ ] Paste job description
4. [ ] Click "Generate"
5. [ ] Verify output appears
6. [ ] Go back to dashboard
7. [ ] Verify JD Parse usage increased by 1

### Test Quota Enforcement
1. [ ] Use AI tools until quota is exhausted (if on free plan)
2. [ ] Try to use a tool again
3. [ ] Verify 429 error appears
4. [ ] Verify upgrade CTA appears
5. [ ] Click upgrade CTA → Should go to billing page

### Test Billing Flow (if Stripe configured)
1. [ ] Go to `/billing`
2. [ ] Click "Upgrade to Pro"
3. [ ] Should redirect to Stripe checkout
4. [ ] Complete checkout (or cancel)
5. [ ] Should redirect back to dashboard/billing

### Test Billing Not Configured
1. [ ] If Stripe not configured, go to `/billing`
2. [ ] Click "Upgrade to Pro"
3. [ ] Should show friendly banner: "Billing not configured yet"
4. [ ] Should not crash the app

---

## 🔧 Troubleshooting Common Issues

### Issue: Build Fails on Vercel

**Check:**
- Vercel logs for specific error
- TypeScript compilation errors
- Missing dependencies in `package.json`
- Environment variables configured correctly

### Issue: API Connection Fails

**Check:**
- `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Backend is running on Railway
- CORS allows Vercel domain
- Browser console for network errors

### Issue: 401 Errors

**Check:**
- Token stored in localStorage
- Token format is correct (JWT)
- Backend `/auth/login` returns `access_token`
- Backend authentication is working

### Issue: CORS Errors

**Check:**
- Backend `allow_origins` includes Vercel domain
- Backend allows credentials: `allow_credentials=True`
- Backend CORS middleware is configured correctly

---

## 📝 Final Notes

- **Production URL:** `https://your-app.vercel.app`
- **Backend API:** `https://hireblaze-api-production.up.railway.app`
- **Environment Variable:** `NEXT_PUBLIC_API_URL`

**After deployment:**
- Share Vercel URL with stakeholders
- Test on different devices/browsers
- Monitor Vercel logs for errors
- Monitor Railway logs for backend errors
- Collect user feedback

---

**✅ Ready for Production!**
