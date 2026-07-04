# Vercel Deployment Guide

This guide helps you deploy the WanderMind project to a live Vercel URL.

## Steps

### 1. Sign Up/Log In to Vercel
1. Go to [Vercel](https://vercel.com/).
2. Select **Sign Up** or **Log In** and choose **Continue with GitHub** to automatically link your repositories.

### 2. Import the Repository
1. In the Vercel dashboard, click **Add New...** and select **Project**.
2. Locate your `wandermind` repository from the imported GitHub list and click **Import**.

### 3. Configure Environment Variables
Before clicking Deploy, configure your API keys so they are available in production:
1. Expand the **Environment Variables** section on the project configure screen.
2. Add the following key-value pairs matching your local keys:
   - **Key**: `GOOGLE_MAPS_API_KEY` | **Value**: (your secret server key)
   - **Key**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | **Value**: (your public client key)
   - **Key**: `GEMINI_API_KEY` | **Value**: (your Gemini API key)
3. Click **Add** for each variable.

### 4. Deploy
1. Click the **Deploy** button.
2. Vercel will install dependencies, build the TypeScript/Next.js application, and host the build. This takes ~1-2 minutes.

## ✅ How to know it worked
Once the deployment finishes, Vercel will show a preview screen and provide a production URL (e.g. `https://wandermind-xyz.vercel.app`). Click the link to open the live application! Save this URL as it is required for your final hackathon submission.
