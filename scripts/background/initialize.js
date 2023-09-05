let changeInfoStatus = 'loading';
let tabStatus = 'loading';
const debounce = (func, wait = 1000) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Open small window function
const openSmallWindow = () => {
  const windowFeatures = 'width=400,height=400,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=yes';
  window.open('https://chat.openai.com', '_blank', windowFeatures);
};

// function that injects code to a specific tab
const injectScript = debounce((tabId) => {
  chrome.scripting.executeScript(
    {
      target: { tabId },
      files: ['scripts/content/initialize.js'],
    },
  );
});
chrome.runtime.onInstalled.addListener((detail) => {
  if (detail.reason === 'install') {
    chrome.tabs.create({ url: 'https://chat.openai.com', active: true });
  }
});
chrome.action.onClicked.addListener((tab) => {
  if (!tab.url) {
    chrome.tabs.update(tab.id, { url: 'https://chat.openai.com' });
  } else {
    chrome.tabs.create({ url: 'https://chat.openai.com', active: true });
  }
});

// adds a listener to tab change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    changeInfoStatus = changeInfo.status;
  }
  if (tab.status === 'complete') {
    tabStatus = tab.status;
  }
  if (changeInfoStatus === 'complete' && tabStatus === 'complete' && tab.title) {
    injectScript(tabId);
    changeInfoStatus = 'loading';
    tabStatus = 'loading';
    setTimeout(() => {
      injectScript(tabId);
      changeInfoStatus = 'loading';
      tabStatus = 'loading';
    }, 2000);
  }
});
