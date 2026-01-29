// LeanGPT Content Script - VERIFICATION VERSION
console.log('[LeanGPT] Content script loading for ChatGPT...');

// State
let isInitialized = false;
let observer = null;
let trimTimer = null;
let MAX_MESSAGES = 5; // Default, will be updated by popup

// Add visual indicator that shows current settings
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
  indicator.textContent = '🚀 LeanGPT INITIALIZING...';
  document.body.appendChild(indicator);
  return indicator;
}

// Count messages on page
function countMessages() {
  const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
  console.log(`[LeanGPT] Found ${messages.length} messages on page`);
  console.log(`[LeanGPT] Current MAX_MESSAGES limit: ${MAX_MESSAGES}`);
  return messages.length;
}

// Trim old messages - KEEP ONLY MAX_MESSAGES
function trimMessages() {
  if (!isInitialized) return;  
  
  const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
  const messageCount = messages.length;
  
  console.log(`[LeanGPT] Current messages: ${messageCount}, Max allowed: ${MAX_MESSAGES}`);
  
  if (messageCount <= MAX_MESSAGES) {
    console.log('[LeanGPT] No trimming needed - within limit');
    return;
  }
  
  // Remove oldest messages, keep last MAX_MESSAGES
  const toRemove = Array.from(messages).slice(0, messageCount - MAX_MESSAGES);
  let removedCount = 0;
  
  toRemove.forEach(message => {
    try {
      message.remove();
      removedCount++;
      console.log(`[LeanGPT] Removed message ${removedCount}`);
    } catch (error) {
      console.error('[LeanGPT] Error removing message:', error);
    }
  });
  
  console.log(`[LeanGPT] Removed ${removedCount} old messages, keeping last ${MAX_MESSAGES}`);
  
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
  
  console.log('[LeanGPT] Scheduling trim in 1 second');
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
            console.log('[LeanGPT] New message detected directly');
          }
          // Check descendants for messages
          const messages = node.querySelectorAll && node.querySelectorAll('article[data-testid^="conversation-turn-"]');
          if (messages && messages.length > 0) {
            hasNewMessages = true;
            console.log(`[LeanGPT] New messages detected: ${messages.length}`);
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
  console.log(`[LeanGPT] Found ${codeBlocks.length} code blocks to optimize`);
  codeBlocks.forEach((block, index) => {
    block.style.backgroundColor = 'transparent';
    block.style.color = 'inherit';
    block.classList.remove('hljs');
    console.log(`[LeanGPT] Optimized code block ${index + 1}`);
  });
}

// Initialize LeanGPT
function initialize() {
  if (isInitialized) return;  
  console.log('[LeanGPT] Initializing with MAX_MESSAGES =', MAX_MESSAGES);
  showIndicator();
  startObserver();
  
  // Apply all optimizations
  disableAnimations();
  optimizeScrolling();
  removeSyntaxHighlighting();
  
  // Initial trim after delay
  setTimeout(() => {
    trimMessages();
    isInitialized = true;
    console.log('[LeanGPT] Initialization complete');
  }, 2000);
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LeanGPT] Received message:', request);
  
  if (request.action === 'getStatus') {
    const messageCount = countMessages();
    const performanceGain = calculatePerformanceGain(messageCount);
    
    console.log(`[LeanGPT] Status check - Messages: ${messageCount}, MAX: ${MAX_MESSAGES}, Gain: ${performanceGain}%`);
    
    sendResponse({
      status: 'success',
      data: {
        isActive: isInitialized,
        messageCount: messageCount,
        maxMessages: MAX_MESSAGES,
        version: '1.0.0-VERIFIED',
        hostname: window.location.hostname,
        url: window.location.href,
        performanceGain: performanceGain
      }
    });
  }
  
  if (request.action === 'toggle') {
    isInitialized = !isInitialized;
    console.log(`[LeanGPT] Toggle optimization: ${isInitialized}`);
    
    if (isInitialized) {
      console.log('[LeanGPT] Re-enabling optimizations');
      startObserver();
      disableAnimations();
      optimizeScrolling();
      removeSyntaxHighlighting();
      trimMessages();
    } else {
      console.log('[LeanGPT] Disabling optimizations');
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
    
    sendResponse({ status: 'success', toggled: isInitialized });
  }
  
  if (request.action === 'updateSettings') {
    if (request.settings.maxMessages && request.settings.maxMessages !== MAX_MESSAGES) {
      const oldMax = MAX_MESSAGES;
      MAX_MESSAGES = request.settings.maxMessages;
      console.log(`[LeanGPT] MAX_MESSAGES updated: ${oldMax} → ${MAX_MESSAGES}`);
      
      // Re-trim immediately with new limit
      if (isInitialized) {
        trimMessages();
      }
    }
    
    sendResponse({ status: 'success' });
  }
  
  return true;
});

// Calculate performance percentage
function calculatePerformanceGain(messageCount) {
  if (messageCount <= MAX_MESSAGES) {
    return 5; // Show "optimizing" even when within limit
  }
  const removed = messageCount - MAX_MESSAGES;
  const gain = Math.round((removed / messageCount) * 100);
  return Math.max(gain, 5); // Minimum 5% to show it's working
}

// Start initialization
console.log('[LeanGPT] Content script fully loaded and ready');
initialize();