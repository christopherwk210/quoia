// Imports
const fs = require('fs');
const _path = require('path');

/**
 * Deletes a directory recursively async, like rm -rf
 * @param {string} path Directory path
 */
async function rmrf(path) {

  // Stop on root
  if (path === '/') {
    throw new Error('Can\'t delete root drive directory!');
  }

  // Check if path exists
  let exists = await new Promise( resolve => fs.exists(path, exists => resolve(exists)) );
  if (exists) {

    // Get directory reading
    let files = await new Promise(resolve => fs.readdir(path, (err, files) => {
      if (err) resolve([]);
      resolve(files);
    }));

    // Iterate over items
    for (let file of files) {

      // Get path of current file
      let filePath = _path.join(path, file);

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
    let err = await new Promise(resolve => fs.rmdir(path, err => {
      resolve(!!err);
    }));

    if (err) throw new Error(`Could not delete directory ${path}`);
    
    return;
  }
}

module.exports.rmrf = rmrf;
