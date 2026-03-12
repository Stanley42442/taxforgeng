

## Set Up Capacitor for Native App Publishing

### What we'll do
Install Capacitor dependencies and create the configuration file so you can build native iOS and Android apps from your existing web app.

### Changes

**1. Install dependencies** (via package.json):
- `@capacitor/core`
- `@capacitor/cli` (dev dependency)
- `@capacitor/ios`
- `@capacitor/android`

**2. Create `capacitor.config.ts`** in project root:
- App ID: `app.lovable.af4b139c57f44e7ab8682181153aa5d9`
- App name: `taxforgeng`
- Web dir: `dist`
- Server URL pointing to sandbox for hot-reload during development

### After I make the changes, you'll need to:

1. Export to GitHub via Settings → GitHub
2. Clone/pull the repo locally
3. Run `npm install`
4. Add platforms:
   - `npx cap add ios` (requires Mac + Xcode)
   - `npx cap add android` (requires Android Studio)
5. Run `npm run build`
6. Run `npx cap sync`
7. Run `npx cap run ios` or `npx cap run android`

For publishing to stores, you'll need an Apple Developer account ($99/year) and/or a Google Play Developer account ($25 one-time).

