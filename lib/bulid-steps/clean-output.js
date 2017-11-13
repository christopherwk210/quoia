// Imports
const fs = require('fs');
const fsExt = require('../utils/fs-ext');

/**
 * Cleans the output directory
 * @param {BuildConfig} config Build config
 */
async function cleanOutput(config) {

  // Delete output directory if it exists
  await fsExt.rmrf(config.outDir);

  // Ensure it worked
  let exists = await new Promise(resolve => fs.exists(config.outDir, exists => resolve(exists)));
  
  if (exists) {
    throw new Error(`Could not delete ${config.outDir}`);
  }

  // Create the output directory
  let err = await new Promise(resolve => {
    fs.mkdir(config.outDir, err => {
      if (!err) {
        resolve(false);
      } else {
        resolve(`Could not create ${config.outDir}!`)
      }
    });
  });
  if (err) throw new Error(err);

  return;
}

module.exports = cleanOutput;
