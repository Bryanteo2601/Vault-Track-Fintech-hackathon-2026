# EAS Deployment Guide for Wealth Wellness Hub

This guide explains how to build and deploy your Wealth Wellness Hub mobile app using Expo Application Services (EAS).

## Prerequisites

1. **Expo Account**: Create a free account at [expo.dev](https://expo.dev)
2. **EAS CLI**: Already installed globally (`npm install -g eas-cli`)
3. **Apple Developer Account** (for iOS): Required for App Store submission (~$99/year)
4. **Google Play Developer Account** (for Android): Required for Play Store submission (~$25 one-time)

## Quick Start

### 1. Link Your Project to Expo

```bash
cd /home/ubuntu/wealth-wellness-hub
eas login
# Follow the prompts to sign in with your Expo account
```

### 2. Initialize EAS Project

```bash
eas project:create
# This creates a project on Expo's servers linked to your local project
```

### 3. Build for Development (Internal Testing)

```bash
# Build for iOS (development)
eas build --platform ios --profile development

# Build for Android (development)
eas build --platform android --profile development
```

After the build completes, you'll get a download link. You can:
- **iOS**: Install on a physical device via email link or QR code
- **Android**: Install APK directly on physical devices

### 4. Build for Preview (Internal Testing with Store Distribution)

```bash
# Build for iOS
eas build --platform ios --profile preview

# Build for Android
eas build --platform android --profile preview
```

### 5. Build for Production (App Store/Play Store)

```bash
# Build for iOS (production)
eas build --platform ios --profile production

# Build for Android (production)
eas build --platform android --profile production
```

## Build Profiles Explained

### Development
- **Use Case**: Testing on physical devices with development client
- **Distribution**: Internal (email/QR code)
- **iOS Resource**: m1-medium (faster builds)
- **Android Resource**: medium

### Preview
- **Use Case**: Testing the final app before submission
- **Distribution**: Internal
- **Suitable for**: Beta testing with team members

### Production
- **Use Case**: Final app for App Store and Play Store
- **Distribution**: Store (for submission)
- **iOS Resource**: m1-medium (optimized for App Store)
- **Android Resource**: large (for better optimization)

## Submitting to App Stores

### iOS App Store Submission

1. **Create App ID in Apple Developer Console**:
   - Go to [developer.apple.com](https://developer.apple.com)
   - Create a new App ID for "space.manus.wealth.wellness.hub"
   - Enable necessary capabilities (Push Notifications, etc.)

2. **Create App in App Store Connect**:
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Create a new app with your App ID
   - Fill in app details, screenshots, description

3. **Configure eas.json**:
   ```json
   "submit": {
     "production": {
       "ios": {
         "appleId": "your-apple-id@example.com",
         "appleTeamId": "YOUR_TEAM_ID",
         "ascAppId": "YOUR_APP_ID"
       }
     }
   }
   ```

4. **Submit via EAS**:
   ```bash
   eas submit --platform ios --latest
   ```

### Android Play Store Submission

1. **Create Google Play Developer Account**:
   - Go to [play.google.com/console](https://play.google.com/console)
   - Create a new app
   - Set up app details, screenshots, description

2. **Create Service Account**:
   - Go to Google Cloud Console
   - Create a service account with Play Store access
   - Download the JSON key file

3. **Configure eas.json**:
   ```json
   "submit": {
     "production": {
       "android": {
         "serviceAccount": "path/to/service-account.json",
         "track": "internal"
       }
     }
   }
   ```

4. **Submit via EAS**:
   ```bash
   eas submit --platform android --latest
   ```

## Build Status and Logs

### Check Build Status
```bash
eas build:list
```

### View Build Logs
```bash
eas build:view <BUILD_ID>
```

### Monitor Build in Real-time
```bash
eas build --platform ios --profile production --wait
```

## Environment Variables

If you need to pass environment variables during build:

1. **Add to eas.json**:
   ```json
   "build": {
     "production": {
       "env": {
         "EXPO_PUBLIC_API_URL": "https://api.example.com"
       }
     }
   }
   ```

2. **Or use CLI**:
   ```bash
   eas build --platform ios --profile production --env EXPO_PUBLIC_API_URL=https://api.example.com
   ```

## Troubleshooting

### Build Fails with "Provisioning Profile" Error (iOS)
- Ensure your Apple Team ID is correct in eas.json
- Verify the App ID matches your bundle identifier: `space.manus.wealth.wellness.hub`

### Build Fails with "Service Account" Error (Android)
- Verify the service account JSON file path is correct
- Ensure the service account has Play Store access permissions

### Build Takes Too Long
- Development builds are faster than production builds
- Production builds include optimization and signing
- Typical build times: 10-20 minutes

### App Crashes After Installation
- Check the build logs for errors
- Verify all environment variables are set correctly
- Test with development profile first

## Useful Commands

```bash
# List all builds
eas build:list

# View specific build details
eas build:view <BUILD_ID>

# Cancel a build
eas build:cancel <BUILD_ID>

# Update EAS CLI
npm install -g eas-cli@latest

# Check EAS project status
eas project:info

# View app configuration
eas config
```

## Next Steps

1. **Create Expo Account** and link your project
2. **Test Development Build** on your device
3. **Set up App Store accounts** (Apple and Google)
4. **Build Production APK/IPA** for submission
5. **Submit to App Stores** using EAS submit

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo CLI Reference](https://docs.expo.dev/more/expo-cli/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

## Support

For issues with EAS builds:
- Check [Expo Forums](https://forums.expo.dev)
- Review [GitHub Issues](https://github.com/expo/eas-cli/issues)
- Contact Expo Support at support@expo.dev
