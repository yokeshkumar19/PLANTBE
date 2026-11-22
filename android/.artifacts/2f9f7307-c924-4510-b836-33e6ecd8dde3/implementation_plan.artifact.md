# Fix "google-services.json is missing" Build Error

The build is failing because the `google-services` plugin is being applied unconditionally in `app/build.gradle`, but the required `google-services.json` configuration file is missing from the project.

## User Review Required

> [!IMPORTANT]
> This fix will allow the project to build by making the Firebase plugin application conditional. However, **Firebase features (like Authentication and Push Notifications) will not work** until you add a valid `google-services.json` file to the `android/app/` directory.

## Proposed Changes

### Android App Module

#### [MODIFY] [build.gradle](file:///D:/Plant Doctor/android/app/build.gradle)
- Remove the redundant and unconditional `apply plugin: 'com.google.gms.google-services'` at the end of the file.
- The existing `try-catch` block already attempts to apply the plugin conditionally, which is the correct approach for Capacitor projects when the file might be missing.

## Verification Plan

### Automated Tests
- Run `./gradlew :app:help` to verify that the Gradle configuration is now valid and doesn't fail due to the missing file.

### Manual Verification
- The user should be able to build the project without the `Execution failed for task ':app:processDebugGoogleServices'` error.
