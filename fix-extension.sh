#!/bin/bash

echo "🔄 LeanGPT Extension Fix Script"
echo "================================"

echo "📍 Current directory: $(pwd)"
echo "📋 Files in directory:"
ls -la *.json *.js *.html 2>/dev/null | head -10

echo ""
echo "🔧 Step 1: Copy working content script..."
cp content.js content.js.backup
cp content-working.js content.js 2>/dev/null || echo "content-working.js not found"

echo "🔧 Step 2: Ensure manifest is correct..."
if [ ! -f manifest.json ]; then
    echo "❌ manifest.json missing!"
    exit 1
fi

echo "✅ Files ready for reload!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Open chrome://extensions/"
echo "2. Find LeanGPT extension"
echo "3. Click Reload button 🔄"
echo "4. Test on ChatGPT"
echo ""
echo "🔍 Look for:"
echo "- Blue box: 'LeanGPT: ACTIVE'"
echo "- Console: '[LeanGPT] Content script loaded'"
echo "- Popup: Status: Active"