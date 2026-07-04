# WanderMind — Agentic GenAI Travel & Cultural Discovery Platform

**WanderMind** is a map + chat hybrid application that helps travelers discover customized experiences, maps optimized multi-destination routes, and offers real-time itinerary updates using LLM and Google Maps integration.

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS, shadcn/ui, Zustand
- **Map**: Google Maps JavaScript API (via `@vis.gl/react-google-maps`)
- **Backend API**: Next.js Route Handlers
- **LLM/AI**: Google Gemini API via `@google/genai` (defaulting to `gemini-2.5-flash`)
- **Maps Data**: Google Maps Platform (Places API New, Routes API, Geocoding API)

## Setup & Deployment Guides
For detailed setup instructions, please refer to the markdown files in `docs/user-guides/`:
1. [Google Maps API Setup](docs/user-guides/01-google-maps-api-key.md)
2. [Gemini API Key Setup](docs/user-guides/02-gemini-api-key.md)
3. [GitHub Setup & Push](docs/user-guides/03-github-setup-and-push.md)
4. [Vercel Deployment](docs/user-guides/04-vercel-deployment.md)
5. [Hackathon Submission](docs/user-guides/05-hackathon-submission.md)

## Getting Started Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory based on `.env.local.example` and populate it with your keys:
   ```bash
   cp .env.local.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.
