# PRD — WanderMind
### Agentic GenAI Platform for Destination Discovery & Cultural Experiences
Version 1.0 | Hackathon build (2-hour scope) | LLM: **Google Gemini API**

---

## 1. Summary

WanderMind helps a traveler discover places and cultural experiences either by **manually picking** a location/path on a map, or by **talking to an AI** in plain language. Every recommendation is scored against the user's personal interests ("persona"), every plan is turned into an **optimized, time-aware route**, and the plan **adapts live** to real-world conditions like traffic. One Gemini-powered orchestrator, using function calling, drives both the manual UI and the conversational UI through the same underlying tools — so nothing is duplicated and nothing behaves inconsistently between "click" and "chat."

This PRD defines **what** to build. Phasing/timeboxing for the 2-hour build lives in `docs/PLAN.md` — this document is the feature/UX/technical contract that plan executes against.

---

## 2. Goals & Non-Goals

### Goals
- G1: Usability first — a first-time user should reach a useful recommendation within 2 taps or 1 sentence, no manual required.
- G2: Every suggestion is explainable — user sees *why* it was recommended for them, not just a rating.
- G3: Plans are actionable — an ordered, time-estimated route, not a list.
- G4: Plans stay true — real-time conditions surface proactively, user stays in control of edits.
- G5: One brain, two doors — manual UI and chat are two entry points into identical underlying logic.

### Non-Goals (explicitly out of scope for this build)
- Payments/bookings (no ticketing, no reservations).
- Multi-day/multi-city trip planning (single-location or single-day-path scope only).
- Offline mode / native mobile apps.
- Real user accounts / cross-device sync (localStorage-based session only).
- Guaranteed accuracy of AI-generated cultural stories (labeled as AI-generated, not verified editorial content).

---

## 3. Users & Personas

Two different "persona" concepts exist in this product — kept distinct on purpose:

1. **User research personas** (who uses the app): solo urban explorer, weekend family tripper, heritage/history enthusiast, backpacker on a tight schedule. Used to sanity-check UX decisions, not shown in-app.
2. **In-app Interest Personas** (feature-facing, user-selected): the tags a user picks that drive recommendation scoring. Fixed taxonomy for v1:

   `Heritage & Temples` · `Nature & Hiking` · `Foodie` · `Art & Museums` · `Nightlife & Social` · `Family-Friendly` · `Offbeat / Hidden Gems`

   A user can pick 1-3 tags, plus one free-text line ("in your own words"). Both feed the persona-match scoring tool.

---

## 4. Experience Principles (governs every UI decision below)

- **Usability over features.** If a feature needs an explanation to use, it's not done yet.
- **Map is always present.** Chat and forms are overlays/panels on top of a persistent map, never a full-screen takeover that hides spatial context.
- **Two doors, one destination.** Every manual action (search box, chip selection, "Add to plan" button) has an equivalent phrase the chat understands, and vice versa — the UI updates identically regardless of entry point.
- **Show confidence, not just content.** Every AI recommendation shows a **persona-match %** and a one-line reason. Every route shows total time. Every alert names the specific delay and gives an immediate action.
- **Never dead-end.** Every screen has an obvious next action (search, add, build plan, resolve alert) — no screen where the user doesn't know what to do next.

---

## 5. UX Flow & Screen Specification

### 5.1 Screen Map
```
[Onboarding: Persona Picker]
        ↓
[Home Screen: Map + Search/Path/Chat]
        ↓
[Recommendations Panel] ←→ [Chat Panel] (same data, two views)
        ↓ (select places)
[Itinerary / Route Screen]
        ↓ (live)
[Real-Time Alert Banner] → (edit) → back to Itinerary
```

### 5.2 Onboarding — Persona Picker
- Single screen, skippable with a sane default ("Offbeat / Hidden Gems" + "Foodie" if skipped, so the app is never persona-less).
- UI: 7 tappable chips (multi-select, max 3 highlighted), one optional text input: *"Tell us more, in your own words"*.
- CTA: **"Start Exploring"** — always enabled, never blocks on required fields.
- Acceptance: takes <15 seconds for a new user to get through this screen.

### 5.3 Home Screen — the core canvas
- **Persistent Google Map** occupying the majority of viewport.
- **Top bar:** mode toggle — `📍 Single Location` / `🧭 Path (A → B)` — each backed by a Places Autocomplete input (one box for location mode, two for path mode).
- **Floating chat bubble/input** (bottom of screen, mobile-style) — always accessible regardless of which mode is active. Placeholder text rotates through examples: *"I'm in Indore for the day, love temples & food..."*
- **Persona chips** shown as a small pill row under the search bar, editable any time (tap to re-open persona picker).
- Acceptance: a user can get from opening the app to a submitted location/path/query in one interaction (one search selection, or one typed sentence + send).

### 5.4 Recommendations Panel
- Slides up from bottom (mobile) / docks left (desktop) once a location or path is set — map stays visible alongside it.
- Each result is a **card**: photo, name, category icon, star rating, **persona-match badge** (e.g. `🟢 92% match — Heritage & Temples`), one-line "why," and an **`＋ Add to Plan`** button.
- Sort control: `Best Match` (default) / `Highest Rated` / `Nearest`.
- Tapping a card opens the **Place Detail Sheet** (5.5).
- Empty/loading state: skeleton cards + a short status line reflecting what the agent is doing (e.g. "Scouting places near Rajwada…") — never a bare spinner, so the user always knows the AI is working and on what.

### 5.5 Place Detail Sheet
- Photo carousel, name, category, rating + review count.
- **Today's hours**, highlighted red if closing soon / closed now.
- 2-3 review highlights (summarized, not verbatim-copied blocks of text).
- Persona-match badge + reason, repeated here for context continuity.
- If persona includes Heritage/Offbeat and place qualifies: **"✨ Hear the story"** button → AI-generated short cultural narrative (clearly labeled *AI-narrated*).
- CTA: `＋ Add to Plan` (same action as the card).

### 5.6 Chat Panel
- Expands from the floating bubble into a slide-up panel; map remains visible above/behind it.
- Standard chat bubbles; assistant messages can **inline-render the same recommendation cards** used in 5.4 (never plain text lists of places — always the rich card).
- A subtle **"Agents at work"** strip appears above the response while processing: e.g. `Understanding request → Scouting places → Scoring for you → Planning route` — lights up step by step. Purely a trust/transparency affordance built on top of Gemini's function-call events.
- User can do everything from chat that they can do manually: search, filter by persona, add/remove from plan, ask for the route, ask "why did you recommend that."

### 5.7 Itinerary / Route Screen
- Map shows the **optimized polyline** connecting selected stops in visiting order, numbered pins (1, 2, 3…).
- Below/beside the map: a **vertical timeline** — `Stop name → Est. arrival → Time here → Travel to next (mode + duration)` — ending with total trip duration/distance.
- Each timeline row has `↑ / ↓` reorder (manual override of the optimizer) and a `✕ Remove` action.
- Sticky bottom CTA: **"Add another stop"** → reopens Recommendations Panel filtered to remaining time budget.
- Acceptance: from 3+ selected places, an ordered route with times renders in one action ("Build My Plan"), no manual sequencing required by default.

### 5.8 Real-Time Alert Banner
- Non-blocking banner pinned above the itinerary timeline (not a modal — never blocks the view of the plan it's talking about).
- Content: `⚠️ Heavy traffic to [Place] — ~25 min longer than usual.` with two inline buttons: `Remove Stop` / `Keep Anyway`.
- On resolution, itinerary + map re-render instantly with the updated route.
- Acceptance: alert must name the specific leg affected and give a same-tap resolution — never just "traffic detected" with no action.

---

## 6. Functional Requirements

Priority key: **P0** = must work for any demo, **P1** = high value if time remains, **P2** = stretch.

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | User can select a single location and view nearby recommended experiences | P0 |
| FR-2 | User can select a From→To path and view experiences meaningfully along/around that path | P0 |
| FR-3 | User can express either of the above (FR-1/FR-2) in free-form natural language via chat, with identical resulting behavior | P0 |
| FR-4 | User can pick 1-3 Interest Personas (+ optional free text) during onboarding, editable anytime | P0 |
| FR-5 | Every recommendation shows a persona-match score (0-100) with a one-line rationale, computed per the user's selected persona(s) | P0 |
| FR-6 | Every recommendation shows Google-sourced detail: rating, review count, opening hours (today), at least one photo | P0 |
| FR-7 | User can view review highlights and price level for a place in a detail view | P1 |
| FR-8 | User can add/remove places to/from an active plan from any surface (card, detail sheet, or chat) | P0 |
| FR-9 | System computes an optimized visiting order + travel time/distance for all places in the active plan | P0 |
| FR-10 | User can manually reorder or remove stops after optimization, with the route recalculating | P1 |
| FR-11 | System periodically checks real-world traffic conditions on the active route and proactively surfaces a delay alert | P1 |
| FR-12 | User can resolve a delay alert by removing the affected stop or dismissing, with the plan updating live | P1 |
| FR-13 | System can generate a short, clearly-labeled AI cultural narrative for a selected (typically heritage/offbeat) place | P1 |
| FR-14 | Chat maintains multi-turn context within a session (follow-ups like "swap the museum for something offbeat" work without re-stating prior context) | P1 |
| FR-15 | System can suggest local events near a location/path, if available via place search | P2 |
| FR-16 | Plan state (persona, selections, itinerary) persists across a page reload via localStorage | P2 |
| FR-17 | User can share the current plan via a URL-encoded link | P2 |

---

## 7. System Architecture (Gemini-specific)

```
┌───────────────────────────────────────────────────────────────────┐
│                     Next.js App (single repo, single deploy)        │
│                                                                       │
│  Frontend: React (App Router) + Tailwind + shadcn/ui                 │
│    Map: Google Maps JavaScript API (@vis.gl/react-google-maps)        │
│    State: Zustand + localStorage                                     │
│                                                                       │
│  Backend: Next.js Route Handlers (serverless)                        │
│    /api/agent — Orchestrator using Gemini API function calling        │
│    /api/traffic-check — lightweight polling endpoint for FR-11        │
└───────────────────────────────────────────────────────────────────┘
        │                                            │
        ▼                                            ▼
 Google Maps Platform                          Gemini API
 (Places API New, Routes API,                  Model: gemini-2.5-flash
  Geocoding API, Distance Matrix)               (speed-optimized; escalate
                                                 to gemini-2.5-pro only if
                                                 a reasoning step under-
                                                 performs in testing)
```

### 7.1 Why Gemini function calling fits this product
- Gemini's native **function calling** (tools passed as `FunctionDeclaration`s with JSON-schema-style parameters) maps directly onto the tool table in Section 8 — no extra agent framework needed.
- Gemini supports **automatic function calling** (SDK auto-executes and loops tool calls) in supported SDKs — reduces boilerplate for the multi-step flows in FR-3 and FR-9 (geocode → search → score → route, chained in one request loop).
- Gemini's **structured output** (`responseSchema`) is used for the persona-scoring tool so `score_persona_match` always returns strict `{score, reason}` JSON, never free text that needs parsing.
- Model choice: default to **`gemini-2.5-flash`** for latency (every user action triggers at least one model round-trip — a slow model directly hurts G1/usability). Only escalate a specific tool (e.g. the cultural storytelling generator, FR-13, which is quality- not latency-critical) to a heavier model if flash output feels thin.

### 7.2 Orchestrator behavior contract
- Single system prompt frames Gemini as a coordinator with four named tool "roles" (Geo/Places Scout, Persona Analyst, Route Planner, Traffic Watcher) — this is what produces the "Agents at work" UI in 5.6, even though it's one model with many tools rather than separate model instances.
- The orchestrator must always terminate in either (a) a set of recommendation cards, (b) an itinerary, or (c) a direct clarifying question — never a bare text paragraph with no UI-actionable result.

---

## 8. Tool / Function Definitions (Gemini `FunctionDeclaration` contracts)

| Tool name | Parameters | Returns | Backing service |
|---|---|---|---|
| `geocode_location` | `query: string` | `{lat, lng, formatted_address}` | Google Geocoding API |
| `search_places` | `{lat, lng, radius_m, category?, keyword?, near_path?: [{lat,lng}]}` | `[{place_id, name, category, rating, lat, lng}]` | Places API (Nearby/Text Search New) |
| `get_place_details` | `{place_id}` | `{name, rating, review_count, top_reviews[], opening_hours, photos[], price_level}` | Places API (Place Details New) |
| `score_persona_match` | `{place, user_personas[], user_free_text?}` | `{score_0_100, reason}` (via `responseSchema`) | Gemini structured output |
| `get_directions_optimized` | `{origin, destination, waypoints[], mode}` | `{ordered_waypoints[], polyline, total_duration, total_distance, legs[]}` | Google Routes API (`optimizeWaypointOrder: true`) |
| `get_traffic_status` | `{route_legs[]}` | `{leg_id, typical_duration, current_duration, delay_minutes, alert: bool}` | Routes API (traffic-aware ETA) |
| `build_or_update_itinerary` | `{places[], time_budget_hrs, action: "build"\|"add"\|"remove"\|"reorder"}` | `{itinerary: [{place, arrival, duration_here, travel_to_next}]}` | Internal logic composing above tools |
| `generate_place_story` | `{place, tone?: "heritage"\|"casual"}` | `{story_text}` (labeled AI-generated in UI) | Gemini generation (no schema, prose) |

All tools registered up front in a single Gemini `tools` array; the orchestrator decides which to call and in what order per turn.

---

## 9. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | First recommendation results should appear within ~5s of a search/chat submission (perceived latency matters more than raw speed — use skeleton states, not blank waits) |
| Reliability | If Gemini or Maps API fails, UI must show a clear inline error + retry, never a silent hang |
| Explainability | No recommendation or route decision is shown without a human-readable reason attached |
| Consistency | Manual UI actions and chat-driven actions must produce identical resulting app state |
| Accessibility | Minimum: sufficient color contrast for badges/alerts, tap targets ≥44px, all icons paired with text labels (no icon-only controls) |
| Data | No PII stored; persona + plan state only, in localStorage, cleared on demand |

---

## 10. Success Metrics (for demo/judging, not production analytics)

- Time from cold-open to first recommendation shown: target < 20 seconds.
- Manual path and chat path both demoed successfully producing the same kind of result.
- At least one live "traffic alert → user edits plan" moment shown working end-to-end.
- Zero unhandled UI dead-ends during the demo walkthrough (Section 7 of `docs/PLAN.md`).

---

## 11. Open Questions / Assumptions

- **Assumption:** Demo city defaults to Indore (local, reliable geocoding/venue data); confirm before Phase 0 if a different city is preferred for the judges' context.
- **Assumption:** "Path" mode experiences are sourced via `search_places` biased along the route polyline (sampling points along the path), not a dedicated "along-route" Places API feature (Google doesn't offer one natively) — acceptable approximation for this scope.
- **Open:** Do we need multi-language support for the demo audience? Assumed English-only for v1 unless stated otherwise.
- **Open:** Confirm Gemini API rate limits available on the hackathon key before relying on multiple tool-calling round trips per user turn — if constrained, reduce to fewer, larger tool batches.

---

*This PRD defines product scope and UX contract. See `docs/PLAN.md` for phased build order and time-boxing against the 2-hour build window.*
