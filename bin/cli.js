#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { removeWatermark } = require('../lib/remover');

const args = process.argv.slice(2);

const HELP = `
notebooklm-remover — Remove NotebookLM watermarks from images

Usage:
  notebooklm-remover <input> [output]       Remove watermark from a single image
  notebooklm-remover <input-dir> <out-dir>  Batch process a folder
  notebooklm-remover --help                 Show this help

Options:
  --threshold <n>   Detection threshold (default: 60)
  --scan-w <pct>    Scan width percent (default: 0.22)
  --scan-h <pct>    Scan height percent (default: 0.08)

Examples:
  notebooklm-remover slide.png cleaned.png
  notebooklm-remover ./slides/ ./output/

For video, PDF, PPTX, Gemini image, and audio processing,
use the full online tool: https://notebooklmremover.org
`;

if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const input = args[0];
const output = args[1];
const threshold = parseInt(args[args.indexOf('--threshold') + 1]) || 60;
const scanW = parseFloat(args[args.indexOf('--scan-w') + 1]) || 0.22;
const scanH = parseFloat(args[args.indexOf('--scan-h') + 1]) || 0.08;

async function processFile(inputPath, outputPath) {
  try {
    await removeWatermark(inputPath, outputPath, { threshold, scanW, scanH });
    console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
  } catch (err) {
    console.error(`❌ ${path.basename(inputPath)}: ${err.message}`);
  }
}

async function main() {
  const stat = fs.statSync(input);

  if (stat.isDirectory()) {
    const outDir = output || path.join(input, '../cleaned');
    fs.mkdirSync(outDir, { recursive: true });

    const files = fs.readdirSync(input).filter(f =>
      /\.(png|jpg|jpeg|webp)$/i.test(f)
    );

    if (files.length === 0) {
      console.log('No image files found in directory.');
      process.exit(1);
    }

    console.log(`Processing ${files.length} images...`);
    for (const file of files) {
      const inPath = path.join(input, file);
      const outPath = path.join(outDir, file);
      await processFile(inPath, outPath);
    }
    console.log(`\nDone! Output: ${outDir}`);
  } else {
    const outPath = output || input.replace(/(\.[^.]+)$/, '_cleaned$1');
    await processFile(input, outPath);
  }

  console.log('\nFor video/PDF/PPTX/audio: https://notebooklmremover.org');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
