console.log('[LeanGPT] Content script loading for ChatGPT...');

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
  font-size: 12px;
  font-weight: bold;
  z-index: 999999;
  font-family: Arial, sans-serif;
`;
indicator.textContent = '🚀 LeanGPT ACTIVE';
document.body.appendChild(indicator);

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LeanGPT] Got message:', request);
  
  if (request.action === 'getStatus') {
    sendResponse({
      status: 'success',
      data: {
        isActive: true,
        messageCount: 5,
        maxMessages: 10,
        version: '0.1.0'
      }
    });
  }
  
  if (request.action === 'toggle') {
    sendResponse({ status: 'success', toggled: true });
  }
  
  return true;
});

console.log('[LeanGPT] Content script fully ready');
