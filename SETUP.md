# Hireblaze Frontend - Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd C:\hireblaze-frontend
npm install
```

### 2. Configure Environment

The `.env.local` file has been created with:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

To change the API URL, edit `.env.local`.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Prerequisites Checklist

- ✅ Node.js 18+ installed
- ✅ Backend API running on `http://127.0.0.1:8000`
- ✅ Dependencies installed (`npm install`)

## First Time Setup

1. **Start Backend API:**
   ```bash
   cd C:\hireblaze-api
   .\.venv\Scripts\Activate.ps1
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend:**
   ```bash
   cd C:\hireblaze-frontend
   npm install  # First time only
   npm run dev
   ```

3. **Access the App:**
   - Frontend: http://localhost:3000
   - Backend API Docs: http://127.0.0.1:8000/docs

## Testing the UI

1. **Sign Up:**
   - Go to http://localhost:3000/signup
   - Create a test account

2. **Login:**
   - Go to http://localhost:3000/login
   - Use your credentials

3. **Dashboard:**
   - View usage overview
   - Check plan badge
   - See usage cards with progress bars

4. **AI Tools:**
   - Navigate to AI Tools
   - Try Resume Tailor or ATS Scan
   - Test quota enforcement (free plan has low limits)

5. **Billing:**
   - View pricing cards
   - Test upgrade flow (requires Stripe keys configured)

## Troubleshooting

### Port Already in Use
```bash
# Change port in package.json or:
PORT=3001 npm run dev
```

### API Connection Failed
- Check backend is running: `curl http://127.0.0.1:8000/`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## Next Steps

- Customize colors in `app/globals.css`
- Add more UI components as needed
- Integrate with your Stripe account for billing
- Deploy to Vercel/Netlify for production
