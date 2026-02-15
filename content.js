// LeanGPT Content Script - OPTIMIZATION LEVELS VERSION

// State
let isInitialized = false;
let observer = null;
let trimTimer = null;
let MAX_MESSAGES = 5; // Keep only 5 messages (default)

// Optimization levels
const OPTIMIZATION_LEVELS = {
  light: {
    animations: true, // Keep animations for light mode
    scrollOptimization: false, // Minimal optimization
    syntaxHighlighting: true, // Keep for light mode
    messageTrimming: true,
    aggressiveMode: false,
    maxMessages: 5 // Default for light
  },
  medium: {
    animations: true, // Keep animations
    scrollOptimization: true, // Enable scrolling optimization
    syntaxHighlighting: false, // Remove for better performance
    messageTrimming: true,
    aggressiveMode: false,
    maxMessages: 10 // More messages for medium
  },
  aggressive: {
    animations: false, // Disable animations
    scrollOptimization: true,
    syntaxHighlighting: false,
    messageTrimming: true,
    aggressiveMode: true,
    maxMessages: 15 // More aggressive trimming
  },
  ultra: {
    animations: false, // Disable all animations
    scrollOptimization: true,
    syntaxHighlighting: false,
    messageTrimming: true,
    aggressiveMode: true,
    maxMessages: 20 // Maximum messages for ultra
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
    background: linear-gradient(135deg, #00d4ff, #667eea);
    color: white;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 800;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    cursor: grab;
    user-select: none;
    touch-action: none;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
  `;
  
  // Create content structure
  const contentWrapper = document.createElement('div');
  contentWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 2;
  `;
  
  const icon = document.createElement('span');
  icon.textContent = '🚀';
  icon.style.cssText = `
    font-size: 14px;
    filter: drop-shadow(0 1px 0 rgba(0,0,0,0.2));
  `;
  
  const text = document.createElement('span');
  text.textContent = 'LeanGPT';
  text.style.cssText = `
    letter-spacing: 0.5px;
    text-shadow: 0 1px 0 rgba(0,0,0,0.2);
  `;
  
  contentWrapper.appendChild(icon);
  contentWrapper.appendChild(text);
  
  // Add drag handle visual indicator
  const dragHandle = document.createElement('div');
  dragHandle.style.cssText = `
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    border-radius: 16px;
    z-index: 1;
    border: 2px dashed rgba(255,255,255,0.3);
    opacity: 0;
    transition: opacity 0.2s ease;
  `;
  
  indicator.appendChild(contentWrapper);
  indicator.appendChild(dragHandle);
  document.body.appendChild(indicator);
  
  // Add drag functionality
  makeDraggable(indicator);
  
  // Add hover effects
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'translateY(-2px) scale(1.02)';
    indicator.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)';
    dragHandle.style.opacity = '0.3';
  });
  
  indicator.addEventListener('mouseleave', () => {
    if (!indicator.style.cursor || indicator.style.cursor !== 'grabbing') {
      indicator.style.transform = 'translateY(0) scale(1)';
      indicator.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
      dragHandle.style.opacity = '0';
    }
  });
  
  return indicator;
}

// Make element draggable
function makeDraggable(element) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  element.addEventListener('mousedown', dragStart);
  element.addEventListener('mouseup', dragEnd);
  element.addEventListener('mouseleave', dragEnd);
  element.addEventListener('mousemove', drag);
  
  // Touch support
  element.addEventListener('touchstart', dragStart, { passive: false });
  element.addEventListener('touchend', dragEnd);
  element.addEventListener('touchmove', drag, { passive: false });

  function dragStart(e) {
    isDragging = true;
    
    // Handle both mouse and touch events
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    initialX = clientX - xOffset;
    initialY = clientY - yOffset;

    // Get current position
    const rect = element.getBoundingClientRect();
    xOffset = rect.left;
    yOffset = rect.top;
    
    // Change cursor and add visual feedback
    element.style.cursor = 'grabbing';
    element.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
    element.style.transform = 'scale(1.02)';
  }

  function dragEnd(e) {
    isDragging = false;
    element.style.cursor = 'grab';
    element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    element.style.transform = 'scale(1)';
  }

  function drag(e) {
    if (isDragging === false) {
      return;
    }

    e.preventDefault();
    
    // Handle both mouse and touch events
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    currentX = clientX - initialX;
    currentY = clientY - initialY;

    xOffset = currentX;
    yOffset = currentY;

    // Apply boundaries to keep element on screen
    const rect = element.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    
    // Ensure element stays within viewport
    if (xOffset < 0) xOffset = 0;
    if (yOffset < 0) yOffset = 0;
    if (xOffset > maxX) xOffset = maxX;
    if (yOffset > maxY) yOffset = maxY;

    setTranslate(xOffset, yOffset, element);
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
  }
}

// Count messages on page
function countMessages() {
  try {
    const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
    return messages.length;
  } catch (error) {
    console.warn('[LeanGPT] Error counting messages:', error);
    return 0;
  }
}

// Trim old messages based on optimization level
function trimMessages() {
  if (!isInitialized) return;
  
  const settings = OPTIMIZATION_LEVELS[currentLevel];
  if (!settings.messageTrimming) {
    return;
  }
  
  try {
    const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
    const messageCount = messages.length;
    
    if (messageCount <= MAX_MESSAGES) {
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
    
    toRemove.forEach((message) => {
      try {
        message.remove();
        removedCount++;
      } catch (error) {
        console.warn('[LeanGPT] Error removing message:', error);
      }
    });
    
    // Update indicator with count and level
    const indicator = document.querySelector('#leangpt-indicator');
    if (indicator) {
      const levelEmoji = currentLevel === 'ultra' ? '⚡' : '🚀';
      indicator.textContent = `${levelEmoji} LeanGPT (${MAX_MESSAGES}/${MAX_MESSAGES}) [${currentLevel.toUpperCase()}]`;
    }
  } catch (error) {
    console.warn('[LeanGPT] Error in trimMessages:', error);
  }
}

// Apply optimizations based on level
function applyOptimizations() {
  const settings = OPTIMIZATION_LEVELS[currentLevel];
  
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
  try {
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
  } catch (error) {
    console.warn('[LeanGPT] Error in aggressive optimizations:', error);
  }
}

// Disable all animations
function disableAnimations() {
  try {
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
  } catch (error) {
    console.warn('[LeanGPT] Error disabling animations:', error);
  }
}

// Optimize scrolling
function optimizeScrolling() {
  try {
    const chatContainer = document.querySelector('[class^="react-scroll-to-bottom--"]');
    if (chatContainer) {
      chatContainer.style.scrollBehavior = 'auto';
      chatContainer.style.willChange = 'scroll-position';
      chatContainer.style.overflowAnchor = 'none';
    }
  } catch (error) {
    console.warn('[LeanGPT] Error optimizing scrolling:', error);
  }
}

// Remove syntax highlighting
function removeSyntaxHighlighting() {
  try {
    const codeBlocks = document.querySelectorAll('pre code, .hljs');
    codeBlocks.forEach((block) => {
      block.style.backgroundColor = 'transparent';
      block.style.color = 'inherit';
      block.classList.remove('hljs');
    });
  } catch (error) {
    console.warn('[LeanGPT] Error removing syntax highlighting:', error);
  }
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
    
    // Update MAX_MESSAGES based on the level
    MAX_MESSAGES = OPTIMIZATION_LEVELS[level].maxMessages || 5;
    
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