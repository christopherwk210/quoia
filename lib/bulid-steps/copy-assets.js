// Imports
const fsExt = require('../utils/fs-ext');
const path = require('path');

/**
 * Copies all static assets for the project
 * @param {BuildConfig} config Build config
 */
async function copyAssets(config) {
  let assets = config.assets;
  if (!assets) return;

  try {
    await fsExt.deepCopyDir(assets, config.outDir);  
  } catch(e) {
    throw new Error(e);
  }

  return;
}

module.exports = copyAssets;
