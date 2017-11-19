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
      if (err) reject(err);
      resolve(data);
    });
  });
}

/**
 * Quickly write to a file
 * @param {string} filePath Path to file
 * @param {any} data Data to write
 */
async function quickWrite(filePath, data) {
  return new Promise(resolve => {
    fs.writeFile(filePath, data, { encoding: 'utf8' }, err => {
      if (err) resolve(false);
      resolve(true);
    });
  });
}

/**
 * Creates a folder if it doesn't already exist
 * @param {string} directory Path to directory
 */
async function mkdirFresh(directory) {
  return new Promise(resolve => {
    fs.exists(directory, exists => {
      if (exists) resolve(true);

      fs.mkdir(directory, err => {
        if (err) resolve(false);
        resolve(true);
      });
    });
  });
}

/**
 * Copies contents of directory into another
 * @param {string} source Path to source directory
 * @param {string} target Directory to paste into
 */
async function deepCopyDirContents(source, target) {
  let currentDir = target;

  // Make sure file exists
  try {
    await new Promise((resolve, reject) => fs.exists(source, exists => {
      if (!exists) reject(`Could not read from ${source}!`);
      resolve();
    }));
  } catch(e) {
    throw new Error(e);
  }

  // Read the directory contents
  let files;
  try {
    files = await new Promise((resolve, reject) => fs.readdir(source, (err, files) => {
      if (err) reject(`Could not read from ${source}!`);
      resolve(files);
    }));
  } catch(e) {
    throw new Error(e);
  }

  // Copy each
  for (let file of files) {
    let fullPath = path.join(source, file);

    // Get file stats
    let stats;
    try {
      stats = await new Promise((resolve, reject) => fs.lstat(fullPath, (err, stats) => {
        if (err) reject(`Could not get info for ${fullPath}!`);
        resolve(stats);
      }));
    } catch(e) {
      throw new Error(e);
    }
    
    // If it's a directory, recurse
    if (stats.isDirectory()) {
      try {
        await deepCopyDir(fullPath, currentDir);      
      } catch(e) {
        throw new Error(e);
      }
    
    // If it's a link
    } else if (stats.isSymbolicLink()) {
      let linkString;
      try {
        linkString = await new Promise((resolve, reject) => fs.readlink(fullPath, (err, link) => {
          if (err) reject(`Could not read link ${fullPath}!`);
          resolve(link);
        }));
      } catch(e) {
        throw new Error(e);
      }

      try {
        await new Promise((resolve, reject) => fs.symlink(linkString, path.join(currentDir, file), err => {
          if (err) reject(`Could not create symlink for ${fullPath} in ${currentDir}!`);        
          resolve();
        }));
      } catch(e) {
        throw new Error(e);
      }

    // If it's a file
    } else if (stats.isFile()) {
      try {
        await new Promise((resolve, reject) => fs.copyFile(fullPath, path.join(currentDir, file), err => {
          if (err) reject(`Could not copy ${fullPath} to ${path.join(currentDir, file)}!`);        
          resolve();
        }));
      } catch(e) {
        throw new Error(e);
      }
    }
  }
}

/**
 * Copies an entire folder to another directory
 * @param {string} source Path to source directory
 * @param {string} target Directory to paste into
 */
async function deepCopyDir(source, target) {

  // Make sure file exists
  try {
    await new Promise((resolve, reject) => fs.exists(source, exists => {
      if (!exists) reject(`Could not read from ${source}!`);
      resolve();
    }));
  } catch(e) {
    throw new Error(e);
  }

  // Create directory
  let currentDirSplit = source.split(path.sep);
  let sourceFolderName = currentDirSplit[currentDirSplit.length - 1];
  let currentDir = path.join(target, sourceFolderName);
  let success = await mkdirFresh(currentDir);

  if (!success) {
    throw new Error(`Could not create assets directory ${currentDir}!`);
  }

  // Read the directory contents
  let files;
  try {
    files = await new Promise((resolve, reject) => fs.readdir(source, (err, files) => {
      if (err) reject(`Could not read from ${source}!`);
      resolve(files);
    }));
  } catch(e) {
    throw new Error(e);
  }

  // Copy each
  for (let file of files) {
    let fullPath = path.join(source, file);

    // Get file stats
    let stats;
    try {
      stats = await new Promise((resolve, reject) => fs.lstat(fullPath, (err, stats) => {
        if (err) reject(`Could not get info for ${fullPath}!`);
        resolve(stats);
      }));
    } catch(e) {
      throw new Error(e);
    }
    
    // If it's a directory, recurse
    if (stats.isDirectory()) {
      try {
        await deepCopyDir(fullPath, currentDir);      
      } catch(e) {
        throw new Error(e);
      }
    
    // If it's a link
    } else if (stats.isSymbolicLink()) {
      let linkString;
      try {
        linkString = await new Promise((resolve, reject) => fs.readlink(fullPath, (err, link) => {
          if (err) reject(`Could not read link ${fullPath}!`);
          resolve(link);
        }));
      } catch(e) {
        throw new Error(e);
      }

      try {
        await new Promise((resolve, reject) => fs.symlink(linkString, path.join(currentDir, file), err => {
          if (err) reject(`Could not create symlink for ${fullPath} in ${currentDir}!`);        
          resolve();
        }));
      } catch(e) {
        throw new Error(e);
      }

    // If it's a file
    } else if (stats.isFile()) {
      try {
        await new Promise((resolve, reject) => fs.copyFile(fullPath, path.join(currentDir, file), err => {
          if (err) reject(`Could not copy ${fullPath} to ${path.join(currentDir, file)}!`);        
          resolve();
        }));
      } catch(e) {
        throw new Error(e);
      }
    }
  }

  return;
}

module.exports.rmrf = rmrf;
module.exports.quickRead = quickRead;
module.exports.quickWrite = quickWrite;
module.exports.mkdirFresh = mkdirFresh;
module.exports.deepCopyDir = deepCopyDir;
module.exports.deepCopyDirContents = deepCopyDirContents;
