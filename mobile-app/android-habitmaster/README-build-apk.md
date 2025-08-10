How to build HabitMaster APK (Android)

Prerequisites:
- Install Android Studio (includes Java JDK and Gradle)
- Android SDK Platform 34 installed

Steps:
1) Open Android Studio.
2) File -> Open -> select this folder: mobile-app/android-habitmaster
3) Let Gradle sync.
4) Put your web files in app/src/main/assets/www (already copied).
5) Build -> Build Bundle(s)/APK(s) -> Build APK(s).
6) Find the debug APK at app/build/outputs/apk/debug/app-debug.apk

Firebase Notes:
- The app loads local files via file:///android_asset/www/index.html
- Your web code uses Firebase over https:// gstatic ESM modules and Firestore; INTERNET permission is declared.
- Google sign-in via popup works inside WebView on most devices, but if it fails you may need to:
  - Add a redirect/callback-based auth flow, or
  - Switch to Capacitor/Cordova Google Sign-In plugin.

If Google sign-in fails in WebView:
- Enable Anonymous auth in Firebase to test quickly.
- Or replace popup with redirect by using signInWithRedirect and handle redirect result on load.
