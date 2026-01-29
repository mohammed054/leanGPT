// LeanGPT Content Script - FINAL WORKING VERSION
console.log('[LeanGPT] Content script loading for ChatGPT...');

// State
let isInitialized = false;
let observer = null;
let trimTimer = null;
let MAX_MESSAGES = 5; // Keep only 5 messages

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
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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
  
  console.log(`[LeanGPT] Removed ${removedCount} old messages, keeping last ${MAX_MESSAGES}`);
  
  // Update indicator with count
  const indicator = document.querySelector('#leangpt-indicator');
  if (indicator) {
    indicator.textContent = `🚀 LeanGPT (${MAX_MESSAGES}/${MAX_MESSAGES})`;
  }
}

// Calculate performance percentage
function calculatePerformanceGain(messageCount) {
  if (messageCount <= MAX_MESSAGES) return 0;
  const removed = messageCount - MAX_MESSAGES;
  return Math.round((removed / messageCount) * 100);
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
    console.log('[LeanGPT] Initialization complete - trimming active');
  }, 2000);
}

// OPTIMIZATIONS

// Disable all animations
function disableAnimations() {
  console.log('[LeanGPT] Disabling animations...');
  const style = document.createElement('style');
  style.textContent = `
    * {
      animation-duration: 0.01ms !important;
      animation-delay: -0.01ms !important;
      transition-duration: 0.01ms !important;
      transition-delay: -0.01ms !important;
      transform: none !important;
    }
  `;
  document.head.appendChild(style);
}

// Optimize scrolling
function optimizeScrolling() {
  console.log('[LeanGPT] Optimizing scrolling...');
  const chatContainer = document.querySelector('[class^="react-scroll-to-bottom--"]');
  if (chatContainer) {
    chatContainer.style.scrollBehavior = 'auto';
    chatContainer.style.willChange = 'scroll-position';
  }
}

// Remove syntax highlighting
function removeSyntaxHighlighting() {
  console.log('[LeanGPT] Removing syntax highlighting...');
  const codeBlocks = document.querySelectorAll('pre code, .hljs');
  codeBlocks.forEach(block => {
    block.style.backgroundColor = 'transparent';
    block.style.color = 'inherit';
    block.classList.remove('hljs');
  });
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LeanGPT] Received message:', request);
  
  if (request.action === 'getStatus') {
    const messageCount = countMessages();
    const performanceGain = calculatePerformanceGain(messageCount);
    
    sendResponse({
      status: 'success',
      data: {
        isActive: isInitialized,
        messageCount: messageCount,
        maxMessages: MAX_MESSAGES,
        version: '1.0.0',
        hostname: window.location.hostname,
        url: window.location.href,
        performanceGain: performanceGain
      }
    });
  }
  
  if (request.action === 'toggle') {
    isInitialized = !isInitialized;
    if (isInitialized) {
      console.log('[LeanGPT] Re-enabling optimizations');
      startObserver();
      trimMessages();
      disableAnimations();
      optimizeScrolling();
      removeSyntaxHighlighting();
    } else {
      console.log('[LeanGPT] Disabling optimizations');
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
    
    sendResponse({ status: 'success', toggled: true });
  }
  
  if (request.action === 'updateSettings') {
    if (request.settings.maxMessages) {
      MAX_MESSAGES = request.settings.maxMessages;
      console.log(`[LeanGPT] Updated max messages to: ${MAX_MESSAGES}`);
      // Re-trim immediately if active
      if (isInitialized) {
        trimMessages();
      }
    }
    
    sendResponse({ status: 'success' });
  }
  
  return true;
});

// Start initialization with all optimizations
console.log('[LeanGPT] Content script fully loaded and ready');
disableAnimations();
optimizeScrolling();
removeSyntaxHighlighting();
initialize();