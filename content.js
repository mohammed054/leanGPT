// LeanGPT Content Script - FINAL MINIMAL VERSION
console.log('[LeanGPT] Content script starting...');

// Add visual indicator
const indicator = document.createElement('div');
indicator.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background: #00d4ff;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  z-index: 999999;
  font-family: Arial, sans-serif;
`;
indicator.textContent = '🚀 LeanGPT ACTIVE';
document.body.appendChild(indicator);

console.log('[LeanGPT] Visual indicator added');

// Set up message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LeanGPT] Received message:', request);
  
  if (request.action === 'getStatus') {
    sendResponse({
      status: 'success',
      data: {
        isActive: true,
        messageCount: 8,
        maxMessages: 10,
        version: '0.1.0'
      }
    });
  }
  
  return true;
});

console.log('[LeanGPT] Content script fully loaded and ready');