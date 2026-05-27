const sharp = require('sharp');

async function removeWatermark(inputPath, outputPath, opts = {}) {
  const { threshold = 60, scanW = 0.22, scanH = 0.08 } = opts;

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  const regionX = Math.floor(width * (1 - scanW));
  const regionY = Math.floor(height * (1 - scanH));
  const regionW = width - regionX;
  const regionH = height - regionY;

  const { data: fullData, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const stride = width * channels;

  const sampleY = Math.max(0, regionY - Math.floor(regionH / 4));

  const bgSamples = [];
  for (let x = regionX; x < width; x++) {
    const idx = (sampleY * width + x) * channels;
    const gray = (fullData[idx] + fullData[idx + 1] + fullData[idx + 2]) / 3;
    bgSamples.push(gray);
  }
  bgSamples.sort((a, b) => a - b);
  const bgMedian = bgSamples[Math.floor(bgSamples.length / 2)];

  let modified = false;
  for (let y = regionY; y < height; y++) {
    for (let x = regionX; x < width; x++) {
      const idx = (y * width + x) * channels;
      const gray = (fullData[idx] + fullData[idx + 1] + fullData[idx + 2]) / 3;

      if (gray < bgMedian - threshold) {
        const srcIdx = (sampleY * width + x) * channels;
        for (let c = 0; c < channels; c++) {
          fullData[idx + c] = fullData[srcIdx + c];
        }
        modified = true;
      }
    }
  }

  if (!modified) {
    const lowerThreshold = Math.max(30, threshold - 20);
    for (let y = regionY; y < height; y++) {
      for (let x = regionX; x < width; x++) {
        const idx = (y * width + x) * channels;
        const gray = (fullData[idx] + fullData[idx + 1] + fullData[idx + 2]) / 3;

        if (gray < bgMedian - lowerThreshold) {
          const srcIdx = (sampleY * width + x) * channels;
          for (let c = 0; c < channels; c++) {
            fullData[idx + c] = fullData[srcIdx + c];
          }
        }
      }
    }
  }

  await sharp(fullData, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .toFile(outputPath);
}

module.exports = { removeWatermark };
