# Icon Generation Script

## LeanGPT Extension Icons

Since image conversion tools aren't available, you'll need to manually convert the SVG to PNG files.

### Instructions:

1. **Use Online Tool:**
   - Go to https://cloudconvert.com/svg-to-png
   - Upload `icons/icon.svg`
   - Download as:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels)  
     - `icon128.png` (128x128 pixels)

2. **Or Use Local Tool:**
   ```bash
   # If you have ImageMagick:
   convert icon.svg -resize 16x16 icon16.png
   convert icon.svg -resize 48x48 icon48.png
   convert icon.svg -resize 128x128 icon128.png
   
   # If you have rsvg-convert:
   rsvg-convert -w 16 -h 16 -o icon16.png icon.svg
   rsvg-convert -w 48 -h 48 -o icon48.png icon.svg
   rsvg-convert -w 128 -h 128 -o icon128.png icon.svg
   ```

3. **Or Use Chrome:**
   - Open icon.svg in Chrome
   - Take screenshots and resize to required dimensions

### Icon Design:
- **Theme:** Lightning bolt representing speed/performance
- **Colors:** Blue gradient on dark background
- **Style:** Modern, clean, professional
- **Meaning:** Speed optimization for ChatGPT

### Required Files:
- `icons/icon16.png` - For browser toolbar
- `icons/icon48.png` - For extensions management page  
- `icons/icon128.png` - For Chrome Web Store