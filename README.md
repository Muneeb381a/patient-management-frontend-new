# Clinic Management System — Frontend

A fast, production-ready React application for a neurology clinic. Lets doctors search patients, record full consultations (vitals, symptoms, prescriptions, neurological examination, follow-ups), view patient history, and print bilingual (English/Urdu) prescriptions — all in one smooth workflow.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Getting Started](#getting-started)
- [Application Routes](#application-routes)
- [Features](#features)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Performance Optimisations](#performance-optimisations)
- [Printing Prescriptions](#printing-prescriptions)
- [Authentication](#authentication)
- [Component Reference](#component-reference)
- [Common Issues and Fixes](#common-issues-and-fixes)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (Vite, ESM) |
| Routing | React Router DOM v7 |
| State | Redux Toolkit + React-Redux |
| HTTP | Axios with retry + sessionStorage cache |
| UI Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Date pickers | React Datepicker, MUI X Date Pickers |
| Dropdowns | React Select |
| Notifications | React Toastify |
| Icons | React Icons (Font Awesome 6) |
| Styling | Tailwind CSS v4 |
| Printing | jsPDF + window.print() |
| Build | Vite 6 |
| Linting | ESLint 9 |

---

## Project Structure

```
clinical_web_app-main/
├── index.html
├── vite.config.js
├── package.json
├── tailwind.config.js
│
└── src/
    ├── main.jsx                        # App entry — Redux Provider + BrowserRouter
    ├── App.jsx                         # Router, auth guard, nav, data preloading
    │
    ├── pages/
    │   ├── LoginPage.jsx               # Login form (JWT)
    │   ├── DashboardPage.jsx           # Stats, recent patients, upcoming follow-ups
    │   ├── AddPatientForm.jsx          # Register new patient
    │   ├── PatientPage.jsx             # Simple search wrapper (legacy)
    │   ├── Loader.jsx                  # Full-screen animated loader
    │   └── FullPageLoader.jsx          # Overlay loader variant
    │
    ├── components/
    │   ├── PatientSearch.jsx           # Main patient search + history view
    │   ├── PatientSearchForm.jsx       # Search input form (debounced)
    │   ├── PatientConsultation.jsx     # Full consultation entry form
    │   ├── ConsultationForm.jsx        # Form layout — assembles all sections
    │   ├── PatientInfoHeader.jsx       # Patient name/age/gender header card
    │   │
    │   ├── VitalSignsSection.jsx       # BP, pulse, temp, SpO2, NIHSS, fall assessment
    │   ├── SymptomAnalysisSection.jsx  # Symptom multi-select + AI suggestions
    │   ├── NeurologicalExamSection.jsx # 40-field neuro exam (lazy-loaded)
    │   ├── DiagnosisTestSection.jsx    # Lab test selection
    │   ├── PrescriptionManagementSection.jsx # Medicine selection + add new
    │   ├── FollowUpSection.jsx         # Follow-up date and notes
    │   │
    │   ├── EditConsultation.jsx        # Edit an existing consultation
    │   ├── PatientHistoryModal.jsx     # Consultation history view
    │   ├── PrescriptionsPopup.jsx      # Prescription detail popup
    │   ├── PrescriptionButton.jsx      # Quick print button
    │   ├── PrescriptionForm.jsx        # Single prescription entry row
    │   │
    │   ├── SearchPatient.jsx           # Simple search component (legacy)
    │   ├── SymptomsSelector.jsx        # Standalone symptom selector
    │   ├── TestsSelector.jsx           # Standalone test selector
    │   ├── NeuroExamSelect.jsx         # Single neuro field dropdown
    │   ├── AddTestForm.jsx             # Add a new diagnostic test
    │   ├── NewPatientForm.jsx          # New patient form variant
    │   ├── EditPatientHistory.jsx      # Edit patient info
    │   ├── SymptomEntry.jsx            # Single symptom entry
    │   ├── Loader.jsx                  # Inline loading spinner
    │   └── TimeGreeting.jsx            # Localised time greeting in header
    │
    ├── store/
    │   ├── index.js                    # Redux store setup
    │   └── slices/
    │       ├── appDataSlice.js         # symptoms, tests, medicines, neuroOptions
    │       └── dashboardSlice.js       # Dashboard stats with 1-min staleness window
    │
    ├── utils/
    │   ├── api.js                      # fetchWithRetry — Axios + cache + retry
    │   ├── auth.js                     # getToken, setToken, logout, isLoggedIn
    │   ├── printConsultation.js        # Bilingual print layout generator
    │   ├── dateUtils.js                # Date formatting helpers
    │   └── CustomErrorBoundary.jsx     # Error boundary HOC
    │
    ├── api/
    │   └── api.js                      # Legacy bare Axios calls (searchPatientByMobile etc.)
    │
    └── context/
        └── LoadingContext.jsx          # Global loading context (optional use)
```

---

## Environment Setup

The backend URL is set in [src/utils/api.js](src/utils/api.js). Change this line if your backend runs on a different port or host:

```js
// src/utils/api.js
const BASE_URL = "http://localhost:4500";
```

For production, update this to your deployed backend URL (e.g. Vercel URL).

Also update [src/api/api.js](src/api/api.js) if you use the legacy API functions:
```js
const API_URL = "http://localhost:4500/api";
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- The backend API running at `http://localhost:4500` (see backend README)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The app opens at `http://localhost:5173`.

### Build for production

```bash
npm run build
# Output goes to dist/
npm run preview  # Preview the production build locally
```

---

## Application Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `PatientSearch` | Main page — search patients, view history |
| `/dashboard` | `DashboardPage` | Clinic overview with stats and follow-ups |
| `/patients/:patientId` | `PatientSearch` | Patient profile loaded from URL |
| `/patients/new` | `PatientSearch` | New patient registration |
| `/patients/:patientId/consultations/new` | `PatientConsultation` | New consultation form |
| `/patients/:patientId/consultation` | `PatientConsultation` | Alternative consultation URL |
| `/patients/:patientId/history` | `PatientHistory` | Full history modal |
| `/patients/:patientId/consultations/:id/edit` | `EditConsultation` | Edit existing consultation |
| `/patients/:patientId/tests/new` | `AddTestForm` | Order new tests |
| `*` | Redirect | All unknown routes → `/dashboard` |

---

## Features

### Patient Search

- Search by **11-digit mobile number** or **patient name**
- Results cached in memory (15 minutes) — repeat searches are instant
- Multiple matches shown as a selectable list
- If no patient found, "Add New Patient" form appears automatically

### New Consultation

A single page that collects:

1. **Vital Signs** — Blood pressure, pulse rate, temperature, SpO2, NIHSS score, fall assessment
2. **Symptom Analysis** — Multi-select from symptom catalogue + AI-assisted medicine suggestions
3. **Neurological Examination** — 40 clinical fields (lazy-loaded to improve page load)
4. **Diagnostic Tests** — Select from test catalogue
5. **Prescription Management** — Select medicines, set dosage/frequency/duration/instructions in English and Urdu. Create new medicines inline.
6. **Clinical Decisions** — Diagnosis and treatment plan text fields
7. **Follow-Up Scheduling** — Select duration presets or pick a custom date

**Save** sends everything in one API call (`POST /api/consultations/complete`) inside a single database transaction. If anything fails, nothing is saved.

After saving: the prescription is automatically printed and the user is redirected to the patient list.

### Patient History

Full consultation history with expandable cards showing:
- Visit date and follow-up date
- Diagnosis and symptoms
- Prescribed medicines (with English and Urdu instructions)
- Vital signs
- Neurological exam findings
- Lab tests ordered

Pagination: loads 5 consultations per page with a "Load More" button.

### Dashboard

- Total patients, consultations today, upcoming follow-ups
- Monthly consultation trend chart
- Recent patients list
- Upcoming follow-up appointments
- Auto-refreshes data after 1 minute of staleness
- Manual refresh button

### Bilingual Printing

Prescriptions print with full English and Urdu text in a clean, clinic-ready layout. No external printer configuration needed — uses the browser's native print dialog.

---

## State Management

Redux Toolkit manages two slices:

### appDataSlice — Static Dropdown Data

```
store.appData
  ├── symptoms: [{ value: "1", label: "Headache" }, ...]
  ├── tests: [{ value: "2", label: "MRI Brain" }, ...]
  ├── medicines: [{ value: "15", label: "Tablet Brufen (400mg)", raw: {...} }, ...]
  ├── neuroOptions: { motor_function: [...], muscle_tone: [...], ... }
  └── loading: { symptoms: false, tests: false, medicines: false, neuroOptions: false }
```

**Key behaviours:**
- All four datasets are **preloaded** in `App.jsx` as soon as the user logs in — before they navigate anywhere
- Each thunk checks `if (data.length > 0) return null` — so subsequent dispatches are no-ops (no network calls)
- Medicines can be force-refreshed after creating a new medicine via `fetchMedicines(true)`
- A new medicine added inline updates Redux immediately via `addMedicine()` action — no re-fetch needed

### dashboardSlice — Dashboard Stats

```
store.dashboard
  ├── counts: { total_patients, consultations_today, upcoming_followups }
  ├── recent_patients: [...]
  ├── upcoming_followups: [...]
  ├── monthly_trend: [...]
  ├── loading: false
  └── lastFetched: 1741000000000
```

**Key behaviours:**
- Fetches fresh data only if more than 1 minute has passed since last fetch
- After saving a consultation, `invalidateDashboard()` is dispatched so the next dashboard visit shows fresh counts
- Manual refresh button always force-fetches regardless of staleness

---

## API Layer

### fetchWithRetry (`src/utils/api.js`)

The primary HTTP client used throughout the app:

```js
fetchWithRetry(method, endpoint, cacheKey, body, transformResponse, retries, delay)
```

**Features:**

| Feature | Detail |
|---------|--------|
| **Automatic retries** | 2 retries with 300ms → 600ms exponential backoff |
| **sessionStorage cache** | GET responses cached for 5 minutes by `cacheKey` |
| **Timeouts** | GET: 8 seconds. POST/PUT/PATCH: 15 seconds |
| **Auth header** | JWT token automatically attached from `localStorage` |
| **401 handling** | Calls `logout()` and redirects to `/` immediately |
| **4xx fast-fail** | Client errors are not retried (no backoff delay) |
| **Transform** | Response can be transformed before caching/returning |

**Example usage:**
```js
// GET with cache
const medicines = await fetchWithRetry(
  "get",
  "/api/medicines",
  "medicines",          // cacheKey — stored as "fc:medicines" in sessionStorage
  null,
  (data) => data.map((m) => ({ value: String(m.id), label: m.brand_name }))
);

// POST (no cache)
await fetchWithRetry(
  "post",
  "/api/consultations/complete",
  "save-consultation",
  payload,
  (data) => data
);
```

**Cache invalidation:**

After saving a consultation, the app manually clears stale caches:
```js
sessionStorage.removeItem(`fc:patient-history:${patientId}`);
sessionStorage.removeItem("fc:dashboard-stats");
```

### Symptom Suggestion Cache (`SymptomAnalysisSection.jsx`)

A module-level `Map` caches suggestion API results by sorted symptom IDs:

```js
const suggestionCache = new Map();
// Key: "1,3,7" (sorted IDs joined)
// Value: array of suggested medicines
```

Same symptom combination = instant result from cache, no network call.

---

## Performance Optimisations

The following optimisations are implemented to make the app feel fast:

### 1. Static data preloaded at login

`App.jsx` dispatches all 4 data thunks immediately on authenticated mount:

```js
useEffect(() => {
  dispatch(fetchSymptoms());
  dispatch(fetchTests());
  dispatch(fetchMedicines());
  dispatch(fetchNeuroOptions());
}, [dispatch]);
```

By the time the user navigates to "New Consultation", all dropdown data is already in Redux. The page opens instantly with no loading spinner.

### 2. NeurologicalExamSection is lazy-loaded

The largest section is loaded only when the browser is idle:

```js
const NeurologicalExamSection = lazy(() => import("./NeurologicalExamSection"));

// In JSX:
<Suspense fallback={<div className="h-24 rounded-2xl bg-gray-50 animate-pulse" />}>
  <NeurologicalExamSection ... />
</Suspense>
```

### 3. One batch API call instead of 7

Saving a consultation calls `POST /api/consultations/complete` — one HTTP request, one database transaction. Previously required 7 sequential API calls.

### 4. No redundant validation on submit

`ConsultationForm` previously ran its own `validateMedicines()` (set `isValidating=true/false`) which caused 2-3 extra re-renders per submit click — visible as a flicker. Removed. Validation happens once in `PatientConsultation.submitConsultation` inline, then submit fires immediately.

### 5. sessionStorage cache for GET requests

Every `fetchWithRetry` GET call with a `cacheKey` stores the response for 5 minutes. Navigating back to a patient or reopening dropdowns serves cached data instantly.

### 6. Symptom suggestion cache

Module-level Map prevents identical suggestion API calls for the same symptom selection within a session.

### 7. Debounced patient search

Patient search is debounced at 150ms — prevents firing an API call on every keystroke.

### 8. In-memory patient cache

`PatientSearch` keeps a local 15-minute cache per patient (`cache.get("search:03001234567")`). Searching the same patient twice skips both the search API and the history API calls entirely.

### 9. Backend Gzip compression

All backend responses are Gzip-compressed (~70% smaller). Works automatically with Axios — no frontend changes needed.

### 10. HTTP Cache-Control headers

Medicines, symptoms, tests (5 min) and neuro-options (1 hour) have `Cache-Control: public, max-age=300` headers set by the backend. Browsers and proxies serve these from cache without hitting the server.

---

## Printing Prescriptions

`src/utils/printConsultation.js` generates a bilingual (English + Urdu) prescription layout and triggers the browser print dialog.

**What is printed:**
- Patient name, age, gender
- Visit date
- Vital signs (if recorded)
- Symptoms
- Diagnosis (from neuro exam)
- Prescribed medicines — each with dosage, frequency, duration, and instructions in both English and Urdu
- Tests ordered
- Follow-up date and notes
- Doctor name and clinic branding

**Printing is triggered automatically after saving** a consultation. It can also be triggered manually using the "Print Prescription Only" button without saving.

---

## Authentication

Authentication state lives in `src/utils/auth.js` and uses `localStorage`:

```js
// Save token after login
setToken(token);           // localStorage.setItem("token", token)

// Read token for API calls
getToken();                // localStorage.getItem("token")

// Check if user is logged in
isLoggedIn();              // !!getToken()

// Log out and clear storage
logout();                  // localStorage.removeItem("token")
```

`App.jsx` guards all routes — if `isLoggedIn()` returns false, only `LoginPage` is rendered.

`fetchWithRetry` automatically attaches the token to every request as a `Bearer` header and calls `logout()` + redirects to `/` on receiving a `401` response.

---

## Component Reference

### PatientSearch

The main page. Handles:
- Debounced search form
- Patient profile display
- Consultation history with pagination
- "New Consultation" navigation
- Patient registration when not found

### PatientConsultation

The consultation entry form. Handles:
- Loading patient data by ID from URL params
- Reading preloaded Redux state (symptoms, tests, medicines, neuroOptions)
- Building the batch payload
- Calling `POST /api/consultations/complete`
- Resetting form state after save
- Triggering print
- Busting stale caches

### ConsultationForm

Pure presentational layout component. Renders all form sections in order and provides Save/Print buttons. No network calls. No validation logic.

### SymptomAnalysisSection

- Multi-select symptom dropdown
- Fetches medicine suggestions when symptoms change (with module-level cache)
- 500ms debounce before triggering suggestion API

### PrescriptionManagementSection

- Displays selected medicines with full field set (dosage/frequency/duration/instructions in English + Urdu)
- Inline "Add New Medicine" form — POSTs to backend and immediately updates Redux via `addMedicine()` action
- No page refresh needed after adding a new medicine

### NeurologicalExamSection (lazy-loaded)

40-field neurological exam with dropdowns for each field. Options loaded from `/api/neuro-options/all`. Lazy-loaded to avoid including it in the initial JS bundle.

### DashboardPage

Reads `store.dashboard` and dispatches `fetchDashboardStats()` on mount. Automatically uses cached data if fetched within the last minute.

---

## Common Issues and Fixes

### Consultation save returns 400 Bad Request

**Cause:** One or more selected medicines have `medicine_id = 0` (empty row) or an ID that doesn't exist in the database.

**Fix:** The submit code now filters these out:
```js
const validMeds = selectedMedicines.filter(
  (med) => med.medicine_id && Number(med.medicine_id) > 0
);
```

If it still fails, open browser DevTools > Console and look for:
```
Consultation save failed: { error: "Bad Request", details: "Medicine IDs do not exist: 5" }
```
Then go to `GET /api/medicines` on the backend and verify those IDs exist.

### New consultation page takes a long time to load

**Cause:** Static data (medicines, symptoms, tests, neuro-options) was being fetched on every consultation page mount.

**Fix:** Data is now preloaded in `App.jsx` at login. By the time you navigate to a consultation, all dropdown data is already in Redux.

### Screen blinks when clicking Save

**Cause:** Previously, `ConsultationForm` ran its own `validateMedicines()` which set `isValidating=true/false` — causing extra re-renders before and after validation. Now removed.

### Patient search is slow on repeat searches

**Cause:** `&t=Date.now()` was appended to the history URL, defeating the sessionStorage cache. Fixed — repeat searches for the same patient now return cached history instantly.

### Medicines dropdown is empty after adding a new medicine

**Cause:** The new medicine was not reflected in Redux until the next page reload.

**Fix:** `PrescriptionManagementSection` calls `dispatch(addMedicine(newMedicine))` immediately after a successful POST, inserting the new medicine into Redux without any refetch.

### "Patient not found" even though the patient exists

**Cause:** Search requires exactly an 11-digit mobile number or a name with only letters and spaces. Check the format.

**Cause 2:** The in-memory search cache (15 min TTL) might hold a stale "not found" result. Clear it by refreshing the page.

### Print dialog does not open

**Cause:** Browser popup blocker prevented the `window.print()` call.

**Fix:** Allow popups for `localhost:5173` in browser settings.

### JWT expired — app stuck on blank page

**Cause:** Token in `localStorage` has expired (24h default).

**Fix:** `fetchWithRetry` handles this automatically — calls `logout()` and redirects to `/` on `401`. If the redirect loop persists, manually clear `localStorage` in DevTools and reload.
