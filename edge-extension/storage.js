// Simple storage wrapper around chrome.storage.local with a memory fallback
export const storage = {
  async get(key, defaultValue) {
    try {
      const data = await chrome.storage.local.get([key]);
      if (data && Object.prototype.hasOwnProperty.call(data, key)) return data[key];
      return defaultValue;
    } catch (_) {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    }
  },
  async set(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (_) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
};
