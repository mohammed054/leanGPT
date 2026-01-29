#!/bin/bash

echo "🔥 FORCED RELOAD - LeanGPT Extension Fix"
echo "========================================"

# Create ultra-simple test version
echo "📝 Creating ultra-simple content script..."
cat > content.js << 'EOF'
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
EOF

# Create ultra-simple manifest
echo "📝 Creating ultra-simple manifest..."
cat > manifest.json << 'EOF'
{
  "manifest_version": 3,
  "name": "LeanGPT - FORCED TEST",
  "version": "0.1.0",
  "description": "Forced test version",
  
  "permissions": ["activeTab"],
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  
  "action": {
    "default_title": "LeanGPT Test"
  }
}
EOF

echo "✅ Files updated!"
echo ""
echo "🔥 NEXT STEPS:"
echo "1. Go to chrome://extensions/"
echo "2. Find 'LeanGPT - FORCED TEST'"
echo "3. Click Reload button 🔄"
echo "4. Go to ANY website (google.com)"
echo "5. Look for RED box: '🔴 SCRIPT INJECTED'"
echo ""
echo "🎯 If you see RED box → Extension works!"
echo "🎯 If no RED box → Chrome extension system broken"