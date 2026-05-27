# notebooklm-remover

Remove NotebookLM watermarks from images via CLI or Node.js API. 100% local processing — your files never leave your machine.

> **For video, PDF, PPTX, Gemini image, and audio processing, use the full online tool: [notebooklmremover.org](https://notebooklmremover.org)**

## Install

```bash
npm install -g notebooklm-remover
```

## CLI Usage

```bash
# Single image
notebooklm-remover slide.png cleaned.png

# Batch process a folder
notebooklm-remover ./slides/ ./output/

# Custom threshold
notebooklm-remover slide.png cleaned.png --threshold 45
```

## API Usage

```javascript
const { removeWatermark } = require('notebooklm-remover');

await removeWatermark('input.png', 'output.png', {
  threshold: 60,  // Detection sensitivity (default: 60)
  scanW: 0.22,    // Scan width ratio (default: 22% from right)
  scanH: 0.08,    // Scan height ratio (default: 8% from bottom)
});
```

## How It Works

1. Scans the bottom-right corner of the image (where NotebookLM places its logo)
2. Detects dark pixels against the background using median-based thresholding
3. Replaces detected watermark pixels with sampled background from above the region
4. Multi-pass detection with adaptive thresholds for various backgrounds

## Supported Formats

| Format | CLI | Online Tool |
|--------|-----|-------------|
| PNG/JPG/WebP images | ✅ | ✅ |
| Video (MP4) | ❌ | [✅ notebooklmremover.org/video](https://notebooklmremover.org/video) |
| PDF slides | ❌ | [✅ notebooklmremover.org/slides](https://notebooklmremover.org/slides) |
| PPTX | ❌ | [✅ notebooklmremover.org/pptx](https://notebooklmremover.org/pptx) |
| Gemini images | ❌ | [✅ notebooklmremover.org/gemini-image](https://notebooklmremover.org/gemini-image) |
| Audio trimming | ❌ | [✅ notebooklmremover.org/audio](https://notebooklmremover.org/audio) |
| Metadata removal | ❌ | [✅ notebooklmremover.org/metadata](https://notebooklmremover.org/metadata) |

## License

MIT
