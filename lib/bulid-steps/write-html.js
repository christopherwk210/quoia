// Imports
const fsExt = require('../utils/fs-ext');
const path = require('path');
const Component = require('../component');

/**
 * Writes all of the HTML to disk for the project
 * @param {BuildConfig} config Build config
 */
async function writeHTML(config) {
  let currentComponent = config.rootPage;
  let children = currentComponent.options.children || [];
  
  // Create HTML file
  let HTMLpath = path.join(currentComponent.build.directory, 'index.html');
  let write = await fsExt.quickWrite(HTMLpath, currentComponent.build.template);
  if (!write) throw new Error(`Could not write HTML file ${HTMLpath}`);

  // Build sub pages
  for (let child of children) {
    let trueComponent = child instanceof Component ? child : child.component;
    await writeHTML({
      ...config,
      rootPage: trueComponent
    });
  }
}

module.exports = writeHTML;
