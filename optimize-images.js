const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Image optimization function
async function optimizeImage(inputPath, outputPath) {
  console.log(`Optimizing: ${inputPath} -> ${outputPath}`);
  
  try {
    // Make sure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Optimize image
    await sharp(inputPath)
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        progressive: false
      })
      .toFile(outputPath);
    
    console.log(`Successfully optimized: ${outputPath}`);
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
  }
}

// List of images to optimize
const imagesToOptimize = [
  {
    input: './assets/splash.png',
    output: './android/app/src/main/res/drawable/splashscreen_image.png'
  },
  {
    input: './assets/icons/tmsquare_logo.png',
    output: './assets/icons/tmsquare_logo_optimized.png'
  }
];

// Process all images
async function processImages() {
  try {
    for (const img of imagesToOptimize) {
      await optimizeImage(img.input, img.output);
    }
    console.log('All images processed successfully.');
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

// Run the optimization
processImages(); 