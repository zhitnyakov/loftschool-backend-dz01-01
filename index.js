// Load modules
const fs = require('fs');
const path = require('path');

// Process args
const args = process.argv.slice(2);

let source;
let dest;
let deleteSource = false;

for (const arg of args) {
  if (arg === '-d') {
    deleteSource = true;
  } else if (!source) {
    source = arg;
  } else {
    dest = arg;
  }
}

// If there's not enough args
// Throw error end exit
if (!source || !dest) {
  throw new Error('You did not specify both source and destination folders');
}

// Do it!
collectFiles(source, dest, deleteSource);
process.nextTick(() => {
  if (deleteSource) {
    fs.rmdir(source, { recursive: true }, () => {});
  }
});

// Functions
function collectFiles (sourceDir, resultDir, deleteSource = null) {
  fs.readdir(sourceDir, function (_, files) {
    console.log(files);
    for (const i in files) {
      const filePath = path.join(sourceDir, files[i]);

      fs.stat(filePath, function (_, stats) {
        if (stats && stats.isDirectory()) {
          collectFiles(filePath, resultDir);
        } else if (stats && stats.isFile()) {
          const firstLetter = files[i].substring(0, 1).toUpperCase();
          const destDir = path.join(resultDir, firstLetter);
          const newFile = path.join(resultDir, firstLetter, files[i]);

          fs.stat(resultDir, function (_, stats) {
            if (!stats) {
              fs.mkdir(resultDir, err => err);
            }

            fs.stat(destDir, function (_, stats) {
              if (!stats) {
                fs.mkdir(destDir, function (err) {
                  if (err && err.code === 'EEXIST') console.log('Dir ' + resultDir + ' already exists. Skipping creation.');

                  console.log(`Copying file from ${filePath} to ${newFile}`);
                  fs.copyFile(filePath, newFile, 0, _ => {});
                });
              } else {
                console.log(`Copying file from ${filePath} to ${newFile}`);
                fs.copyFile(filePath, newFile, 0, _ => {});
              }
            });
          });
        }
      });
    }
  });
}
