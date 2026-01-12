# Localhost Setup Guide

## Frontend (Next.js)

### Localhost Address
**http://localhost:3000**

### Quick Start Commands

```bash
cd C:\hireblaze-frontend

# Install dependencies (first time only)
npm install

# Create .env.local file
# Add these lines:
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_PREFIX=/api/v1

# Start development server
npm run dev
```

### Access
- **Frontend**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Register Page**: http://localhost:3000/register

---

## Backend (FastAPI)

### Localhost Address
**http://localhost:8000**

### API Base URL
**http://localhost:8000/api/v1**

### Quick Start Commands

```bash
cd C:\hireblaze-api

# Install dependencies (first time only)
pip install -r requirements.txt

# Set up environment variables (create .env file)
# Add:
DATABASE_URL=sqlite:///./hireblaze.db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-key

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Access
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Login Endpoint**: http://localhost:8000/api/v1/auth/login

---

## Testing Login Locally

1. **Start Backend** (Terminal 1):
   ```bash
   cd C:\hireblaze-api
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd C:\hireblaze-frontend
   npm run dev
   ```

3. **Open Browser**:
   - Go to: http://localhost:3000/login
   - Check browser console (F12) to see API calls
   - Should see: `POST http://localhost:8000/api/v1/auth/login`

---

## Environment Variables for Local Development

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_PREFIX=/api/v1
```

### Backend (.env)
```bash
DATABASE_URL=sqlite:///./hireblaze.db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-key
```

---

## Troubleshooting

### Port Already in Use
If port 3000 is busy:
```bash
# Use different port
npm run dev -- -p 3001
# Then access: http://localhost:3001
```

If port 8000 is busy:
```bash
# Use different port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
# Update .env.local: NEXT_PUBLIC_API_URL=http://localhost:8001
```

### CORS Issues
Make sure backend CORS is configured to allow `http://localhost:3000`

### Check if Services are Running
- Frontend: Open http://localhost:3000 in browser
- Backend: Open http://localhost:8000/docs in browser (should show Swagger UI)
