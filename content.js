// LeanGPT Content Script - WORKING VERSION with Message Trimming
console.log('[LeanGPT] Content script loading for ChatGPT...');

// State
let isInitialized = false;
let observer = null;
let trimTimer = null;
const MAX_MESSAGES = 5; // Keep only 5 messages

// Add visual indicator
function showIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'leangpt-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #00d4ff;
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: bold;
    z-index: 999999;
    font-family: Arial, sans-serif;
  `;
  indicator.textContent = '🚀 LeanGPT ACTIVE';
  document.body.appendChild(indicator);
  return indicator;
}

// Count messages on page
function countMessages() {
  const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
  console.log(`[LeanGPT] Found ${messages.length} messages on page`);
  return messages.length;
}

// Trim old messages - KEEP ONLY 5
function trimMessages() {
  if (!isInitialized) return;
  
  const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
  const messageCount = messages.length;
  
  console.log(`[LeanGPT] Current messages: ${messageCount}, Max allowed: ${MAX_MESSAGES}`);
  
  if (messageCount <= MAX_MESSAGES) {
    console.log('[LeanGPT] No trimming needed - within limit');
    return;
  }
  
  // Remove oldest messages, keep last 5
  const toRemove = Array.from(messages).slice(0, messageCount - MAX_MESSAGES);
  let removedCount = 0;
  
  toRemove.forEach(message => {
    try {
      message.remove();
      removedCount++;
    } catch (error) {
      console.error('[LeanGPT] Error removing message:', error);
    }
  });
  
  console.log(`[LeanGPT] Trimmed ${removedCount} old messages, keeping last ${MAX_MESSAGES}`);
  
  // Update indicator with count
  const indicator = document.querySelector('#leangpt-indicator');
  if (indicator) {
    indicator.textContent = `🚀 LeanGPT (${messageCount - removedCount}/${MAX_MESSAGES})`;
  }
}

// Schedule trimming with debounce
function scheduleTrim() {
  if (trimTimer) {
    clearTimeout(trimTimer);
  }
  
  trimTimer = setTimeout(() => {
    trimMessages();
  }, 1000);
}

// Watch for new messages
function startObserver() {
  if (observer) return;
  
  observer = new MutationObserver((mutations) => {
    let hasNewMessages = false;
    
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if new message was added
          if (node.matches && node.matches('article[data-testid^="conversation-turn-"]')) {
            hasNewMessages = true;
          }
          // Check descendants for messages
          const messages = node.querySelectorAll && node.querySelectorAll('article[data-testid^="conversation-turn-"]');
          if (messages && messages.length > 0) {
            hasNewMessages = true;
          }
        }
      });
    });
    
    if (hasNewMessages) {
      console.log('[LeanGPT] New messages detected, scheduling trim...');
      scheduleTrim();
    }
  });
  
  // Observe chat container
  const chatContainer = document.querySelector('[class^="react-scroll-to-bottom--"]') || document.body;
  if (chatContainer) {
    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });
    console.log('[LeanGPT] Observer started');
  }
}

// Initialize LeanGPT
function initialize() {
  if (isInitialized) return;
  
  console.log('[LeanGPT] Initializing with 5 message limit...');
  showIndicator();
  startObserver();
  
  // Initial trim after delay
  setTimeout(() => {
    trimMessages();
    isInitialized = true;
    console.log('[LeanGPT] Initialization complete - keeping only 5 messages');
  }, 2000);
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LeanGPT] Received message:', request);
  
  if (request.action === 'getStatus') {
    const messageCount = countMessages();
    sendResponse({
      status: 'success',
      data: {
        isActive: isInitialized,
        messageCount: messageCount,
        maxMessages: MAX_MESSAGES,
        version: '0.1.0',
        hostname: window.location.hostname,
        url: window.location.href
      }
    });
    return true;
  }
  
  if (request.action === 'toggle') {
    isInitialized = !isInitialized;
    if (isInitialized) {
      console.log('[LeanGPT] Re-enabling optimizations');
      startObserver();
      trimMessages();
    } else {
      console.log('[LeanGPT] Disabling optimizations');
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
    
    sendResponse({ status: 'success', toggled: true });
    return true;
  }
  
  if (request.action === 'updateSettings') {
    if (request.settings.maxMessages) {
      console.log(`[LeanGPT] Updating max messages to: ${request.settings.maxMessages}`);
      // This would update the MAX_MESSAGES constant
      // For now, just re-trim with current count
      if (isInitialized) {
        trimMessages();
      }
    }
    
    sendResponse({ status: 'success' });
    return true;
  }
  
  return true;
});

// Start initialization
console.log('[LeanGPT] Content script fully loaded and ready');
initialize();