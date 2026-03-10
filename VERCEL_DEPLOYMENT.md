# Vercel Deployment Guide for Wealth Wellness Hub

This guide explains how to deploy your Wealth Wellness Hub app to Vercel instead of running it locally with `pnpm install` and `pnpm dev:metro`.

## Current Local Setup (What You're Replacing)

Currently, you run the app locally using:
```bash
pnpm install      # Install dependencies
pnpm dev:metro    # Start Metro bundler on localhost
pnpm dev:server   # Start backend API server
```

With Vercel, you'll have a hosted URL that's always accessible online without needing to run these commands locally.

---

## Step-by-Step Vercel Deployment Guide

### Step 1: Create a Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account
5. Complete the onboarding

### Step 2: Connect Your GitHub Repository

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Search for **"Vault-Track-Fintech-hackathon-2026"** (your repo)
4. Click **"Import"**

### Step 3: Configure Project Settings

#### 3.1 Framework Selection
- **Framework Preset**: Select **"Other"** (since this is a custom Expo/React Native setup)
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

#### 3.2 Environment Variables
Click **"Environment Variables"** and add:

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
GEMINI_API_KEY=your_gemini_key
NODE_ENV=production
EXPO_PORT=8081
```

**Important**: Make sure to set these for:
- ✅ Production
- ✅ Preview
- ✅ Development

#### 3.3 Root Directory (if needed)
- Leave as **"./"** (root of your repo)

### Step 4: Create vercel.json Configuration File

Create a `vercel.json` file in your project root:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "expo",
  "outputDirectory": "dist",
  "env": [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
    "FIREBASE_MESSAGING_SENDER_ID",
    "FIREBASE_APP_ID",
    "FIREBASE_MEASUREMENT_ID",
    "GEMINI_API_KEY",
    "NODE_ENV",
    "EXPO_PORT"
  ],
  "functions": {
    "api/**/*.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  },
  "regions": ["sfo1"]
}
```

### Step 5: Update package.json Build Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "build": "esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "dev": "concurrently -k \"pnpm dev:server\" \"pnpm dev:metro\"",
    "dev:server": "cross-env NODE_ENV=development tsx watch server/_core/index.ts",
    "dev:metro": "cross-env EXPO_USE_METRO_WORKSPACE_ROOT=1 npx expo start --web --port ${EXPO_PORT:-8081}",
    "start": "NODE_ENV=production node dist/index.js",
    "test": "vitest run"
  }
}
```

### Step 6: Deploy to Vercel

1. Click **"Deploy"** button in Vercel dashboard
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://wealth-wellness-hub.vercel.app`

### Step 7: Monitor Deployment

- **Deployments Tab**: View all previous deployments
- **Logs**: Click on a deployment to see build logs
- **Analytics**: Monitor performance and usage
- **Settings**: Adjust configuration anytime

---

## Comparison: Local vs Vercel

| Aspect | Local (`pnpm dev`) | Vercel |
|--------|-------------------|--------|
| **Setup** | Run `pnpm install` + `pnpm dev:metro` | Push to GitHub, Vercel auto-deploys |
| **URL** | `http://localhost:8081` | `https://wealth-wellness-hub.vercel.app` |
| **Always Running** | Only when your computer is on | 24/7 online |
| **Sharing** | Only on your local network | Shareable public URL |
| **Updates** | Manual restart needed | Auto-redeploy on git push |
| **Performance** | Depends on your machine | Vercel's global CDN |
| **Cost** | Free (your electricity) | Free tier available |

---

## Common Issues & Troubleshooting

### Issue 1: Build Fails with "pnpm not found"
**Solution**: Vercel needs to know to use pnpm. Add to `vercel.json`:
```json
{
  "installCommand": "npm install -g pnpm && pnpm install"
}
```

### Issue 2: Environment Variables Not Working
**Solution**: 
1. Go to **Project Settings** → **Environment Variables**
2. Verify all variables are set for **Production**
3. Redeploy after adding/changing variables
4. Click **"Redeploy"** button

### Issue 3: Build Takes Too Long
**Solution**: 
1. Optimize dependencies: `pnpm prune`
2. Increase build timeout in `vercel.json`:
```json
{
  "buildCommand": "pnpm build",
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 120
    }
  }
}
```

### Issue 4: API Routes Not Working
**Solution**: Ensure API files are in `api/` directory:
```
api/
  ├── health.ts
  ├── auth/
  │   └── login.ts
  └── users/
      └── profile.ts
```

---

## Continuous Deployment (Auto-Deploy)

Once connected to GitHub, Vercel automatically:
1. ✅ Detects pushes to `main` branch
2. ✅ Runs `pnpm install`
3. ✅ Runs `pnpm build`
4. ✅ Deploys to production URL
5. ✅ Sends you a deployment notification

**To enable/disable auto-deploy**:
1. Go to **Project Settings** → **Git**
2. Toggle **"Automatic Deployments"**

---

## Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `wealth-wellness-hub.com`)
4. Follow DNS configuration instructions
5. Point your domain nameservers to Vercel

---

## Rollback to Previous Deployment

If something breaks:
1. Go to **Deployments** tab
2. Find the previous working deployment
3. Click **"Promote to Production"**
4. Your app reverts instantly

---

## Next Steps

1. **Push your code to GitHub** (if not already done)
2. **Create Vercel account** and connect your repo
3. **Set environment variables** in Vercel dashboard
4. **Deploy** and get your public URL
5. **Test** the app at your Vercel URL
6. **Share** the URL with collaborators

Your app will now be hosted on Vercel and accessible 24/7 without needing to run local commands!
