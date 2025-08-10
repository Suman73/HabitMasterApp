chrome.action.onClicked.addListener(async () => {
  try {
    // Get the primary display to size ~90%
    const info = await chrome.system.display.getInfo();
    const primary = info.find(d => d.isPrimary) || info[0];
    const width = Math.floor(primary.workArea.width * 0.9);
    const height = Math.floor(primary.workArea.height * 0.9);
    const left = primary.workArea.left + Math.floor((primary.workArea.width - width) / 2);
    const top = primary.workArea.top + Math.floor((primary.workArea.height - height) / 2);

    await chrome.windows.create({
      url: chrome.runtime.getURL('window.html'),
      type: 'popup',
      width,
      height,
      left,
      top
    });
  } catch (e) {
    // Fallback to a tab if anything fails
    await chrome.tabs.create({ url: chrome.runtime.getURL('window.html') });
  }
});
