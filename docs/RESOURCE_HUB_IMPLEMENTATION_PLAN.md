# CECE Resource Hub / Center Implementation Plan

This document is a comprehensive execution plan to implement (or validate existing implementation of) the CECE Resource Hub according to the provided requirements. Use it as a phased checklist. Each step lists: purpose, tasks, acceptance criteria, and verification method.

---
## Legend
- [ ] Not Started  | [~] In Progress | [x] Complete
- Roles: Owner (O), Admin (A), Contributor (C), Student (S), Guest (G)
- Existing? column: Mark Yes/Partial/No after audit.

---
## Phase 0 – Baseline Audit & Foundations

| Step | Area | Action | Existing? | Notes |
|------|------|--------|-----------|-------|
| 0.1 | Codebase | Confirm frontend Hub routes (`/hub`, `/hub/about`, `/hub/directory`, `/hub/sections/:slug`, `/hub/resources/:slug`, `/hub/resource-center`, `/hub/search`) exist. |  |  |
| 0.2 | Auth | Validate roles implemented: Learner, Creator, Admin (map Owner→Admin for now). |  |  |
| 0.3 | Backend | Inventory existing controllers/services for: About, Sections, Resources, Directory, Bookmarks. |  |  |
| 0.4 | Storage | Determine file storage mechanism (local dev vs S3/CDN placeholder). |  |  |
| 0.5 | DB | Check migrations for tables: resources, sections, tags, profiles, bookmarks. |  |  |
| 0.6 | Performance | Capture baseline metrics: TTFB for /hub, /hub/sections/all, search endpoint latency. |  |  |
| 0.7 | Tooling | Ensure Swagger/OpenAPI available for Hub endpoints. |  |  |

Acceptance: Audit sheet filled; unknown gaps converted into backlog issues.

---
## Phase 1 – Core IA & Content Models (MVP Core)

### 1.1 Database & Models
Create/validate the following tables & fields (simplified schema notation):

- sections(id UUID PK, name, slug UNIQUE, description, sortOrder INT, isFeatured BOOL, access ENUM, createdAt, updatedAt)
- tags(id UUID PK, name, slug UNIQUE, createdAt)
- resources(id UUID PK, title, slug UNIQUE, summary, body, type ENUM, source ENUM, fileUrl, externalUrl, thumbnailUrl, sectionId FK→sections.id, access ENUM, ownerUserId FK→users.id, status ENUM(draft,in_review,published,archived), version INT, replacesResourceId FK→resources.id NULL, metaTitle, metaDescription, openGraphImage, views INT, downloads INT, bookmarks INT, createdAt, updatedAt, publishedAt)
- resource_tags(resourceId FK, tagId FK, PK (resourceId, tagId))
- profiles(id UUID PK, userId FK, displayName, headline, about, skills JSONB/text[], locationCity, locationCountry, timeZone, languages JSONB, photoUrl, portfolioLinks JSONB, linkedInUrl, twitterUrl, facebookUrl, websiteUrl, gitHubUrl, availability ENUM, services JSONB, hourlyRate, certifications JSONB, consentPublicListing BOOL, status ENUM(pending,approved,rejected), profileViews INT, contactClicks INT, createdAt, updatedAt)
- bookmarks(userId FK, resourceId FK, createdAt, PK(userId, resourceId))
- file_assets(id UUID PK, storageKey, mimeType, size, checksum, ownerUserId, createdAt)
- activity_logs(id UUID PK, actorUserId, action, targetType, targetId, payload JSONB, createdAt)

Tasks:
- [ ] Write EF Core entities & configurations (indexes: slugs, status, GIN/FTS where supported for search fields).
- [ ] Add migrations & apply.
- [ ] Seed initial sections & tags.

Acceptance:
- Models compile, migrations apply cleanly.
- Querying a seeded resource returns expected shape.

### 1.2 Backend Services & Repos
Services to implement/verify:
- SectionService: CRUD, feature toggle, ordering.
- TagService: CRUD, merge, list popular.
- ResourceService: Draft CRUD, submitForReview, publish, versioning (creates new row with replacesResourceId), search (filters + pagination + sorting), metrics increment.
- ProfileService: Submit, approve/reject (with reason), search/filter.
- BookmarkService: add/remove/list by user.
- AboutService: get/update singleton (audit lastEditedBy).
- FileAssetService: upload, virus scan hook (stub), store metadata, generate signed URL.
- ActivityLogService: record admin & publishing actions.

Acceptance:
- Unit tests (or minimal integration tests) cover happy path + basic error states.

### 1.3 API Endpoints
Implement/validate (prefix `/api` assumed):
- GET `/hub-about`
- PUT `/hub-about` (A)
- GET `/sections?featuredOnly=`
- POST `/sections` (A)
- PUT `/sections/{id}` (A)
- DELETE `/sections/{id}` (A)
- GET `/tags`
- POST `/tags` (A)
- POST `/tags/merge` (A)
- POST `/resources` (A,C,O) – create draft
- PUT `/resources/{id}` (owner or admin)
- POST `/resources/{id}/submit-for-review` (owner)
- POST `/resources/{id}/publish` (A)
- GET `/resources/{slug}` (respect access)
- POST `/resources/search` (filters: query, sectionId, tagIds, types, status, sortBy, page, pageSize)
- POST `/resources/{id}/downloaded`
- POST `/resources/{id}/viewed` (optional; or implicit)
- POST `/resources/{id}/bookmark` (S)
- DELETE `/resources/{id}/bookmark` (S)
- GET `/bookmarks/me`
- POST `/directory/submit` (S)
- POST `/directory/search`
- GET `/directory/{id}` (respect status/access)
- POST `/directory/{id}/review` (A) { status, rejectionReason }
- GET `/admin/resource-review-queue` (A)
- GET `/admin/profile-review-queue` (A)
- POST `/upload` (multipart) → returns fileAssetId + url (A,C)

Acceptance:
- Swagger shows all endpoints.
- Role-based authorization attributes present.

### 1.4 Access Control & Security
- [ ] Decorate endpoints with policies (e.g., `[Authorize(Roles="Admin,Owner")]`).
- [ ] Implement resource access filter (public vs students vs admins) server-side.
- [ ] Signed URL generator for private file access (placeholder ok for MVP).
- [ ] Basic virus scan stub (log + allow) – to be replaced with real scanner.

Acceptance: Attempting to fetch a students-only resource as Guest returns 401/403.

### 1.5 Search Implementation
- [ ] Add full-text index (title + summary + tags) or fallback LIKE for dev.
- [ ] Build query builder for filters (sectionId, tagIds, types, status, access, sortBy).
- [ ] Implement caching layer (MemoryCache) with 60s TTL for identical queries.

Acceptance: Search endpoint returns results within goal (<300ms in dev environment for small dataset).

---
## Phase 2 – Frontend Core Experiences

### 2.1 Hub Landing (`/hub`)
Current: Hero, quick links, featured sections. Needed additions:
- [ ] Add recent resources list (limit 6) with type badge & section.
- [ ] Add trending (most viewed/bookmarked last 7 days) carousel placeholder.
- [ ] Add top tags row (click → filter to Resource Center search with tag).
- [ ] CTA Overlay text variant ("Discover. Connect. Grow.").

### 2.2 About Page (`/hub/about` & admin editor)
- [ ] Rich text editor (e.g., tiptap/lexical) instead of raw HTML textarea.
- [ ] Display hero image if present; fallback illustration.
- [ ] Audit log display (last edited by + timestamp).

### 2.3 Sections & Resource Listing
- [ ] Section listing page supports sorting & pagination.
- [ ] Resource cards: show type (PDF/Video/Link), section badge, updated date, bookmark button.
- [ ] Empty state message.

### 2.4 Resource Detail
- [ ] Show preview: PDF viewer, video embed (YouTube/Vimeo), image lightbox.
- [ ] Show metadata: section, tags, version, updated date, access badge.
- [ ] Bookmark toggle (optimistic update).
- [ ] Related resources (same section + shared tags).

### 2.5 Resource Center (`/hub/resource-center`)
Enhance current implementation:
- [ ] Combined search filters: keyword, section, tags (multi-select), type (checkbox chips), sort.
- [ ] Persistent query state via URL params.
- [ ] Tabs: Resources, Courses, (future) Bookmarks.
- [ ] Pagination or infinite scroll.

### 2.6 Directory
- [ ] Profile submit form: multi-step wizard (basic info → skills/services → socials → review & consent).
- [ ] Client-side validation + progress save (localStorage draft).
- [ ] Directory list filters (skills multi-select, availability, location, services).
- [ ] Profile detail route `/hub/directory/:profileSlug` (add slug field) with contact CTA.
- [ ] Approval badge (pending/approved).

### 2.7 Bookmarks / Saved Resources
- [ ] Add “My Saved Resources” page `/hub/bookmarks` (auth required).
- [ ] Integrate bookmark button into resource cards & detail.

### 2.8 Admin Console (`/hub/admin`)
Initial MVP sections:
- Resources (table: title, section, status, type, owner, updated; filters; row actions publish/archive).
- Profiles Review Queue.
- Sections & Tags management.
- Simple analytics snapshot (counts & top 5 trending).

### 2.9 Notifications (MVP Email Stubs)
- [ ] Trigger email on profile submit, approval/rejection, resource published.
- [ ] Use background task / queue stub (in-memory) – replace later.

### 2.10 Analytics (Basic Metrics)
- [ ] Increment views/downloads/bookmarks server-side.
- [ ] Endpoint for section aggregate stats.
- [ ] Endpoint for resource metrics (views last 30 days grouped by day – stub).

---
## Phase 3 – Advanced / Enhancements

### 3.1 Versioning UI
- [ ] Show version history (list of versions with publishedAt, compare link placeholder).
- [ ] “Updated on” label if version > 1.

### 3.2 Bulk Operations
- [ ] CSV importer (dry-run + commit) → creates draft resources.
- [ ] ZIP file ingest for multi-upload with mapping UI (future FE page).

### 3.3 Media Library
- [ ] Grid/list of uploaded files with filters (type, owner, date).
- [ ] Replace file (keeps resource reference).

### 3.4 Activity Log
- [ ] Admin page listing actions with filters (actor, action, date range).

### 3.5 Access & Security Hardening
- [ ] Signed URLs with short TTL & user binding claim.
- [ ] Real virus scanning integration.
- [ ] Rate limiting for public endpoints.

### 3.6 Performance & Caching
- [ ] Add response caching headers (ETag/Last-Modified) for static-ish endpoints (sections, tags, about).
- [ ] Preload featured sections & top tags on hub load (parallel queries).

### 3.7 i18n Readiness
- [ ] Extract UI strings to locale files (en.json, tl.json).

### 3.8 SEO & Sitemaps
- [ ] Add meta tags to resource & about pages.
- [ ] Generate `/sitemap.xml` including hub routes.

### 3.9 Directory Enhancements
- [ ] Contact form relay (email anonymization) instead of direct email.
- [ ] Export CSV of approved profiles (admin console action).

---
## Phase 4 – Testing & Quality Gates

### 4.1 Unit & Integration Tests
- [ ] Backend: services (ResourceService, ProfileService, SectionService, AboutService, BookmarkService).
- [ ] API: endpoint tests (authz, happy path, input validation).
- [ ] Frontend: component tests for ResourceCard, ResourceSearchFilters, DirectoryForm wizard.

### 4.2 Performance Tests
- [ ] Load test search endpoint (locust/k6) for latency targets.
- [ ] Test large resource counts (≥10k) with paginated queries.

### 4.3 Accessibility
- [ ] Axe scan key pages (hub landing, resource detail, directory list, profile form).
- [ ] Ensure keyboard navigation & focus states.

### 4.4 Security Review
- [ ] Verify authz per endpoint.
- [ ] Attempt forced access to restricted resources.

### 4.5 Acceptance Validation (Map to §16)
- [ ] Walk through each acceptance scenario & mark pass/fail.

---
## Phase 5 – Deployment & Operations

### 5.1 Infrastructure
- [ ] Configure storage bucket + CDN.
- [ ] Environment variables for limits, signing keys, email provider.

### 5.2 Monitoring
- [ ] Integrate logging (structured) + error tracker (Sentry) + basic metrics export.

### 5.3 Backups
- [ ] Script / schedule DB snapshot.
- [ ] File storage backup policy doc.

### 5.4 Runbooks & Docs
- [ ] ERD diagram.
- [ ] Admin usage guide (with screenshots later).
- [ ] On-call playbook for failed uploads, slow search.

---
## Phase 6 – Phase Plan & Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Phase 0 Audit + 1.1 Models | Schema, migrations, seed data |
| 2 | 1.2 Services + 1.3 APIs | Core CRUD & search endpoints |
| 3 | 1.4 Access + 1.5 Search | Authz + caching baseline |
| 4 | 2.1–2.4 Frontend core resource flows | Hub landing enhancements, resource detail |
| 5 | 2.5 Resource Center filters + 2.6 Directory wizard | Unified search + profile submission upgrade |
| 6 | 2.7 Bookmarks + 2.8 Admin Console MVP | Saved resources + approvals dashboard |
| 7 | 2.9 Notifications + 2.10 Analytics | Email stubs + metrics endpoints |
| 8 | Phase 3 partial (versioning, media lib basics) | Version list + media browser stub |
| 9 | Phase 4 testing & perf | Automated tests & perf baselines |
| 10 | Phase 5 deploy & docs | Infra + runbooks + final UAT |

Adjust based on velocity.

---
## Backlog / Open Questions Tracking
| ID | Question | Decision | Owner |
|----|----------|----------|-------|
| Q1 | Initial sections list? |  |  |
| Q2 | Max file sizes per type? |  |  |
| Q3 | Directory visibility (public vs logged-in)? |  |  |
| Q4 | Contact method (email vs in-app)? |  |  |
| Q5 | Branding tokens finalized? |  |  |

---
## Verification Checklist Snapshot (Quick)
- Models & migrations complete ✅/❌
- Core endpoints live ✅/❌
- Hub landing enhanced ✅/❌
- Resource create→publish flow ✅/❌
- Directory submit→approve flow ✅/❌
- Bookmarks working ✅/❌
- Basic analytics capturing ✅/❌
- Admin console MVP ✅/❌
- Tests + performance targets ✅/❌

---
## How to Use This Doc
1. Perform Phase 0 audit and mark Existing?/Notes.
2. Convert unchecked tasks to tickets (use IDs e.g., HUB-###).
3. Update status marks ([ ], [~], [x]) as progress is made.
4. Keep this file versioned; link in project README or wiki.

---
*End of Plan*
