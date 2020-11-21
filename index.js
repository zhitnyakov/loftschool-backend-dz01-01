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
const files = collectFiles(source);
orderFiles(files, dest);
if (deleteSource) {
  fs.rmdirSync(source, { recursive: true });
}

// Functions
function collectFiles (dir) {
  let filesList = [];

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const pathToFile = path.join(dir, file);
    const stats = fs.statSync(pathToFile);

    if (stats.isDirectory()) {
      filesList = filesList.concat(collectFiles(pathToFile));
    } else if (stats.isFile()) {
      filesList.push(pathToFile);
    }
  }

  return filesList;
}

function orderFiles (files, dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  for (const file of files) {
    const parsedPath = path.parse(file);
    const filename = parsedPath.base;
    const firstLetter = filename.substring(0, 1).toUpperCase();

    const destDir = path.join('./result', firstLetter);
    const newFile = path.join('./result', firstLetter, parsedPath.base);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir);
    }

    if (!fs.existsSync(newFile)) {
      fs.linkSync(file, newFile);
    }
  }
}
