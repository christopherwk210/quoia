// Imports
const fsExt = require('../utils/fs-ext');
const fs = require('fs');
const path = require('path');

/**
 * Copies all files specified for the project
 * @param {BuildConfig} config Build config
 */
async function copyFiles(config) {
  let rootCopy = config.rootCopy;
  if (!rootCopy || rootCopy.length === 0) return;

  // Iterate over paths
  for (let copyPath of rootCopy) {
    // Ensure path is valid
    try {
      await new Promise((resolve, reject) => {
        fs.exists(copyPath, exists => {
          exists ? resolve() : reject();
        });
      });
    } catch(e) {
      throw new Error(`Path ${copyPath} does not exist!`);
    }

    // Read path stats
    let pathStats;
    try {
      pathStats = await new Promise((resolve, reject) => {
        fs.lstat(copyPath, (err, stats) => {
          if (err) reject(err);

          resolve(stats);
        });
      });
    } catch(e) {
      throw new Error(`Could not read path ${copyPath}!`);
    }

    // Check if path is file
    if (pathStats.isFile()) {

      // Parse file name
      let pathSplit = copyPath.split(path.sep);
      let fileName = pathSplit[pathSplit.length - 1];

      // Copy file
      try {
        await new Promise((resolve, reject) => fs.copyFile(copyPath, path.join(config.outDir, fileName), err => {
          if (err) reject(err);
          resolve();
        }));
      } catch(e) {
        throw new Error(`Could not copy ${copyPath} to ${path.join(config.outDir, fileName)}!`);
      }

    // Check if path is directory
    } else if (pathStats.isDirectory()) {

      // Check if directory copy or contents copy
      let terminatingChar = copyPath.substring(copyPath.length - 1, copyPath.length);

      try {
        // Content copy
        if (terminatingChar === '/' || terminatingChar === '\\') {
          await fsExt.deepCopyDirContents(copyPath, config.outDir);
        // Directory copy
        } else {
          await fsExt.deepCopyDir(copyPath, config.outDir);
        }
      } catch(e) {
        throw new Error(e);
      }
    }
  }

  return;
}

module.exports = copyFiles;
