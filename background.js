// LeanGPT Background Service Worker
// Handles extension lifecycle and communication

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[LeanGPT Background] Extension installed:', details.reason);
  
  // Initialize default settings
  chrome.storage.sync.set({
    enabled: true,
    maxMessages: 5, // Match popup.js default
    debugMode: false,
    optimizationLevel: 'medium',
    version: '0.1.0'
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Only activate on ChatGPT domains
  if (tab.url && (tab.url.includes('chat.openai.com') || tab.url.includes('openai.com') || tab.url.includes('chatgpt.com'))) {
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' })
      .catch(error => {
        console.log('[LeanGPT Background] Error sending message:', error);
      });
  } else {
    // Open ChatGPT if not on the site
    chrome.tabs.create({ url: 'https://chat.openai.com' });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LeanGPT Background] Message received:', request);
  
  switch (request.action) {
    case 'getStatus':
      chrome.storage.sync.get(['enabled', 'maxMessages', 'debugMode', 'optimizationLevel'], (result) => {
        sendResponse({
          status: 'success',
          data: result
        });
      });
      return true; // Keep message channel open
      
    case 'updateSettings':
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ status: 'success' });
      });
      return true;
      
    case 'log':
      console.log('[LeanGPT Content]', request.message);
      sendResponse({ status: 'success' });
      break;
      
    default:
      console.log('[LeanGPT Background] Unknown action:', request.action);
      sendResponse({ status: 'error', message: 'Unknown action' });
  }
});

// Handle tab updates for ChatGPT
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process ChatGPT domains
  if (tab.url && (tab.url.includes('chat.openai.com') || tab.url.includes('openai.com') || tab.url.includes('chatgpt.com'))) {
    // When page is fully loaded, ensure content script is active
    if (changeInfo.status === 'complete') {
      console.log('[LeanGPT Background] ChatGPT page loaded, ensuring content script is active');
      
      // Send initialization message
      chrome.tabs.sendMessage(tabId, { action: 'init' })
        .catch(error => {
          // Content script might not be ready yet, this is normal
          console.log('[LeanGPT Background] Content script not ready:', error.message);
        });
    }
  }
});

// Extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('[LeanGPT Background] Extension started');
});

console.log('[LeanGPT Background] Service worker loaded');