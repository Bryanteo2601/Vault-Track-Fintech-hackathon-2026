# Vercel Deployment Guide - Web Version for Hackathon

This guide explains how to deploy your Wealth Wellness Hub web app to Vercel for the hackathon. No app download required—just share a link!

## Quick Start (5 minutes)

### 1. Push Your Code to GitHub

```bash
cd /home/ubuntu/wealth-wellness-hub
git add -A
git commit -m "Set up Vercel deployment for hackathon"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI (Fastest)**

```bash
npm install -g vercel
vercel
# Follow the prompts to link your GitHub repo
# Select "Expo" as the framework
# Vercel will automatically detect the build settings
```

**Option B: Using Vercel Web Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Select your `wealth-wellness-hub` repository
5. Vercel will auto-detect the build settings
6. Click "Deploy"

### 3. Share Your Hackathon Link

Once deployed, you'll get a URL like: `https://wealth-wellness-hub.vercel.app`

Share this link with hackathon judges and participants!

## What Gets Deployed

The `pnpm build:web` command exports your Expo app as a static web application:

- **No backend required** - All data is stored locally in the browser
- **Works offline** - After first load, the app can work without internet
- **Mobile responsive** - Optimized for phones, tablets, and desktops
- **Fast** - Static files cached globally on Vercel's CDN

## Environment Variables (Optional)

If you need to set environment variables for the web version:

1. Go to your Vercel project settings
2. Click "Environment Variables"
3. Add variables like `EXPO_PUBLIC_API_URL`
4. Redeploy

## Troubleshooting

### Build Fails with "expo export" Error

**Solution**: Ensure all dependencies are installed:
```bash
pnpm install
pnpm build:web
```

### App Shows Blank Screen

**Solution**: Check browser console (F12) for errors. Common issues:
- AsyncStorage not available in browser (use localStorage instead)
- Firebase configuration missing
- Missing environment variables

### Slow Initial Load

**Solution**: This is normal for the first load. Vercel caches everything after that.

## Advanced: Custom Domain

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain (e.g., `wealth-wellness-hub.hackathon.com`)
4. Follow DNS setup instructions

## Redeploying After Changes

Every time you push to GitHub, Vercel automatically redeploys:

```bash
git add -A
git commit -m "Update features for hackathon"
git push origin main
# Vercel automatically rebuilds and deploys!
```

## Performance Tips

1. **Minimize bundle size**: Remove unused dependencies
2. **Lazy load screens**: Use React.lazy() for heavy components
3. **Optimize images**: Use WebP format where possible
4. **Cache data**: Store frequently accessed data in localStorage

## Monitoring

After deployment, monitor your app at:

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Real-time logs**: Click your project → "Deployments" → "View Logs"
- **Analytics**: Click your project → "Analytics" to see traffic and performance

## Rollback to Previous Version

If something breaks, rollback instantly:

1. Go to your Vercel project
2. Click "Deployments"
3. Find the previous working deployment
4. Click the three dots → "Promote to Production"

## Useful Commands

```bash
# Deploy immediately
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Remove a deployment
vercel rm [deployment-url]
```

## Sharing with Judges

### Share Link
```
https://wealth-wellness-hub.vercel.app
```

### Share GitHub Link
```
https://github.com/[your-username]/wealth-wellness-hub
```

### Share Demo Video
Record a quick demo showing:
1. Dashboard with financial overview
2. Profile editing with age synchronization
3. Banks/Investments/Loans/Insurance screens
4. Settings menu

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Expo Web Docs**: https://docs.expo.dev/guides/web/
- **GitHub Issues**: https://github.com/vercel/vercel/issues

## Next Steps After Hackathon

1. **Add authentication** - Let users save their data to the cloud
2. **Mobile app** - Use EAS to build iOS/Android apps
3. **Backend API** - Connect to a real database
4. **Analytics** - Track user behavior and engagement
5. **Monetization** - Add premium features or ads

Good luck with your hackathon! 🚀
