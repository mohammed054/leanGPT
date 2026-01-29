# 🔧 EXTENSION RELOAD INSTRUCTIONS

## ⚠️  CRITICAL: You MUST Reload Extension!

The error you're seeing means Chrome is still running the OLD version of the extension.

### 📋 STEP-BY-STEP RELOAD:

1. **Open Extensions Page**
   ```
   Type: chrome://extensions/ in address bar
   Press Enter
   ```

2. **Find LeanGPT**
   - Look for "LeanGPT" in the list
   - Should show version "0.1.0"

3. **Click Reload Button**
   - Click the 🔄 (circular arrow) button
   - Wait 2-3 seconds

4. **Verify Reload Worked**
   - The extension should flash/update
   - Name should still be "LeanGPT"

5. **Test on ChatGPT**
   - Go to: https://chat.openai.com
   - Look for BLUE box: "LeanGPT: ACTIVE"
   - Open Console (F12) - should see "[LeanGPT] Content script loaded"

6. **Test Popup**
   - Click extension icon
   - Should show "Active" NOT "Content Script Error"

## ❌ IF THIS DOESN'T WORK:

### Method A: Complete Reinstall
1. **Remove Extension**
   - Click "Remove" on LeanGPT in chrome://extensions/
   - Confirm removal

2. **Re-add Extension**
   - Click "Load unpacked"
   - Select folder: /home/spikeyz/Desktop/projects/leanGPT

### Method B: Test Ultra Version
1. **Use Ultra Test Files**
   ```
   cd /home/spikeyz/Desktop/projects/leanGPT
   cp manifest-test.json manifest.json
   ```

2. **Reload Extension**
   - Name should change to "LeanGPT - ULTRA TEST"

3. **Test Any Website**
   - Should see RED box: "🔴 SCRIPT INJECTED"

## 🎯 SUCCESS INDICATORS:

✅ **SUCCESS**: Blue "LeanGPT: ACTIVE" box appears
✅ **SUCCESS**: Console shows "[LeanGPT]" messages
✅ **SUCCESS**: Popup shows "Active" status

❌ **FAILURE**: Still see "Content Script Error"
❌ **FAILURE**: No blue indicator on page
❌ **FAILURE**: No console messages

## 📞 TROUBLESHOOTING:

If still failing after reload:
1. **Check Chrome Version** - Update Chrome
2. **Check Permissions** - Click "Details" on extension
3. **Try Different Browser** - Edge/Brave
4. **Clear Cache** - chrome://extensions/ → Clear data

**The key is RELOADING the extension after each change!**