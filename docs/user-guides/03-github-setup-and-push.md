# GitHub Setup and Push Guide

This guide details how to create a public GitHub repository and push your scaffolded WanderMind codebase to it.

## Steps

### 1. Create a GitHub Repository
1. Log in to [GitHub](https://github.com/).
2. Click the **+** icon in the upper-right corner and select **New repository**.
3. Name your repository (e.g. `wandermind`).
4. **Important**: Set the visibility to **Public** so that judges and deployment platforms can access the source code.
5. Keep **Add a README**, **Add .gitignore**, and **Choose a license** UNCHECKED (we have already scaffolded these files locally).
6. Click **Create repository**.
7. Copy the repository URL (e.g. `https://github.com/your-username/wandermind.git`).

### 2. Push Code from your Terminal
Run the following commands in the root of your project:
```bash
# Initialize git in the root folder if not already done
git init

# Add all files to staging
git add .

# Create the initial commit
git commit -m "Phase 1: scaffold + deps + guides"

# Link to GitHub and push
git branch -M main
git remote add origin https://github.com/your-username/wandermind.git
git push -u origin main
```

## ✅ How to know it worked
Refresh your repository page on github.com. You should see all project folders and files visible on the main page. Copy the page URL — this will be needed for your final hackathon submission.
