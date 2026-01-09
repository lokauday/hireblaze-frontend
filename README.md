# Hireblaze Frontend

Premium SaaS frontend for Hireblaze AI - Job Application Assistant.

Built with **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and modern React patterns.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=https://hireblaze-api-production.up.railway.app
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ✨ Key Features

- **Dashboard v2** - Enhanced dashboard with KPI strip, usage cards, activity feed, and continue section
- **AI Drive** - Document management with table/grid views, filters, and upload
- **Rich Editor** - Markdown editor with outline navigation and AI assistant panel
- **Job Tracker** - Track job applications with status management and statistics
- **History & Activity** - Timeline view of all AI actions and document updates
- **PDF Export** - Client-side PDF export from editor
- **Premium UI** - Modern design system with animations, command palette (Cmd+K), and responsive layout

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

Default: `https://hireblaze-api-production.up.railway.app`

## 📁 Project Structure

```
app/                      # Next.js App Router pages
├── (dashboard)/          # Protected routes (with layout)
├── login/                # Authentication pages
├── register/
├── drive/                # AI Drive (document management)
├── editor/[id]/          # Document editor
├── jobs/                 # Job tracker
├── history/              # Activity timeline
├── ai-tools/             # AI-powered tools
├── billing/              # Pricing & billing
└── settings/             # User settings

components/               # React components
├── ui/                   # shadcn/ui components
├── layout/               # App shell (sidebar, topbar, command menu)
├── drive/                # Drive-specific components
├── editor/               # Editor-specific components
├── jobs/                 # Job tracker components
└── shared/               # Shared utilities (skeletons, empty states)

lib/                      # Utilities & API clients
├── api-client.ts         # Core API client with auth
├── api/                  # Feature-specific API clients
├── auth.ts               # Authentication utilities
├── exports.ts            # PDF/DOCX export utilities
└── utils.ts              # Helper functions
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## 📝 License

Private - Hireblaze AI
