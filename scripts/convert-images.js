const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Convert all JPG and PNG images to WebP
const convertImages = async () => {
  const inputDirs = ['public/images', 'public/projects'];
  
  for (const dir of inputDirs) {
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      if (file.match(/\.(jpg|jpeg|png)$/i)) {
        const inputPath = path.join(dir, file);
        const outputPath = path.join(dir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
        
        console.log(`Converting ${inputPath} to ${outputPath}`);
        
        try {
          await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);
          
          // Compare file sizes
          const originalSize = fs.statSync(inputPath).size;
          const webpSize = fs.statSync(outputPath).size;
          const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
          
          console.log(`  Original: ${(originalSize / 1024).toFixed(1)}KB`);
          console.log(`  WebP: ${(webpSize / 1024).toFixed(1)}KB`);
          console.log(`  Savings: ${savings}%`);
        } catch (error) {
          console.error(`Error converting ${inputPath}:`, error);
        }
      }
    }
  }
};

convertImages().then(() => {
  console.log('Image conversion completed!');
}).catch(console.error);