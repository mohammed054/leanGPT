// LeanGPT Content Script - OPTIMIZATION LEVELS VERSION

console.log('[LeanGPT] Content script loading for ChatGPT with optimization levels...');

// State
let isInitialized = false;
let observer = null;
let trimTimer = null;
let MAX_MESSAGES = 5; // Keep only 5 messages (default)

// Optimization levels
const OPTIMIZATION_LEVELS = {
  light: {
    animations: false,
    scrollOptimization: false,
    syntaxHighlighting: true, // Keep for light mode
    messageTrimming: true,
    aggressiveMode: false
  },
  medium: {
    animations: true,
    scrollOptimization: true,
    syntaxHighlighting: false,
    messageTrimming: true,
    aggressiveMode: false
  },
  aggressive: {
    animations: false,
    scrollOptimization: true,
    syntaxHighlighting: false,
    messageTrimming: true,
    aggressiveMode: true
  },
  ultra: {
    animations: false,
    scrollOptimization: true,
    syntaxHighlighting: false,
    messageTrimming: true,
    aggressiveMode: true
  }
};

// Current optimization settings
let currentLevel = 'medium';

// Add visual indicator with level info
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
  indicator.textContent = '🚀 LeanGPT';
  document.body.appendChild(indicator);
  return indicator;
}

// Count messages on page
function countMessages() {
  const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
  console.log(`[LeanGPT] Found ${messages.length} messages on page`);
  return messages.length;
}

// Trim old messages based on optimization level
function trimMessages() {
  if (!isInitialized) return;
  
  const settings = OPTIMIZATION_LEVELS[currentLevel];
  if (!settings.messageTrimming) {
    console.log(`[LeanGPT] Message trimming disabled in ${currentLevel} mode`);
    return;
  }
  
  const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
  const messageCount = messages.length;
  
  console.log(`[LeanGPT] Current messages: ${messageCount}, Max allowed: ${MAX_MESSAGES}, Level: ${currentLevel}`);
  
  if (messageCount <= MAX_MESSAGES) {
    console.log('[LeanGPT] No trimming needed - within limit');
    return;
  }
  
  // Calculate how many to remove
  let toRemoveCount;
  if (settings.aggressiveMode) {
    // In aggressive mode, keep only 80% of MAX_MESSAGES (more aggressive trimming)
    const targetKeep = Math.ceil(MAX_MESSAGES * 0.8);
    toRemoveCount = Math.max(1, messageCount - targetKeep);
  } else {
    toRemoveCount = messageCount - MAX_MESSAGES;
  }
  
  const toRemove = Array.from(messages).slice(0, toRemoveCount);
  let removedCount = 0;
  
  toRemove.forEach((message, index) => {
    try {
      message.remove();
      removedCount++;
      console.log(`[LeanGPT] Removed message ${index + 1} (aggressive mode)`);
    } catch (error) {
      console.error('[LeanGPT] Error removing message:', error);
    }
  });
  
  console.log(`[LeanGPT] Trimmed ${removedCount} old messages, keeping last ${MAX_MESSAGES} (${currentLevel} mode)`);
  
  // Update indicator with count and level
  const indicator = document.querySelector('#leangpt-indicator');
  if (indicator) {
    const levelEmoji = currentLevel === 'ultra' ? '⚡' : '🚀';
    indicator.textContent = `${levelEmoji} LeanGPT (${MAX_MESSAGES}/${MAX_MESSAGES}) [${currentLevel.toUpperCase()}]`;
  }
}

// Apply optimizations based on level
function applyOptimizations() {
  const settings = OPTIMIZATION_LEVELS[currentLevel];
  console.log(`[LeanGPT] Applying ${currentLevel} level optimizations:`, settings);
  
  // Disable animations (if required)
  if (!settings.animations) {
    disableAnimations();
  }
  
  // Optimize scrolling (if required)
  if (settings.scrollOptimization) {
    optimizeScrolling();
  }
  
  // Remove syntax highlighting (if required)
  if (!settings.syntaxHighlighting) {
    removeSyntaxHighlighting();
  }
  
  // Aggressive mode additional optimizations
  if (settings.aggressiveMode) {
    applyAggressiveOptimizations();
  }
}

// Aggressive optimizations for very weak devices
function applyAggressiveOptimizations() {
  console.log('[LeanGPT] Applying aggressive optimizations...');
  
  // Reduce image quality
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.style.imageRendering = 'auto';
    img.style.imageRendering = '-webkit-optimize-contrast';
  });
  
  // Disable all transitions
  document.body.style.transition = 'none';
  document.body.style.animation = 'none';
  
  // Force GPU acceleration
  const canvasElements = document.querySelectorAll('canvas');
  canvasElements.forEach(canvas => {
    canvas.style.transform = 'translateZ(0)';
    canvas.style.willChange = 'transform';
  });
}

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
    chatContainer.style.overflowAnchor = 'none';
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

// Schedule trimming with debounce
function scheduleTrim() {
  if (trimTimer) {
    clearTimeout(trimTimer);
  }
  
  trimTimer = setTimeout(() => {
    trimMessages();
  }, 500); // Faster trimming in aggressive modes
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
            console.log(`[LeanGPT] New message detected: ${currentLevel} mode`);
          }
          // Check descendants for messages
          const messages = node.querySelectorAll && node.querySelectorAll('article[data-testid^="conversation-turn-"]');
          if (messages && messages.length > 0) {
            hasNewMessages = true;
            console.log(`[LeanGPT] Multiple messages detected: ${messages.length}`);
          }
        }
      });
    });
    
    if (hasNewMessages) {
      console.log(`[LeanGPT] Scheduling trim in ${currentLevel} mode...`);
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
    console.log(`[LeanGPT] Observer started in ${currentLevel} mode`);
  }
}

// Set optimization level
function setOptimizationLevel(level) {
  if (OPTIMIZATION_LEVELS[level]) {
    currentLevel = level;
    console.log(`[LeanGPT] Setting optimization level to: ${level}`);
    
    // Re-apply all optimizations
    applyOptimizations();
    
    // If message trimming is enabled, do an initial trim
    if (OPTIMIZATION_LEVELS[level].messageTrimming) {
      setTimeout(() => trimMessages(), 1000);
    }
  }
}

// Initialize LeanGPT
function initialize() {
  if (isInitialized) return;  
  console.log(`[LeanGPT] Initializing in ${currentLevel} mode...`);
  showIndicator();
  startObserver();
  
  // Apply optimizations
  applyOptimizations();
  
  // Initial trim after delay
  setTimeout(() => {
    trimMessages();
    isInitialized = true;
    console.log(`[LeanGPT] Initialization complete in ${currentLevel} mode`);
  }, 2000);
}

// Message listener with level support
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
        version: '1.0.0-OPTIMIZED',
        hostname: window.location.hostname,
        url: window.location.href,
        optimizationLevel: currentLevel,
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
      applyOptimizations();
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
    if (request.settings.maxMessages) {
      MAX_MESSAGES = request.settings.maxMessages;
      console.log(`[LeanGPT] Updated max messages to: ${MAX_MESSAGES}`);
      // Re-trim immediately if active and trimming enabled
      if (isInitialized && OPTIMIZATION_LEVELS[currentLevel].messageTrimming) {
        trimMessages();
      }
    }
    
    if (request.settings.optimizationLevel) {
      setOptimizationLevel(request.settings.optimizationLevel);
    }
    
    sendResponse({ status: 'success' });
  }
  
  if (request.action === 'setOptimizationLevel') {
    setOptimizationLevel(request.level);
    sendResponse({ status: 'success' });
  }
  
  return true;
});

// Calculate performance gain with better colors
function calculatePerformanceGain(messageCount) {
  if (messageCount <= MAX_MESSAGES) return 0;
  const removed = messageCount - MAX_MESSAGES;
  const gain = Math.round((removed / messageCount) * 100);
  return Math.min(gain, 99); // Cap at 99%
}

// Start initialization
console.log('[LeanGPT] Content script fully loaded with optimization levels');
initialize();