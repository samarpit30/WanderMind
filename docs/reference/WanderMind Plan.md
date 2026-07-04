# Project: WanderMind — Agentic GenAI Travel & Cultural Discovery Platform
**Challenge:** Destination Discovery & Cultural Experiences (PromptWars, Build with AI, In-person)
**Time budget:** 2 hours, vibe-coding hackathon. This document is the execution plan only — no code yet.

---

## 0. Ground Rules for the Next 2 Hours

- **Working software > many features.** If a Hour-2 phase isn't done, cut it — never leave Hour-1 phases half-working.
- **One person "drives the demo path" at all times** — decide now who owns which phase so nobody blocks anyone else.
- **Freeze scope after reading this doc.** No new ideas mid-build. Park them in a `docs/PARKING_LOT.md` if they come up.
- **Every phase ends with a visible, demoable checkpoint** — not just code that compiles.
- **Commit after every phase** (even rough). If something breaks in Hour 2, we revert to the last good commit and still have a demo.

---

## 1. Product Framing (what we're actually building)

**WanderMind** is a map + chat hybrid app. The user either:
1. **Clicks/selects** — pick a location, or pick a From→To path, or pick a persona, on a normal UI, OR
2. **Talks to the AI** — types/says "I'm in Indore for a day, love temples and street food, show me a route" and one Orchestrator Agent does steps 1-6 for them.

Both paths converge on the **same underlying agent tools and same UI state** — the chat is just an alternate "remote control" for the same buttons. This is the key design decision that keeps scope sane: **build the manual UI + tools first, the chat is a thin natural-language layer on top of the exact same tool calls.**

---

## 2. Architecture (optimized for 2-hour build speed)

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App (single repo)              │
│                                                                 │
│  Frontend (App Router, React, Tailwind, shadcn/ui)             │
│   ├─ Map View (Google Maps JS API)                             │
│   ├─ Search / Location / Path picker + Persona chips            │
│   ├─ Chat panel (free-text → Orchestrator)                      │
│   ├─ Recommendation cards (with % persona-match badge)          │
│   └─ Itinerary timeline + optimized route on map                │
│                                                                 │
│  Backend (Next.js API routes = serverless, no separate server) │
│   └─ /api/agent  → Orchestrator (LLM w/ tool use)               │
│        ├─ tool: geocode_location                                │
│        ├─ tool: search_places                                   │
│        ├─ tool: get_place_details                                │
│        ├─ tool: score_persona_match                              │
│        ├─ tool: get_directions_optimized                        │
│        ├─ tool: get_traffic_status                              │
│        └─ tool: build_or_update_itinerary                       │
│                                                                 │
│  State: Zustand (client) + localStorage persistence             │
│  No database in Hour 1. (Optional Firestore in Hour 2 if needed)│
└─────────────────────────────────────────────────────────────┘
        │                                    │
        ▼                                    ▼
 Google Maps Platform                  LLM Provider (Claude/GPT,
 (Places API New, Routes API,           tool-use / function calling)
  Geocoding, Distance Matrix)
```

**Why this stack:**
- Single Next.js repo = one `npm run dev`, one deploy (Vercel), no CORS/auth headaches between frontend/backend — critical for 2-hour velocity.
- Google Maps Platform gives us Places (reviews, hours, photos), Routes (traffic-aware, waypoint optimization) and Geocoding in one ecosystem — matches requirement #4 and #5 directly.
- Tool-use LLM = the "multi-agentic" requirement without needing a heavy agent framework (LangGraph etc.) — we simulate multi-agent behavior via **named tools + a system prompt that assigns each tool a persona/role**, which is 10x faster to build in 2 hours than standing up a real multi-agent orchestration framework. If time allows in Hour 2, we formalize sub-agents (see Phase 9).

**Auth decision:** Skip real authentication. Replace with a 10-second "Tell us about yourself" onboarding (name + persona tags) stored in localStorage. This satisfies "personalization" without burning 20 minutes on OAuth. If a judge asks about auth, the answer is "swappable for Firebase/NextAuth post-hackathon, deliberately deprioritized for demo velocity."

---

## 3. Personas (needed for requirement #3)

Ship with a **fixed, small persona taxonomy** (don't let this become a rabbit hole):
`Heritage & Temples`, `Nature & Hiking`, `Foodie`, `Art & Museums`, `Nightlife & Social`, `Family-Friendly`, `Offbeat/Hidden-Gems`

Onboarding = multi-select chips (pick 1-3) + optional free-text ("in your own words, what do you enjoy?") that the LLM folds into a persona-weight vector. Every recommended place gets a **persona-match badge**: `92% match for you (Heritage & Temples)` — computed by the `score_persona_match` tool (LLM reasoning over place type/category/tags + user's selected personas, returns a 0-100 with one-line justification).

---

## 4. Tool Schemas (for the Orchestrator's tool-use)

Define these early (Phase 0) so all sub-teams build against a stable contract.

| Tool | Input | Output | Backing API |
|---|---|---|---|
| `geocode_location` | `query: string` | `{lat, lng, formatted_address}` | Google Geocoding API |
| `search_places` | `{lat, lng, radius_m, category?, keyword?}` | `[{place_id, name, category, rating, lat, lng}]` | Places API (Nearby/Text Search) |
| `get_place_details` | `place_id: string` | `{name, rating, review_count, top_reviews[], opening_hours, photos[], price_level}` | Places API (Place Details) |
| `score_persona_match` | `{place, user_personas[]}` | `{score_0_100, reason}` | LLM reasoning (no external API) |
| `get_directions_optimized` | `{origin, destination, waypoints[], mode}` | `{ordered_waypoints[], polyline, total_duration, total_distance, legs[]}` | Google Routes API (`optimizeWaypointOrder: true`) |
| `get_traffic_status` | `{route_id or origin/destination}` | `{typical_duration, current_duration, delay_minutes, alert: bool}` | Routes API (traffic-aware duration) |
| `build_or_update_itinerary` | `{places[], time_budget_hrs, action: "build"\|"add"\|"remove"}` | `{itinerary: [{place, arrival, duration, travel_to_next}]}` | Internal logic + above tools |

This table **is the multi-agent contract** — each tool can be framed to the LLM as "you have a Places Scout, a Route Planner, a Persona Analyst, and a Traffic Watcher available to you" — satisfying the "multi-agentic" ask without extra infra.

---

## 5. HOUR 1 — Mandatory Core (must-work, non-negotiable)

Total: 60 min build + rolling smoke-tests. Suggest splitting across teammates by phase if >1 person.

### Phase 0 — Scaffold & Keys (0:00–0:10, 10 min)
- `npx create-next-app` with Tailwind, App Router.
- Install: `@googlemaps/js-api-loader` (or `@vis.gl/react-google-maps`), `zustand`, Anthropic/OpenAI SDK, shadcn/ui basics.
- Get & wire env keys: `GOOGLE_MAPS_API_KEY` (enable Places API New, Routes API, Geocoding API in console), `LLM_API_KEY`.
- Stub `/api/agent` route returning a hello-world tool-use response.
- **Checkpoint:** blank app runs locally, map renders with a default center (Indore, since that's a safe default/local demo city).

### Phase 1 — Input Modes: Location & Path Picker (0:10–0:30, 20 min)
- Single search box with Google Places Autocomplete → sets "Location mode" pin.
- Toggle to "Path mode" → two autocomplete boxes (From / To).
- Persona onboarding chips (multi-select) shown once, saved to Zustand + localStorage.
- **Checkpoint:** user can search a place OR a from→to pair, and see pin(s)/persona saved — no AI yet, pure UI + Geocoding.

### Phase 2 — Orchestrator Agent + Core Tools Wired (0:30–0:55, 25 min)
- Implement `geocode_location`, `search_places`, `get_place_details` as real API-calling functions, registered as LLM tools.
- Orchestrator system prompt: given location/path + personas, call `search_places` (multiple categories relevant to personas), then `get_place_details` for top N.
- Chat panel wired to same orchestrator — free text like "I'm in Indore, love food and temples" should trigger geocode + search_places + persona-relevant filtering.
- **Checkpoint:** searching a location (via UI or chat) returns a list of real places with name/rating/category on screen.

### Phase 3 — Persona-Scored Recommendations (0:55–1:15, 20 min)
- `score_persona_match` tool: for each candidate place, LLM scores fit against user's chosen persona(s), returns score + 1-line reason.
- Recommendation cards show: name, category, rating, **persona-match % badge**, one-line "why this fits you."
- Sort default = persona-match desc; toggle to sort by rating/distance.
- **Checkpoint:** for the same city, a "Heritage" persona and a "Foodie" persona see different top recommendations with visibly different match %.

### Phase 4 — Itinerary Builder + Optimized Route (1:15–1:45, 30 min)
- User selects places from recommendation cards → "Add to plan."
- `get_directions_optimized` (Routes API, `optimizeWaypointOrder: true`) computes best visiting order + travel time between stops.
- Render optimized path as polyline on map + a simple vertical timeline (Place → arrive time est. → travel to next → …).
- **Checkpoint:** pick 3-5 places, hit "Build Itinerary," see an ordered route on the map with total time, not just a straight list.

### Buffer (1:45–2:00 if Hour-1 is where you stop): 15 min
- Bug bash, polish empty/loading states, rehearse the demo script (Section 7).

**Definition of Done for Hour 1:** A user can either (a) pick a location manually or type a free-text request, get persona-scored recommendations with real Google-sourced details, select several, and get an optimized visual route with timing — end to end, no crashes.

---

## 6. HOUR 2 — Additional Features (only if Hour 1 is rock solid)

Ordered by priority — stop at whichever point the clock hits zero.

### Phase 5 — Real-Time Traffic Alerts & Dynamic Re-planning (30 min)
- `get_traffic_status` tool polls current vs. typical duration for each itinerary leg (or re-calls Routes API with `departure_time: now`).
- If `delay_minutes` over threshold → banner: "Heavy traffic to [Place] — 25 min longer than usual. Remove or replace this stop?"
- Add/remove stop → re-runs `build_or_update_itinerary` + `get_directions_optimized`, re-renders route live.
- **This is requirement #6 — high value, do this before pure polish.**

### Phase 6 — Deepened Place Info Panel (15 min)
- Expand `get_place_details` usage: show top 2-3 reviews (paraphrased/summarized, not verbatim — respect review ToS), opening hours today, a photo carousel, price level.
- Click a recommendation card → detail modal/sheet.

### Phase 7 — Conversational Refinement (20 min)
- Multi-turn chat memory (Orchestrator remembers prior turns in the session — pass conversation history each call).
- Handle follow-ups like "swap the museum for something more offbeat" purely via chat.
- Clarifying questions when input is ambiguous ("Did you mean Indore, Madhya Pradesh or another Indore?").

### Phase 8 — Storyteller Agent for "Immersive Storytelling" (15 min)
- New tool/prompt mode: `generate_place_story(place)` → 3-4 sentence narrative/cultural-context blurb (LLM-generated, clearly labeled "AI-narrated"), especially for hidden-gem/heritage spots. Satisfies "generate immersive storytelling" + "promote heritage" explicitly.

### Phase 9 — Formalize Multi-Agent Framing (10 min, cosmetic but demo-valuable)
- Add a small "Agents at work" UI strip during processing: `Persona Analyst → Places Scout → Route Planner → Traffic Watcher` lighting up as each tool fires. Pure UX sugar, but makes the "multi-agentic" story visually obvious to judges.

### Stretch (only with >10 min left)
- Local events tool (`search_places` with `type=event` or a events API) for "suggest local events."
- Shareable itinerary link (encode state in URL).
- Save itinerary to Firestore for persistence across reloads.
- Voice input via Web Speech API into the chat box.

---

## 7. Demo Script (rehearse this in the last 10 minutes regardless of what got cut)

1. Open app → quick persona onboarding (pick "Heritage & Temples" + "Foodie").
2. Type in chat: *"I'm spending a day in Indore, from Rajwada to Sarafa Bazaar, show me meaningful stops."*
3. Show: geocoded path, recommended stops with persona-match badges and one-line reasons.
4. Select 4 stops → Build Itinerary → optimized route + timeline appears on map.
5. (If Phase 5 done) Trigger/show a traffic alert and remove/swap a stop live.
6. (If Phase 8 done) Tap a hidden-gem stop → show the AI-generated cultural story.
7. Close with the architecture one-liner: "One orchestrator, real Google Maps data, persona-aware scoring, and traffic-aware re-planning — all through natural language or manual clicks, same underlying agents."

---

## 8. Risks & Fast Fallbacks

| Risk | Fallback |
|---|---|
| Routes API `optimizeWaypointOrder` too slow/complex to integrate in time | Client-side greedy nearest-neighbor ordering using Distance Matrix API results |
| Google Maps API key/quota issues at venue | Have a second key ready; Mapbox GL as backup map renderer (swap only the map component) |
| LLM tool-use flakiness/latency | Add explicit timeouts + a non-AI manual fallback path (pure UI selection) that never depends on the LLM being up |
| Persona scoring feels arbitrary | Add the LLM's 1-line "reason" next to every score — judges trust explainability more than the raw number |
| Running short on time in Hour 1 | Cut Phase 4's route *optimization* — a simple ordered list with straight-line directions still satisfies "detailed info + basic plan," just not "most efficient" |

---

## 9. Team Split Suggestion (adjust to actual headcount)

- **Person A:** Phase 0 scaffold → Phase 4 route/itinerary (owns map + Routes API).
- **Person B:** Phase 1 input UI → Phase 3 persona scoring UI (owns frontend UX).
- **Person C:** Phase 2 orchestrator + tool wiring → Phase 5/7 (owns LLM/agent logic).
- Everyone: 5-min sync at the top of every phase boundary (0:10, 0:30, 0:55, 1:15, 1:45) to catch integration breaks early.

---

*End of plan. No code has been written yet — this document only. Next step on your go-ahead: scaffold Phase 0.*
