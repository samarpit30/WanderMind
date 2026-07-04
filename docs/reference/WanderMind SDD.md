# SDD — WanderMind
### Software Design Document for Phased Vibe-Coding Execution
Companion to: `docs/PLAN.md` (timing) and `docs/PRD.md` (product/UX). This document is the **technical contract** — everything needed to actually build the app, phase by phase.

---

## 0. How to Use This Document (read this first, Antigravity)

This SDD is written to be handed to an AI coding agent (Antigravity, running Gemini Flash) with instructions like:

> "Prepare implementation plan for Phase 1." → "Execute the implementation plan for Phase 1."

Rules for every phase:
1. Read the **Global Design** sections (1–13) once — they are constraints that apply to every phase, not just one.
2. Read only your target phase's section under **Section 14: Phased Execution Plan**.
3. Produce an implementation plan (files to create/edit, in order) **before** writing code, and check it against that phase's **Acceptance Criteria** before declaring the phase done.
4. Never modify files listed as owned by a later phase unless the current phase's plan explicitly requires a stub for them.
5. Commit to git at the end of every phase (see Section 12 for convention). Do not skip this — it's the rollback safety net.
6. If a phase's instructions conflict with something already built in an earlier phase, **earlier phase wins** — stop and flag it rather than silently refactoring past work.
7. Phase numbering in this document is authoritative and starts at **Phase 1** (supersedes the Phase 0-9 numbering used in the earlier `PLAN.md` draft — Phase 1 here = setup/scaffold).

---

## 1. Tech Stack Manifest

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Single repo, frontend + serverless API routes |
| Language | TypeScript throughout | No `.js`/`.jsx`, strict mode on |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, accessible defaults |
| Map | Google Maps JavaScript API via `@vis.gl/react-google-maps` | React-idiomatic wrapper, avoids manual DOM map mounting |
| Client state | Zustand | Simpler than Redux, no boilerplate — matches hackathon speed |
| Persistence | `localStorage` (via a tiny Zustand persist middleware) | No DB in v1 |
| LLM | Google Gemini API via `@google/genai` SDK | Model: `gemini-2.5-flash` default |
| Maps data | Google Maps Platform: Places API (New), Routes API, Geocoding API | Enable all three in the same GCP project as the Maps JS key |
| Hosting | Vercel | Connected directly to the GitHub repo for auto-deploy on push |
| Source control | GitHub (public repo, for hackathon submission) | |

---

## 2. Repository Structure

```
wandermind/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Home screen (map + search/path/chat shell)
│   ├── globals.css
│   └── api/
│       ├── agent/route.ts            # POST — main Gemini orchestrator endpoint
│       └── traffic-check/route.ts    # POST — polls traffic status for an active itinerary
├── components/
│   ├── onboarding/
│   │   └── PersonaPicker.tsx
│   ├── map/
│   │   ├── MapCanvas.tsx
│   │   └── RoutePolyline.tsx
│   ├── search/
│   │   ├── ModeToggle.tsx            # Location vs Path mode
│   │   ├── LocationSearchBox.tsx
│   │   └── PathSearchBox.tsx
│   ├── recommendations/
│   │   ├── RecommendationsPanel.tsx
│   │   ├── RecommendationCard.tsx
│   │   └── PlaceDetailSheet.tsx
│   ├── chat/
│   │   ├── ChatBubbleButton.tsx
│   │   ├── ChatPanel.tsx
│   │   └── AgentsAtWorkStrip.tsx
│   ├── itinerary/
│   │   ├── ItineraryScreen.tsx
│   │   ├── ItineraryTimeline.tsx
│   │   └── TrafficAlertBanner.tsx
│   └── ui/                           # shadcn/ui primitives live here
├── lib/
│   ├── gemini/
│   │   ├── client.ts                 # Gemini SDK init
│   │   ├── systemPrompt.ts           # Orchestrator system prompt (Section 9.2)
│   │   ├── functionDeclarations.ts   # Section 9.3 — all 8 tool schemas
│   │   └── orchestrator.ts           # Function-calling loop (Section 9.4)
│   ├── tools/
│   │   ├── geocodeLocation.ts
│   │   ├── searchPlaces.ts
│   │   ├── getPlaceDetails.ts
│   │   ├── scorePersonaMatch.ts
│   │   ├── getDirectionsOptimized.ts
│   │   ├── getTrafficStatus.ts
│   │   ├── buildOrUpdateItinerary.ts
│   │   └── generatePlaceStory.ts
│   ├── maps/
│   │   └── googleMapsClient.ts       # Thin fetch wrappers for Places/Routes/Geocoding REST calls
│   ├── store/
│   │   └── useAppStore.ts            # Zustand store (Section 6)
│   └── types/
│       └── index.ts                  # Section 5 — all shared TypeScript types
├── docs/
│   ├── PLAN.md
│   ├── PRD.md
│   ├── SDD.md                        # this file
│   └── user-guides/                  # created in Phase 1 — see Section 15
│       ├── 01-google-maps-api-key.md
│       ├── 02-gemini-api-key.md
│       ├── 03-github-setup-and-push.md
│       ├── 04-vercel-deployment.md
│       └── 05-hackathon-submission.md
├── public/
├── .env.local.example
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## 3. Environment Variables Contract

Defined in `.env.local` (never committed — see `.gitignore` in Phase 1) and mirrored in `.env.local.example` (committed, values blank):

```
GOOGLE_MAPS_API_KEY=        # server-side calls: Places, Routes, Geocoding
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=   # client-side Maps JS rendering (can be same key with HTTP referrer restriction)
GEMINI_API_KEY=             # server-side only, never exposed to client
```

Same three variables must be added to the Vercel project's Environment Variables settings before/at deploy time (see Section 15.4 user guide).

---

## 4. Global Data Models (`lib/types/index.ts`)

```typescript
export type PersonaTag =
  | "heritage_temples"
  | "nature_hiking"
  | "foodie"
  | "art_museums"
  | "nightlife_social"
  | "family_friendly"
  | "offbeat_hidden_gems";

export interface UserPersona {
  tags: PersonaTag[];        // 1-3 selected
  freeText?: string;         // optional "in your own words"
}

export interface Place {
  placeId: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  rating?: number;
  reviewCount?: number;
  photoUrl?: string;
  priceLevel?: number;
  openingHoursToday?: string;
  topReviews?: string[];      // summarized, max 3
}

export interface PersonaScore {
  placeId: string;
  score: number;              // 0-100
  reason: string;             // one-line rationale
}

export interface ItineraryStop {
  place: Place;
  order: number;
  arrivalEstimate: string;    // ISO time or "HH:mm"
  durationHereMinutes: number;
  travelToNextMinutes?: number;
  travelToNextMode?: "driving" | "walking" | "transit";
}

export interface Itinerary {
  stops: ItineraryStop[];
  totalDurationMinutes: number;
  totalDistanceKm: number;
  polyline: string;            // encoded polyline for map rendering
}

export interface TrafficAlert {
  legIndex: number;
  affectedPlaceName: string;
  typicalDurationMinutes: number;
  currentDurationMinutes: number;
  delayMinutes: number;
}

export type SearchMode = "location" | "path";

export interface ChatMessage {
  role: "user" | "assistant";
  text?: string;
  recommendedPlaces?: Place[];  // if assistant response renders cards inline
  timestamp: number;
}
```

---

## 5. State Management Design (`lib/store/useAppStore.ts`)

Single Zustand store (persisted to localStorage for FR-16), shape:

```typescript
interface AppState {
  persona: UserPersona;
  searchMode: SearchMode;
  locationQuery: { lat: number; lng: number; formattedAddress: string } | null;
  pathQuery: { origin: {...}; destination: {...} } | null;
  recommendations: Place[];
  personaScores: Record<string, PersonaScore>;  // keyed by placeId
  activePlan: Place[];                          // selected-but-not-yet-optimized
  itinerary: Itinerary | null;
  trafficAlerts: TrafficAlert[];
  chatHistory: ChatMessage[];
  uiStatus: "idle" | "loading" | "error";
  statusMessage?: string;   // drives the "Scouting places near..." style loading copy

  // actions
  setPersona, setSearchMode, setLocationQuery, setPathQuery,
  setRecommendations, addToPlan, removeFromPlan, setItinerary,
  pushTrafficAlert, resolveTrafficAlert, pushChatMessage, setUiStatus
}
```

Rule: **every** action above must be triggerable both from a UI component and from the orchestrator's tool results — no action should exist that only chat can reach or only manual UI can reach (enforces PRD's "two doors, one destination" principle).

---

## 6. UI Component Inventory

Each entry: purpose, key props/state, and which store actions it reads/writes. (Full visual/UX spec is in `PRD.md` Section 5 — this is the technical contract for props/data only.)

| Component | Reads from store | Writes to store | Notes |
|---|---|---|---|
| `PersonaPicker` | `persona` | `setPersona` | Onboarding + re-editable later from a pill row |
| `ModeToggle` | `searchMode` | `setSearchMode` | Simple 2-way toggle |
| `LocationSearchBox` | — | `setLocationQuery` | Wraps Google Places Autocomplete widget |
| `PathSearchBox` | — | `setPathQuery` | Two autocomplete inputs (origin/destination) |
| `MapCanvas` | `locationQuery`, `pathQuery`, `itinerary` | — | Renders pins + polyline; passive display component |
| `RecommendationsPanel` | `recommendations`, `personaScores`, `uiStatus` | — | Maps over `Place[]`, renders `RecommendationCard` |
| `RecommendationCard` | one `Place` + its `PersonaScore` | `addToPlan` | `＋ Add to Plan` button |
| `PlaceDetailSheet` | one `Place` (+ score) | `addToPlan` | Includes "Hear the story" trigger → calls `/api/agent` with `generate_place_story` intent |
| `ChatPanel` | `chatHistory`, `uiStatus` | `pushChatMessage`, all store actions (via orchestrator response) | The single most "multi-purpose" component — must be able to trigger every store action |
| `AgentsAtWorkStrip` | `uiStatus`, `statusMessage` | — | Cosmetic, driven by function-call progress events |
| `ItineraryScreen` | `itinerary`, `trafficAlerts` | — | Container for timeline + map + alerts |
| `ItineraryTimeline` | `itinerary.stops` | `removeFromPlan`, reorder action | Manual override controls |
| `TrafficAlertBanner` | `trafficAlerts` | `resolveTrafficAlert`, `removeFromPlan` | Non-blocking banner, not a modal |

---

## 7. Backend API Route Design

### 7.1 `POST /api/agent`
The single endpoint both the manual UI and the chat panel call.

**Request:**
```typescript
{
  message?: string;               // present for chat-driven turns
  intent?: "search" | "build_itinerary" | "rescore" | "get_story"; // present for manual-UI-driven turns, bypassing NL parsing when the user already clicked something specific
  context: {
    persona: UserPersona;
    searchMode: SearchMode;
    locationQuery?: {...};
    pathQuery?: {...};
    activePlan?: Place[];
    chatHistory?: ChatMessage[];   // last N turns for context (FR-14)
  }
}
```

**Response:**
```typescript
{
  assistantText?: string;         // only for chat turns
  recommendations?: Place[];
  personaScores?: PersonaScore[];
  itinerary?: Itinerary;
  story?: string;
  clarifyingQuestion?: string;    // if orchestrator can't proceed confidently
  toolTrace?: string[];           // ordered list of tool names called, drives AgentsAtWorkStrip
}
```

Internally: builds a Gemini request with the system prompt (9.2), the 8 function declarations (9.3), and runs the orchestration loop (9.4) until Gemini returns a final text/structured response with no more pending function calls.

### 7.2 `POST /api/traffic-check`
Lightweight, called on an interval (e.g. every 30-60s) by `ItineraryScreen` while an itinerary is active — **does not** go through Gemini, calls `getTrafficStatus` tool function directly for efficiency (FR-11 doesn't need LLM reasoning, just a data check + threshold rule).

**Request:** `{ itinerary: Itinerary }`
**Response:** `{ alerts: TrafficAlert[] }`

---

## 8. Google Maps Platform Integration Spec

Enable in the same GCP project: **Places API (New)**, **Routes API**, **Geocoding API**. All three billed to the same key; restrict the server-side key by API only (no HTTP referrer restriction on the server key), and restrict the `NEXT_PUBLIC_` client key by HTTP referrer (the Vercel deployment domain) — detailed in the Phase 1 user guide (Section 15.1).

| Tool function | Google endpoint |
|---|---|
| `geocodeLocation` | `GET https://maps.googleapis.com/maps/api/geocode/json` |
| `searchPlaces` | `POST https://places.googleapis.com/v1/places:searchNearby` or `:searchText` |
| `getPlaceDetails` | `GET https://places.googleapis.com/v1/places/{place_id}` |
| `getDirectionsOptimized` | `POST https://routes.googleapis.com/directions/v2:computeRoutes` with `optimizeWaypointOrder: true` |
| `getTrafficStatus` | Same Routes API endpoint, re-queried with `routingPreference: TRAFFIC_AWARE` and `departureTime: now`, diffed against the original itinerary's stored typical duration |

"Path mode" experiences (FR-2) are approximated by sampling 3-5 evenly spaced points along the origin→destination polyline and running `searchPlaces` around each sampled point, then deduplicating by `placeId`.

---

## 9. Gemini Integration Spec

### 9.1 SDK & Model
- Package: `@google/genai`
- Model: `gemini-2.5-flash` for the orchestrator and persona scoring (latency-critical). `generate_place_story` may use the same model — only escalate to a heavier model if flash output quality is noticeably weak in testing.
- Client initialized server-side only (`lib/gemini/client.ts`), using `GEMINI_API_KEY` — **never** import this client in any file under `components/` or anything shipped to the browser.

### 9.2 System Prompt (skeleton, refine during Phase 3)
```
You are the WanderMind orchestrator. You coordinate four capabilities via tools:
- Geo/Places Scout (geocode_location, search_places, get_place_details)
- Persona Analyst (score_persona_match)
- Route Planner (get_directions_optimized, build_or_update_itinerary)
- Traffic Watcher (get_traffic_status)
- Storyteller (generate_place_story)

Given the user's persona, current search mode, and message, decide which tools to call
and in what order. Always resolve to one of: a list of scored recommendations, a built/updated
itinerary, a generated story, or a single clarifying question if the request is ambiguous.
Never respond with plain prose only when a tool-backed result is possible.
```

### 9.3 Function Declarations
One `FunctionDeclaration` per tool in Section 4 of the PRD tool table. Example (two shown, all 8 follow the same pattern — implement all 8 in `lib/gemini/functionDeclarations.ts`):

```typescript
import { Type } from "@google/genai";

export const searchPlacesDeclaration = {
  name: "search_places",
  description: "Find candidate places near a point or set of sampled points, optionally filtered by category/keyword.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      lat: { type: Type.NUMBER },
      lng: { type: Type.NUMBER },
      radiusM: { type: Type.NUMBER },
      category: { type: Type.STRING },
      keyword: { type: Type.STRING },
    },
    required: ["lat", "lng", "radiusM"],
  },
};

export const scorePersonaMatchDeclaration = {
  name: "score_persona_match",
  description: "Score how well a place fits the user's selected interest personas, 0-100, with a one-line reason.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      placeId: { type: Type.STRING },
      placeCategory: { type: Type.STRING },
      placeName: { type: Type.STRING },
      personaTags: { type: Type.ARRAY, items: { type: Type.STRING } },
      freeText: { type: Type.STRING },
    },
    required: ["placeId", "placeCategory", "placeName", "personaTags"],
  },
};
```
`score_persona_match` additionally uses `responseSchema` (structured output) so its result is guaranteed parseable JSON matching `PersonaScore`, not free text.

### 9.4 Orchestration Loop (pseudocode for `lib/gemini/orchestrator.ts`)
```
1. Build contents[] = systemPrompt + chatHistory + latest user message/intent
2. Call gemini.generateContent({ model, contents, tools: [allDeclarations] })
3. While response.functionCalls is non-empty:
     for each functionCall:
       result = executeLocalTool(functionCall.name, functionCall.args)   // dispatch to lib/tools/*
       append functionResponse(result) to contents
     re-call gemini.generateContent with updated contents
4. Once no more functionCalls: return response.text (+ any structured data collected along the way)
5. Record every functionCall.name into toolTrace[], returned to the client for AgentsAtWorkStrip
```
This loop lives entirely in the `/api/agent` route handler — no client-side Gemini calls, ever (protects the API key).

---

## 10. Tool Implementation Specs (`lib/tools/*.ts`)

Each file exports a single async function matching its declaration's parameters, calling the relevant Google Maps REST endpoint (via `lib/maps/googleMapsClient.ts`) or, for persona scoring/storytelling, a direct Gemini `generateContent` call scoped to that single task (not through the orchestrator loop — a nested single-purpose call is fine and keeps scoring/story generation fast and isolated).

| File | Signature | Internal steps |
|---|---|---|
| `geocodeLocation.ts` | `(query: string) => Promise<{lat, lng, formattedAddress}>` | Call Geocoding API, take first result |
| `searchPlaces.ts` | `(params) => Promise<Place[]>` | Call Places `searchNearby`/`searchText`, map response fields to `Place` |
| `getPlaceDetails.ts` | `(placeId: string) => Promise<Place>` | Call Place Details, extract/summarize top 3 reviews (paraphrase in-code prompt if using Gemini to summarize, or truncate raw text — prefer paraphrase to respect content ToS) |
| `scorePersonaMatch.ts` | `(place, personaTags, freeText?) => Promise<PersonaScore>` | Single Gemini call with `responseSchema` locking output to `{score, reason}` |
| `getDirectionsOptimized.ts` | `(origin, destination, waypoints, mode) => Promise<Itinerary>` | Call Routes API `computeRoutes` with `optimizeWaypointOrder: true`, map legs to `ItineraryStop[]` |
| `getTrafficStatus.ts` | `(itinerary: Itinerary) => Promise<TrafficAlert[]>` | Re-call Routes API per leg with live traffic, diff vs stored typical duration, threshold e.g. >15% or >10 min triggers alert |
| `buildOrUpdateItinerary.ts` | `(places, timeBudgetHrs, action) => Promise<Itinerary>` | Wraps `getDirectionsOptimized`, applies time-budget trimming if candidate stops exceed budget |
| `generatePlaceStory.ts` | `(place, tone?) => Promise<string>` | Single Gemini prose call, no schema, 3-4 sentences, explicitly prompted to stay factual/respectful for heritage content |

---

## 11. Persona Scoring Design Detail

- Scoring is **per place, per call** (not batched) in v1 for simplicity — acceptable at hackathon scale (≤20 candidate places per search).
- Prompt to Gemini for `scorePersonaMatch` includes: place name, category, and the user's selected persona tags + free text, and asks for a 0-100 fit score **and** a one-line reason a human would find convincing (not just "matches tag X").
- Score bands for UI color-coding (component-level, not a tool concern): `≥80` green, `50-79` amber, `<50` gray/muted — still shown, never hidden, so users see the full picture with honest confidence.

---

## 12. Route Optimization & Itinerary Design Detail

- `optimizeWaypointOrder: true` in the Routes API request handles the TSP-style ordering — no custom optimization algorithm needs to be written.
- Time budget: if user hasn't specified one, default assumption = 4 hours from "now." If optimized total duration exceeds budget, `buildOrUpdateItinerary` drops the lowest persona-scored stop(s) first and recomputes, repeating until within budget — this rule must be implemented explicitly, not left to the LLM to "decide" ad hoc, so behavior is predictable and testable.
- Manual reorder (FR-10) bypasses the optimizer entirely — it's a client-side array reorder that just recalculates leg-by-leg travel times via a direct (non-optimized) `computeRoutes` call for the new fixed order.

---

## 13. Real-Time Traffic & Error Handling

- Polling interval: 45 seconds while `ItineraryScreen` is mounted and an itinerary exists; stopped on unmount (avoid burning API quota during idle screens).
- Alert threshold: delay ≥ 10 minutes OR ≥ 20% over typical, whichever is more lenient (avoid alert fatigue on tiny fluctuations).
- **Fallback chain** (must be implemented, not optional):
  1. Gemini call fails/times out (>8s) → UI shows "AI is a bit slow right now — try the manual search instead" and the manual search/recommendation path (which doesn't require Gemini for `searchPlaces`/`getPlaceDetails`, only for scoring) still functions with scores marked "unavailable" rather than blocking the whole panel.
  2. Routes API optimization call fails → fall back to a simple sequential (as-added) order with a plain (non-optimized) directions call, and label the itinerary "Basic order — optimization unavailable" rather than crashing.
  3. Any tool call error → caught, logged, and returned to the orchestrator loop as a functionResponse containing an `error` field so Gemini can decide to retry, skip, or ask the user — never let an unhandled exception reach the client.

---

## 14. Phased Execution Plan

Each phase below is self-contained: give Antigravity **only** that phase's block plus the Global Design sections above.

### **Phase 1 — Project Setup, Dependencies, Deployment Pipeline & User Guides**
**Objective:** A running, empty-but-wired Next.js app, pushed to GitHub, deployed on Vercel, with every external account/key documented for the human in plain-language guides.

**Instructions to Antigravity:**
1. Scaffold Next.js (App Router, TypeScript, Tailwind) per Section 2's repository structure.
2. Install all dependencies from Section 1 (`@vis.gl/react-google-maps`, `zustand`, `@google/genai`, shadcn/ui, etc.).
3. Create `.env.local.example` per Section 3 (blank values) and `.gitignore` (must include `.env.local`, `node_modules`, `.next`, `.vercel`).
4. Stub every file in the repo structure (Section 2) with minimal placeholder content/types so later phases only fill in logic, not create new files from scratch.
5. Create `vercel.json` (minimal — Next.js needs almost no config) and confirm `next.config.ts` is deployment-ready.
6. Initialize git (`git init`), make the first commit ("Phase 1: scaffold + deps + guides").
7. **Create the full `docs/user-guides/` folder** (see Section 15 below) — this is a Phase 1 deliverable, not optional polish, because the human needs these guides *before* they can supply working API keys for later phases.
8. Attempt GitHub repo creation/push via CLI if authenticated (`gh repo create` + `git push`); if not authenticated, stop and clearly tell the human to follow `docs/user-guides/03-github-setup-and-push.md` themselves, then continue once they confirm the repo exists.
9. Attempt to connect the repo to Vercel via CLI (`vercel link` / `vercel --prod`) if authenticated; otherwise instruct the human to follow `docs/user-guides/04-vercel-deployment.md`.

**Acceptance Criteria:**
- `npm run dev` runs with no errors and shows a blank shell page.
- `npm run build` succeeds (Vercel will run this same command).
- All 5 user guide files exist, are complete, and are written so a first-time, non-technical person could follow them unassisted.
- Repo exists on GitHub (public), first commit pushed.
- A live Vercel URL exists (even if it just shows a placeholder page) — needed early since hackathon submission requires both URLs, and confirming the pipeline works *now* avoids a last-minute deployment failure.

---

### **Phase 2 — Input UI: Location & Path Picker + Persona Onboarding**
Build `PersonaPicker`, `ModeToggle`, `LocationSearchBox`, `PathSearchBox`, `MapCanvas` (pins only, no route yet), and wire them to the Zustand store (Section 6). No Gemini calls yet — pure UI + Geocoding API for pin placement.
**Acceptance:** user can complete persona onboarding, search a location or a path, and see pin(s) on the map; state is visible in Zustand devtools/localStorage.

### **Phase 3 — Gemini Orchestrator + Core Tools**
Implement `lib/gemini/*` (client, system prompt, function declarations, orchestration loop) and the `geocodeLocation`, `searchPlaces`, `getPlaceDetails` tools. Wire `/api/agent` route. Wire `ChatPanel` and `AgentsAtWorkStrip` to call it. A location/path submission (manual or chat) now returns real places.
**Acceptance:** searching (either mode) returns real Google-sourced places with name/rating/category rendered as basic cards (styling can be rough — Phase 4 polishes).

### **Phase 4 — Persona-Scored Recommendations**
Implement `scorePersonaMatch` tool with `responseSchema`. Build out `RecommendationCard` fully (badge, reason, sort control) and `PlaceDetailSheet` (minus the storytelling button, that's Phase 9).
**Acceptance:** same location/persona combo yields visibly different top results and match% for two different personas tested side by side.

### **Phase 5 — Itinerary Builder + Optimized Route**
Implement `getDirectionsOptimized` and `buildOrUpdateItinerary`. Build `ItineraryScreen`, `ItineraryTimeline`, `RoutePolyline`. Wire "Add to Plan" → "Build My Plan" flow end to end.
**Acceptance:** selecting 3-5 places and building a plan renders an ordered route + timeline with total time/distance, both via manual clicks and via a chat request.

> **End of Hour 1 / mandatory scope. Commit, tag as `v1-core`, and rehearse the demo script from `PLAN.md` Section 7 before proceeding.**

### **Phase 6 — Real-Time Traffic Alerts**
Implement `getTrafficStatus`, `/api/traffic-check` route, the 45s polling hook, `TrafficAlertBanner`, and the remove/keep resolution flow.
**Acceptance:** an artificially-delayed leg (can be tested by mocking a high `currentDuration`) surfaces a banner and resolves correctly on either action.

### **Phase 7 — Deepened Place Info**
Extend `getPlaceDetails`/`PlaceDetailSheet` with review highlights, photo carousel, price level, "closing soon" logic.

### **Phase 8 — Conversational Refinement**
Wire multi-turn `chatHistory` into `/api/agent` requests; test follow-up edits ("swap X for something offbeat") and clarifying-question fallback.

### **Phase 9 — Storyteller Agent**
Implement `generatePlaceStory` tool + "✨ Hear the story" button in `PlaceDetailSheet`, clearly labeled AI-generated.

### **Phase 10 — Multi-Agent UI Polish**
Wire `toolTrace` from `/api/agent` responses into a fuller `AgentsAtWorkStrip` animation (each named role lighting up in sequence).

### **Phase 11 — Stretch (only if time remains)**
Local events surfacing, shareable plan URL, localStorage persistence hardening, voice input.

---

## 15. User Guide Deliverables (Phase 1 output — `docs/user-guides/`)

Write every guide below **for a complete beginner** — numbered steps, no jargon, explicitly say what to click and where, insert `[SCREENSHOT: describe what should be shown here]` placeholders at each key step so they can be filled in later. Each guide ends with a "✅ How to know it worked" check.

### `01-google-maps-api-key.md`
Steps: create/select a Google Cloud project → enable billing (mention it's normally free within hackathon usage but Google requires a card on file) → enable the three needed APIs by name (Places API (New), Routes API, Geocoding API) → create an API key under "Credentials" → (optional but recommended) restrict the key → copy the key into `.env.local`. End with: "✅ paste this test URL with your key into a browser, you should see JSON not an error."

### `02-gemini-api-key.md`
Steps: go to Google AI Studio → sign in → "Get API key" → create key in a new or existing project → copy into `.env.local` as `GEMINI_API_KEY`. End with a one-line curl/test-call check.

### `03-github-setup-and-push.md`
Steps: create a free GitHub account if needed → create a new **public** repository (name suggestion given) → copy the remote URL → run the exact `git remote add origin ...`, `git push -u origin main` commands → confirm files appear on github.com. End with: "✅ your repo URL looks like `https://github.com/<you>/<repo>` — save this, you'll need it for hackathon submission."

### `04-vercel-deployment.md`
Steps: create a free Vercel account (sign in with GitHub, one click) → "Add New Project" → import the WanderMind repo → before deploying, add the 3 environment variables from Section 3 in the project settings → click Deploy → wait for the build → copy the live `.vercel.app` URL. End with: "✅ open the URL, you should see the app, not an error page" + a short "if it fails" troubleshooting note (most common cause: missing/misnamed env var).

### `05-hackathon-submission.md`
A short checklist-style doc: what two links are needed (GitHub repo URL + live Vercel URL), where to paste them for the PromptWars/Build with AI submission form, and a reminder to double check the repo is **public** (private repos can't be viewed by judges).

---

## 16. GitHub Workflow Convention

- Branch: work directly on `main` for hackathon speed (no PR overhead) — acceptable given solo/small-team, short timeframe.
- Commit message convention: `Phase N: <short description>` (e.g. `Phase 3: gemini orchestrator + core tools`).
- `README.md` (created in Phase 1) must include: one-line pitch, tech stack, setup instructions (link to the user guides), and the live demo URL (added once Phase 1's deploy succeeds).

---

## 17. Definition of Done (whole project)

- Every P0 functional requirement from `PRD.md` Section 6 works, end-to-end, via both manual UI and chat.
- No unhandled crashes during the rehearsed demo script.
- GitHub repo is public with a clean commit history matching the phases above.
- Vercel deployment is live and matches the latest `main` commit.
- Both URLs recorded and ready to paste into the submission form per `05-hackathon-submission.md`.

---

*This SDD is the full technical contract for build execution. Hand it, along with `PLAN.md` and `PRD.md`, to Antigravity phase by phase per Section 0.*
