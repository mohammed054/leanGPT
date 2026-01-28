// LeanGPT - ChatGPT Performance Optimizer
// Optimizes ChatGPT performance on low-end laptops by safely managing DOM elements

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    MAX_MESSAGES: 10,           // Keep only last 10 messages
    TRIM_DELAY: 1000,           // Delay before trimming (ms)
    OBSERVER_DEBOUNCE: 500,     // MutationObserver debounce (ms)
    SCROLL_THROTTLE: 100,       // Scroll event throttle (ms)
    DEBUG: false                // Enable debug logging
  };

  // CSS Selectors for ChatGPT elements
  const SELECTORS = {
    userMessages: 'article[data-testid^="conversation-turn-"][data-turn="user"]',
    assistantMessages: 'article[data-testid^="conversation-turn-"][data-turn="assistant"]',
    allMessages: 'article[data-testid^="conversation-turn-"]',
    chatContainer: '[class^="react-scroll-to-bottom--"]',
    inputArea: '#prompt-textarea',
    codeBlocks: 'pre code, .hljs',
    animations: '*[style*="transition"], *[style*="animation"]'
  };

  // State management
  let state = {
    isActive: false,
    messageCount: 0,
    observer: null,
    scrollHandler: null,
    trimTimer: null,
    removedMessages: new WeakMap(),
    lastScrollTime: 0
  };

  // Utility functions
  const Utils = {
    log: function(message, level = 'info') {
      if (CONFIG.DEBUG) {
        console.log(`[LeanGPT ${level.toUpperCase()}]`, message);
      }
      
      // Send log to background script
      try {
        chrome.runtime.sendMessage({
          action: 'log',
          message: `[${level.toUpperCase()}] ${message}`
        });
      } catch (error) {
        // Background script might not be available, that's okay
      }
    },

    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    isChatGPTPage: function() {
      return window.location.hostname === 'chat.openai.com';
    },

    isSafeMessage: function(element) {
      return element && 
             element.matches('article[data-testid^="conversation-turn-"]') &&
             element.closest('[class^="react-scroll-to-bottom--"]') !== null;
    },

    getMessageRole: function(element) {
      return element.getAttribute('data-turn') || 'unknown';
    },

    getMessageId: function(element) {
      return element.getAttribute('data-testid') || '';
    }
  };

  // Core optimization functions
  const MessageOptimizer = {
    countMessages: function() {
      const messages = document.querySelectorAll(SELECTORS.allMessages);
      state.messageCount = messages.length;
      Utils.log(`Current message count: ${state.messageCount}`);
      return state.messageCount;
    },

    getMessagesToRemove: function() {
      const messages = document.querySelectorAll(SELECTORS.allMessages);
      const messagesToRemove = [];

      if (messages.length <= CONFIG.MAX_MESSAGES) {
        return messagesToRemove;
      }

      // Remove oldest messages, keep the last MAX_MESSAGES
      const startIndex = messages.length - CONFIG.MAX_MESSAGES;
      for (let i = 0; i < startIndex; i++) {
        if (Utils.isSafeMessage(messages[i])) {
          messagesToRemove.push(messages[i]);
        }
      }

      return messagesToRemove;
    },

    removeMessage: function(element) {
      if (!Utils.isSafeMessage(element)) {
        Utils.log('Skipping unsafe message removal', 'warn');
        return false;
      }

      try {
        // Store message info before removal (for potential restoration)
        const messageInfo = {
          role: Utils.getMessageRole(element),
          id: Utils.getMessageId(element),
          html: element.outerHTML,
          timestamp: Date.now()
        };

        state.removedMessages.set(element, messageInfo);

        // Remove from DOM
        element.remove();
        
        Utils.log(`Removed message: ${messageInfo.role} - ${messageInfo.id}`);
        return true;
      } catch (error) {
        Utils.log(`Error removing message: ${error.message}`, 'error');
        return false;
      }
    },

    trimMessages: function() {
      Utils.log('Starting message trimming...');
      
      const messagesToRemove = MessageOptimizer.getMessagesToRemove();
      let removedCount = 0;

      messagesToRemove.forEach(message => {
        if (MessageOptimizer.removeMessage(message)) {
          removedCount++;
        }
      });

      Utils.log(`Trimmed ${removedCount} messages. New count: ${MessageOptimizer.countMessages()}`);
      return removedCount;
    },

    scheduleTrim: function() {
      if (state.trimTimer) {
        clearTimeout(state.trimTimer);
      }

      state.trimTimer = setTimeout(() => {
        MessageOptimizer.trimMessages();
      }, CONFIG.TRIM_DELAY);
    }
  };

  // Performance optimization functions
  const PerformanceOptimizer = {
    disableAnimations: function() {
      Utils.log('Disabling animations...');
      
      // Add CSS class to disable animations
      document.documentElement.classList.add('leangpt-no-animations');
      
      // Disable existing inline animations
      const animatedElements = document.querySelectorAll(SELECTORS.animations);
      animatedElements.forEach(element => {
        element.style.transition = 'none';
        element.style.animation = 'none';
      });

      Utils.log('Animations disabled');
    },

    optimizeScrolling: function() {
      Utils.log('Optimizing scroll performance...');

      // Throttle scroll events
      state.scrollHandler = Utils.throttle(() => {
        // Handle scroll optimization here if needed
        state.lastScrollTime = Date.now();
      }, CONFIG.SCROLL_THROTTLE);

      // Add scroll listener
      const chatContainer = document.querySelector(SELECTORS.chatContainer);
      if (chatContainer) {
        chatContainer.addEventListener('scroll', state.scrollHandler, { passive: true });
        Utils.log('Scroll optimization applied');
      }
    },

    removeSyntaxHighlighting: function() {
      Utils.log('Removing syntax highlighting...');
      
      const codeBlocks = document.querySelectorAll(SELECTORS.codeBlocks);
      codeBlocks.forEach(block => {
        // Remove syntax highlighting classes
        block.classList.remove('hljs', 'language-*');
        
        // Remove syntax highlighting styles
        block.style.backgroundColor = 'transparent';
        block.style.color = 'inherit';
      });

      Utils.log(`Removed syntax highlighting from ${codeBlocks.length} code blocks`);
    }
  };

  // DOM monitoring
  const DOMMonitor = {
    start: function() {
      Utils.log('Starting DOM monitoring...');

      state.observer = new MutationObserver(Utils.debounce((mutations) => {
        let hasNewMessages = false;

        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if new message was added
                if (node.matches && node.matches(SELECTORS.allMessages)) {
                  hasNewMessages = true;
                }
                // Check if message was added to container
                const messages = node.querySelectorAll && node.querySelectorAll(SELECTORS.allMessages);
                if (messages && messages.length > 0) {
                  hasNewMessages = true;
                }
              }
            });
          }
        });

        if (hasNewMessages) {
          Utils.log('New messages detected, scheduling trim...');
          MessageOptimizer.scheduleTrim();
        }
      }, CONFIG.OBSERVER_DEBOUNCE));

      // Start observing the chat container
      const chatContainer = document.querySelector(SELECTORS.chatContainer);
      if (chatContainer) {
        state.observer.observe(chatContainer, {
          childList: true,
          subtree: true,
          attributes: false,
          characterData: false
        });
        Utils.log('DOM monitoring started');
      } else {
        Utils.log('Chat container not found, retrying...', 'warn');
        setTimeout(DOMMonitor.start, 1000);
      }
    },

    stop: function() {
      if (state.observer) {
        state.observer.disconnect();
        state.observer = null;
        Utils.log('DOM monitoring stopped');
      }
    }
  };

  // Main initialization
  const LeanGPT = {
    init: function() {
      Utils.log('Initializing LeanGPT...');

      if (!Utils.isChatGPTPage()) {
        Utils.log('Not on ChatGPT page, skipping initialization');
        return;
      }

      // Wait for ChatGPT interface to be ready
      LeanGPT.waitForChatGPT().then(() => {
        Utils.log('ChatGPT interface ready, applying optimizations...');

        // Apply performance optimizations
        PerformanceOptimizer.disableAnimations();
        PerformanceOptimizer.optimizeScrolling();
        PerformanceOptimizer.removeSyntaxHighlighting();

        // Start DOM monitoring
        DOMMonitor.start();

        // Initial message trimming
        setTimeout(() => {
          MessageOptimizer.trimMessages();
        }, 2000);

        state.isActive = true;
        Utils.log('LeanGPT initialized successfully');
      }).catch(error => {
        Utils.log(`Initialization failed: ${error.message}`, 'error');
      });
    },

    waitForChatGPT: function() {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds timeout

        const checkReady = () => {
          attempts++;

          // Check if ChatGPT interface is ready
          const chatContainer = document.querySelector(SELECTORS.chatContainer);
          const inputArea = document.querySelector(SELECTORS.inputArea);
          const messages = document.querySelectorAll(SELECTORS.allMessages);

          if (chatContainer && inputArea) {
            Utils.log(`ChatGPT ready after ${attempts} attempts`);
            resolve();
          } else if (attempts >= maxAttempts) {
            reject(new Error('ChatGPT interface not ready after timeout'));
          } else {
            setTimeout(checkReady, 1000);
          }
        };

        checkReady();
      });
    },

    destroy: function() {
      Utils.log('Destroying LeanGPT...');

      // Stop monitoring
      DOMMonitor.stop();

      // Clear timers
      if (state.trimTimer) {
        clearTimeout(state.trimTimer);
      }

      // Remove scroll listener
      if (state.scrollHandler) {
        const chatContainer = document.querySelector(SELECTORS.chatContainer);
        if (chatContainer) {
          chatContainer.removeEventListener('scroll', state.scrollHandler);
        }
      }

      // Remove CSS classes
      document.documentElement.classList.remove('leangpt-no-animations');

      // Reset state
      state.isActive = false;
      Utils.log('LeanGPT destroyed');
    },

    getStatus: function() {
      return {
        isActive: state.isActive,
        messageCount: state.messageCount,
        maxMessages: CONFIG.MAX_MESSAGES,
        version: '0.1.0'
      };
    }
  };

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    Utils.log('Message from background: ' + request.action);
    
    switch (request.action) {
      case 'init':
        LeanGPT.init();
        sendResponse({ status: 'success' });
        break;
        
      case 'toggle':
        if (state.isActive) {
          LeanGPT.destroy();
        } else {
          LeanGPT.init();
        }
        sendResponse({ status: 'success', active: state.isActive });
        break;
        
      case 'getStatus':
        sendResponse(LeanGPT.getStatus());
        break;
        
      default:
        sendResponse({ status: 'error', message: 'Unknown action' });
    }
    
    return true; // Keep message channel open
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LeanGPT.init);
  } else {
    // DOM already loaded
    LeanGPT.init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', LeanGPT.destroy);

  // Expose to global scope for debugging
  if (CONFIG.DEBUG) {
    window.LeanGPT = LeanGPT;
  }

})();