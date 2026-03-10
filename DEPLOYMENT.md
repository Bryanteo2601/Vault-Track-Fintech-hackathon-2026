# Wealth Wellness Hub - Deployment Guide

This guide covers deploying the Wealth Wellness Hub mobile app to Google Cloud Run via Firebase.

## Prerequisites

- Google Cloud Account with billing enabled
- `gcloud` CLI installed and authenticated
- Docker installed locally
- Firebase CLI installed (`npm install -g firebase-tools`)
- Project ID from Google Cloud Console

## Architecture Overview

The deployment consists of:

1. **Docker Container** - Containerized Node.js/Expo app with backend API
2. **Cloud Run** - Serverless container execution platform
3. **Firebase Hosting** - Static asset serving and routing to Cloud Run
4. **Cloud SQL** (optional) - PostgreSQL database
5. **Cloud Storage** - File uploads and media storage

## Step 1: Set Up Google Cloud Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
export REGION="us-central1"  # or your preferred region

# Create a new project (if needed)
gcloud projects create $PROJECT_ID

# Set the active project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  firebase.googleapis.com \
  firestore.googleapis.com \
  storage-api.googleapis.com
```

## Step 2: Configure Environment Variables

Create a `.env.production` file with your production environment variables:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# API Configuration
NODE_ENV=production
EXPO_PORT=8081
API_PORT=3000

# Database (if using Cloud SQL)
DB_HOST=your_cloud_sql_ip
DB_PORT=5432
DB_USER=wealth_user
DB_PASSWORD=your_secure_password
DB_NAME=wealth_wellness

# AI/ML Configuration
GEMINI_API_KEY=your_gemini_key
```

## Step 3: Build and Push Docker Image

### Option A: Using Cloud Build (Recommended)

```bash
# Build and push to Artifact Registry
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/wealth-wellness-hub:latest \
  --tag gcr.io/$PROJECT_ID/wealth-wellness-hub:$(date +%Y%m%d-%H%M%S)

# Verify the image was pushed
gcloud artifacts docker images list gcr.io/$PROJECT_ID
```

### Option B: Build Locally and Push

```bash
# Build the Docker image locally
docker build -t gcr.io/$PROJECT_ID/wealth-wellness-hub:latest .

# Authenticate Docker with Google Cloud
gcloud auth configure-docker gcr.io

# Push the image
docker push gcr.io/$PROJECT_ID/wealth-wellness-hub:latest
```

## Step 4: Deploy to Cloud Run

```bash
# Deploy the container to Cloud Run
gcloud run deploy wealth-wellness-hub \
  --image gcr.io/$PROJECT_ID/wealth-wellness-hub:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --max-instances 100 \
  --set-env-vars FIREBASE_API_KEY=$FIREBASE_API_KEY,FIREBASE_PROJECT_ID=$PROJECT_ID,NODE_ENV=production

# Get the service URL
gcloud run services describe wealth-wellness-hub \
  --platform managed \
  --region $REGION \
  --format='value(status.url)'
```

## Step 5: Configure Firebase Hosting

### Initialize Firebase in your project:

```bash
# Initialize Firebase (if not already done)
firebase init hosting --project $PROJECT_ID

# Configure firebase.json to route to Cloud Run
```

Edit your `firebase.json`:

```json
{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "wealth-wellness-hub",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Deploy to Firebase Hosting:

```bash
# Build the static assets
pnpm run build

# Deploy to Firebase Hosting
firebase deploy --project $PROJECT_ID
```

## Step 6: Set Up Cloud SQL (Optional)

If you need a PostgreSQL database:

```bash
# Create a Cloud SQL instance
gcloud sql instances create wealth-wellness-db \
  --database-version POSTGRES_15 \
  --tier db-f1-micro \
  --region $REGION

# Create a database
gcloud sql databases create wealth_wellness \
  --instance wealth-wellness-db

# Create a user
gcloud sql users create wealth_user \
  --instance wealth-wellness-db \
  --password

# Get the Cloud SQL IP
gcloud sql instances describe wealth-wellness-db \
  --format='value(ipAddresses[0].ipAddress)'
```

Update your Cloud Run environment variables with the Cloud SQL connection details.

## Step 7: Configure Cloud Storage (Optional)

For file uploads and media storage:

```bash
# Create a Cloud Storage bucket
gsutil mb -p $PROJECT_ID gs://$PROJECT_ID-wealth-wellness

# Set CORS policy for uploads
gsutil cors set cors.json gs://$PROJECT_ID-wealth-wellness
```

Create `cors.json`:

```json
[
  {
    "origin": ["https://wealth-wellness-hub-*.run.app"],
    "method": ["GET", "HEAD", "DELETE", "POST", "PUT"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

## Step 8: Monitor and Logs

```bash
# View Cloud Run logs
gcloud run logs read wealth-wellness-hub --region $REGION --limit 50

# Stream logs in real-time
gcloud run logs read wealth-wellness-hub --region $REGION --limit 50 --follow

# View metrics in Cloud Console
# https://console.cloud.google.com/run/detail/$REGION/wealth-wellness-hub
```

## Step 9: Set Up CI/CD Pipeline

Create `.github/workflows/deploy.yml` for automated deployments:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: us-central1
  SERVICE_NAME: wealth-wellness-hub

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          export_default_credentials: true
      
      - name: Build and push Docker image
        run: |
          gcloud builds submit \
            --tag gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
            --tag gcr.io/$PROJECT_ID/$SERVICE_NAME:${{ github.sha }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy $SERVICE_NAME \
            --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated
      
      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ secrets.GCP_PROJECT_ID }}
```

## Troubleshooting

### Container fails to start

```bash
# Check logs
gcloud run logs read wealth-wellness-hub --region $REGION --limit 100

# Test locally with docker-compose
docker-compose up
```

### Firebase Hosting not routing to Cloud Run

- Verify the service ID in `firebase.json` matches your Cloud Run service name
- Check that the Cloud Run service allows unauthenticated access
- Ensure Firebase Hosting is linked to your Cloud Run service

### Database connection issues

- Verify Cloud SQL instance is running
- Check firewall rules allow Cloud Run to access Cloud SQL
- Use Cloud SQL Proxy for secure connections

### Performance issues

- Increase Cloud Run memory/CPU allocation
- Enable Cloud CDN for static assets
- Use Cloud Memorystore (Redis) for caching

## Cost Optimization

1. **Use Cloud Run's free tier** - 2 million requests/month free
2. **Set max instances** - Prevents unexpected scaling costs
3. **Use Cloud Storage lifecycle policies** - Auto-delete old files
4. **Enable Cloud CDN** - Cache static assets
5. **Monitor billing** - Set up budget alerts in Cloud Console

## Security Best Practices

1. **Use Secret Manager** for sensitive data
2. **Enable Cloud Armor** for DDoS protection
3. **Use service accounts** with minimal permissions
4. **Enable VPC Service Controls** for data exfiltration prevention
5. **Regular security audits** and dependency updates

## Rollback Procedure

```bash
# List previous revisions
gcloud run revisions list --service wealth-wellness-hub --region $REGION

# Rollback to a previous revision
gcloud run deploy wealth-wellness-hub \
  --image gcr.io/$PROJECT_ID/wealth-wellness-hub:previous-tag \
  --region $REGION
```

## Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Support

For issues or questions:

1. Check Cloud Run logs: `gcloud run logs read`
2. Review Firebase Console: https://console.firebase.google.com
3. Check Google Cloud Console: https://console.cloud.google.com
4. Contact Google Cloud Support for infrastructure issues
