const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Recursively collect all jpg/png files under a directory
function collectImages(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectImages(fullPath, results);
    } else if (entry.name.match(/\.(jpg|jpeg|png)$/i)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Convert all JPG and PNG images to WebP (skips already-converted files)
const convertImages = async () => {
  const inputDirs = ['public/images', 'public/projects'];
  let converted = 0;
  let skipped = 0;

  for (const dir of inputDirs) {
    const images = collectImages(dir);

    for (const inputPath of images) {
      const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

      // Skip if WebP already exists and is newer than the source
      if (fs.existsSync(outputPath)) {
        const srcMtime = fs.statSync(inputPath).mtimeMs;
        const outMtime = fs.statSync(outputPath).mtimeMs;
        if (outMtime >= srcMtime) {
          skipped++;
          continue;
        }
      }

      console.log(`Converting ${inputPath} → ${outputPath}`);

      try {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);

        const originalSize = fs.statSync(inputPath).size;
        const webpSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

        console.log(`  Original: ${(originalSize / 1024).toFixed(1)}KB  WebP: ${(webpSize / 1024).toFixed(1)}KB  Savings: ${savings}%`);
        converted++;
      } catch (error) {
        console.error(`  Error converting ${inputPath}:`, error.message);
      }
    }
  }

  console.log(`\nDone. Converted: ${converted}, Skipped (up-to-date): ${skipped}`);
};

convertImages().catch(console.error);