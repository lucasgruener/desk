const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceFolder = './script-test';   // Folder containing source PNG files
const outputFolder = './composite_images'; // Folder to save manipulated images

// Create output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }
  
  // Read PNG files from the source folder
  fs.readdir(sourceFolder, (err, files) => {
    if (err) {
      console.error('Error reading source folder:', err);
      return;
    }
  
    // Process each PNG file
    files.forEach(file => {
      if (path.extname(file) === '.png') {
        const sourceImagePath = path.join(sourceFolder, file);
        const outputImagePath = path.join(outputFolder, file);
  
        // Open the source image and get its dimensions
        sharp(sourceImagePath)
          .metadata()
          .then(metadata => {
            const imageWidth = metadata.width;
            const imageHeight = metadata.height;
  
            // Calculate the position to center the image on the canvas
            const left = Math.floor(Math.max(0, (200 - imageWidth) / 2));
            const top = Math.floor(Math.max(0, (200 - imageHeight) / 2));
  
            // Create a new 200x200 white canvas
            sharp({
              create: {
                width: 200,
                height: 200,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
              }
            })
              // Composite the source image onto the canvas at the center
              .composite([
                {
                  input: sourceImagePath,
                  top: top,
                  left: left
                }
              ])
              // Save the manipulated image to the output folder
              .toFile(outputImagePath, err => {
                if (err) {
                  console.error('Error processing image:', err);
                } else {
                  console.log(`Image processed and saved: ${outputImagePath}`);
                }
              });
          })
          .catch(err => {
            console.error('Error getting image metadata:', err);
          });
      }
    });
  });