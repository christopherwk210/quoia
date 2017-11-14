// Imports
const fs = require('fs');
const path = require('path');

/**
 * Deletes a directory recursively async, like rm -rf
 * @param {string} directoryPath Directory path
 */
async function rmrf(directoryPath) {
  // Stop on root
  if (directoryPath === '/') {
    throw new Error('Can\'t delete root drive directory!');
  }

  // Check if path exists
  let exists = await new Promise( resolve => fs.exists(directoryPath, exists => resolve(exists)) );
  if (exists) {

    // Get directory reading
    let files = await new Promise(resolve => fs.readdir(directoryPath, (err, files) => {
      if (err) resolve([]);
      resolve(files);
    }));

    // Iterate over items
    for (let file of files) {

      // Get path of current file
      let filePath = path.join(directoryPath, file);

      // Determine if this file is a directory
      let isDirectory = await new Promise(resolve => fs.lstat(filePath, (err, stats) => {
        if (!err && stats.isDirectory()) resolve(true);
        resolve(false);
      }));

      // If it is, get recursive, otherwise delete it
      if (isDirectory) {
        await rmrf(filePath);
      } else {
        let err = await new Promise(resolve => fs.unlink(filePath, err => {
          resolve(!!err);
        }));

        if (err) throw new Error(`Could not delete file ${filePath}`);
      }
    };

    // Delete the parent folder
    let err = await new Promise(resolve => fs.rmdir(directoryPath, err => {
      resolve(!!err);
    }));

    if (err) throw new Error(`Could not delete directory ${directoryPath}`);
    
    return;
  }
}

/**
 * Quickly read a file
 * @param {string} filePath Path to file
 */
async function quickRead(filePath) {
  return new Promise(resolve => {
    fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
      if (err) resolve(false);
      resolve(data);
    });
  });
}

module.exports.rmrf = rmrf;
module.exports.quickRead = quickRead;
