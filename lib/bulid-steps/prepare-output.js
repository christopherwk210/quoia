// Imports
const fsExt = require('../utils/fs-ext');
const path = require('path');
const Component = require('../component');

/**
 * Prepares output directory and saves component paths to each component
 * @param {BuildConfig} config Build config
 */
async function prepareOutputDirectory(config) {
  let children = config.rootPage.options.children || [];

  // Save output path to component
  config.rootPage.build.directory = config.outDir;

  // Create output directory if it doesn't exist
  let freshDirectoryResults = await fsExt.mkdirFresh(config.outDir);
  if (!freshDirectoryResults) throw new Error(`Could not create directory ${config.outDir}`);

  // Navigate through subpages
  for (let child of children) {
    let trueComponent = child instanceof Component ? child : child.component;

    await prepareOutputDirectory({
      ...config,
      rootPage: trueComponent,
      outDir: path.join(config.outDir, trueComponent.options.name)
    });
  }
}

module.exports = prepareOutputDirectory;
