# HabitMaster Edge Extension

This is a Manifest V3 Edge extension that runs HabitMaster in the popup using `chrome.storage.local` for data, with no external network calls.

How to load in Microsoft Edge:

1. Open Edge and go to `edge://extensions`.
2. Enable "Developer mode" (toggle at the bottom-left).
3. Click "Load unpacked" and select this folder: `edge-extension`.
4. Pin the extension and click the icon to open the popup.

Notes:
- Data is stored per browser profile using `chrome.storage.local`.
- Export to CSV works from the popup.
- This variant does not include Firebase sign-in/sync.
