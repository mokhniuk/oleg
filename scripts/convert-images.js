const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Convert all JPG and PNG images to WebP recursively
const convertImages = async (dir) => {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await convertImages(fullPath);
    } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const outputPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

      // Skip if WebP already exists and is newer than source
      if (fs.existsSync(outputPath)) {
        const outStat = fs.statSync(outputPath);
        if (outStat.mtime > stat.mtime) {
          continue;
        }
      }

      console.log(`Converting ${fullPath} to ${outputPath}`);

      try {
        await sharp(fullPath)
          .webp({ quality: 80 })
          .toFile(outputPath);

        const originalSize = stat.size;
        const webpSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

        console.log(`  Original: ${(originalSize / 1024).toFixed(1)}KB`);
        console.log(`  WebP: ${(webpSize / 1024).toFixed(1)}KB`);
        console.log(`  Savings: ${savings}%`);
      } catch (error) {
        console.error(`Error converting ${fullPath}:`, error);
      }
    }
  }
};

const run = async () => {
  const inputDirs = ['public/images', 'public/projects'];
  for (const dir of inputDirs) {
    await convertImages(dir);
  }
};

run().then(() => {
  console.log('Image conversion completed!');
}).catch(console.error);