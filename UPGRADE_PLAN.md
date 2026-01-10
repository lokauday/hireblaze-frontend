# Hireblaze Premium Upgrade - Implementation Plan

## Overview
Transform Hireblaze into a premium SaaS product with polished UI/UX and high-value features.

---

## PHASE 1: PREMIUM UI SYSTEM

### 1.1 App Shell & Layout
**Files to create/modify:**

```
app/
  (auth)/
    layout.tsx                     # Auth pages layout (login/register)
    login/page.tsx                 # (existing, keep)
    register/page.tsx              # (existing, keep)
  (app)/
    layout.tsx                     # App shell with sidebar + topbar
    dashboard/page.tsx             # Dashboard v2
    drive/page.tsx                 # NEW: AI Drive
    editor/[id]/page.tsx           # NEW: Editor
    history/page.tsx               # NEW: History
    jobs/page.tsx                  # NEW: Job Tracker
    ai-tools/page.tsx              # (existing, upgrade)
    billing/page.tsx               # (existing, upgrade)
    settings/page.tsx              # (existing, upgrade)

components/
  layout/
    sidebar.tsx                    # NEW: Collapsible sidebar
    topbar.tsx                     # NEW: Enhanced topbar
    command-menu.tsx               # NEW: Cmd+K command palette
    breadcrumbs.tsx                # NEW: Breadcrumb navigation
    page-header.tsx                # NEW: Page header component
  
  drive/
    doc-table.tsx                  # NEW: Document table view
    doc-grid.tsx                   # NEW: Document grid view
    upload-dropzone.tsx            # NEW: Drag-and-drop upload
    document-filters.tsx           # NEW: Filter bar

  editor/
    editor-toolbar.tsx             # NEW: Editor toolbar
    ai-panel.tsx                   # NEW: AI assistant panel
    document-outline.tsx           # NEW: Document sections

  jobs/
    job-table.tsx                  # NEW: Job tracker table
    job-card.tsx                   # NEW: Job card component
    job-form.tsx                   # NEW: Add/edit job form

  shared/
    empty-state.tsx                # NEW: Empty state component
    loading-skeleton.tsx           # NEW: Skeleton loader
    quota-banner.tsx               # NEW: Quota warning banner
    upgrade-modal.tsx              # NEW: Upgrade CTA modal

lib/
  api/
    documents.ts                   # NEW: Documents API client
    jobs.ts                        # NEW: Jobs API client
    exports.ts                     # NEW: Export API client
  
  schemas/
    document.ts                    # NEW: Document zod schemas
    job.ts                         # NEW: Job zod schemas
    export.ts                      # NEW: Export zod schemas
```

### 1.2 Design System
**Files to modify:**

```
app/globals.css                    # Add design tokens, theme
tailwind.config.ts                 # Add spacing, radius, shadows
components/ui/                     # Enhance existing components
```

---

## PHASE 2: BACKEND MODELS & ENDPOINTS

### 2.1 Database Models
**Files to create:**

```
app/db/models/
  document.py                      # NEW: Document model
  job.py                           # NEW: Job model
  action_log.py                    # NEW: Action log (extend UsageEvent)

app/db/models/__init__.py          # Update imports
```

### 2.2 API Endpoints
**Files to create:**

```
app/api/routes/
  documents.py                     # NEW: Documents CRUD
  jobs.py                          # NEW: Jobs CRUD
  exports.py                       # NEW: PDF/DOCX export
  history.py                       # NEW: Action history
```

### 2.3 Schemas
**Files to create:**

```
app/schemas/
  document.py                      # NEW: Document Pydantic schemas
  job.py                           # NEW: Job Pydantic schemas
  export.py                        # NEW: Export schemas
```

---

## PHASE 3: FEATURE IMPLEMENTATION

### 3.1 AI Drive (/drive)
- Document CRUD operations
- Upload with drag-and-drop
- Table/Grid view toggle
- Filters and search
- Export to PDF

### 3.2 Editor (/editor/[id])
- Rich text editor (TipTap or Markdown)
- Document outline
- AI assistant panel
- Templates
- Version history

### 3.3 Dashboard v2
- KPI strip
- Usage cards with progress
- Recent activity feed
- Quick actions
- Continue where you left off

### 3.4 Job Tracker (/jobs)
- Job CRUD
- Status tracking
- Notes
- Generate tailored package

### 3.5 History (/history)
- Timeline view
- Filter by action type
- Link to documents
- Credits used

### 3.6 Export
- PDF export (must work)
- DOCX export (optional)
- Client-side generation

---

## IMPLEMENTATION ORDER

1. ✅ Frontend shell + design system polish
2. ✅ Drive + Documents backend endpoints
3. ✅ Editor + save/update documents
4. ✅ Dashboard v2 (activity feed + continue section)
5. ✅ Jobs tracker
6. ✅ History page
7. ✅ Export PDF

---

## COMMIT STRATEGY

```
feat(ui): premium app shell with sidebar and topbar
feat(ui): command palette (Cmd+K) implementation
feat(backend): documents model and CRUD endpoints
feat(drive): AI Drive UI with table/grid views
feat(backend): jobs model and CRUD endpoints
feat(editor): document editor with AI panel
feat(dashboard): dashboard v2 with activity feed
feat(jobs): job tracker UI and integration
feat(history): action timeline page
feat(export): PDF export functionality
feat(ux): onboarding wizard and paywall improvements
```

---

## TESTING CHECKLIST

- [ ] All new pages load without errors
- [ ] Authentication flow works
- [ ] Documents CRUD operations work
- [ ] Editor saves and loads documents
- [ ] Dashboard shows real data
- [ ] Job tracker CRUD works
- [ ] History timeline displays correctly
- [ ] PDF export generates files
- [ ] Mobile responsiveness
- [ ] Command palette (Cmd+K) works
- [ ] Quota warnings display correctly
- [ ] Upgrade flow works

---

## NEXT STEPS

1. Start with Phase 1: Premium UI System
2. Implement backend models and endpoints
3. Wire frontend to backend
4. Add polish and animations
5. Test end-to-end
6. Deploy
