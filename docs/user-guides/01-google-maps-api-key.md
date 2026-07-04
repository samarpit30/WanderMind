# Google Maps API Setup Guide

This guide walks you through setting up the Google Maps Platform API key required for WanderMind.

## Steps

### 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with your Google account.
3. Click the project dropdown in the top navigation bar and select **New Project**.
4. Enter `WanderMind` as the project name and click **Create**.
5. Ensure the new project is selected from the top dropdown.

### 2. Enable Billing
Google Maps APIs require a billing account to be associated with the project, even though they offer a generous free tier of $200 monthly credits.
1. In the left sidebar, navigate to **Billing** and click **Link a billing account**.
2. Set up your billing details.

### 3. Enable Required APIs
WanderMind relies on three Google Maps Platform APIs. You must enable them for your project:
1. In the console, search for each of the following APIs and click **Enable**:
   - **Geocoding API**: Translates location queries (e.g. "Indore") into latitude and longitude coordinates.
   - **Places API (New)**: Retrieves restaurants, temples, museums, reviews, and photos.
   - **Routes API**: Calculates optimized directions, driving/walking times, and traffic conditions.

### 4. Create and Copy your API Key
1. Go to **APIs & Services > Credentials** in the left sidebar menu.
2. Click **+ Create Credentials** at the top and select **API key**.
3. A modal will display your new API key. Copy this key.

### 5. Configure environment variables
Paste the copied API key into your local `.env.local` file:
```env
GOOGLE_MAPS_API_KEY=your_copied_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_copied_api_key_here
```

## ✅ How to know it worked
Open a command terminal or browser and paste this URL, replacing `YOUR_API_KEY` with your actual key:
`https://maps.googleapis.com/maps/api/geocode/json?address=Indore&key=YOUR_API_KEY`

If it works, you should see a JSON response with details of Indore, rather than a billing/permissions error.
