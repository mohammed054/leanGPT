console.log('[LeanGPT] SCRIPT LOADED - TEST VERSION');

// Add obvious visual indicator
const testDiv = document.createElement('div');
testDiv.innerHTML = '🔴 SCRIPT INJECTED';
testDiv.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  background: red;
  color: white;
  padding: 20px;
  z-index: 999999;
  font-size: 24px;
  font-weight: bold;
`;
document.body.appendChild(testDiv);

// Always respond to messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LeanGPT] Got message:', request);
  sendResponse({ status: 'success', data: { active: true } });
});

console.log('[LeanGPT] SCRIPT FULLY ACTIVE');
