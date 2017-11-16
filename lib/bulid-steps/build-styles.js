// Imports
const fsExt = require('../utils/fs-ext');
const path = require('path');
const Component = require('../component');

/**
 * Builds all of the styles for the project
 * @param {BuildConfig} config Build config
 */
async function buildStyles(config) {
  config.styleTransform = config.styleTransform || (code => code);
  let children = config.rootPage.options.children || [];
  let currentComponent = config.rootPage;

  // Load passthrough styles
  let configGlobalStyles = config.globalStyles || '';
  let pageGlobalStyles = config.rootPage.options.globalStyles || [];  

  // Read and concat global styles
  for (let style of pageGlobalStyles) {
    let styleContents = await fsExt.quickRead(style);
    configGlobalStyles += styleContents;
  }

  // Read and concat styles
  let builtStyles = await buildComponentStyles(
    currentComponent,
    config.styleTransform
  );

  // Prepend global styles
  builtStyles = configGlobalStyles + builtStyles;

  if (builtStyles.trim().length !== 0) {
    // Create CSS file
    let styleName = `${currentComponent.options.name}.css`;
    let stylePath = path.join(currentComponent.build.directory, styleName);
    let write = await fsExt.quickWrite(stylePath, builtStyles);
    if (!write) throw new Error(`Could not write CSS file ${rootHTMLpath}`);

    // Append tag to HTML
    let styleTag = `<link href="${styleName}" rel="stylesheet">`;
    currentComponent.build.template = currentComponent.build.template.replace(/<\/head>/, `${styleTag}$&`);
  }

  // Build styles
  for (let child of children) {
    let trueComponent = child instanceof Component ? child : child.component;
  
    // Apply to sub children
    await buildStyles({
      ...config,
      rootPage: trueComponent,
      globalStyles: configGlobalStyles
    });
  }
  return;
}

/**
 * Builds styles for a single component
 * @param {Component} component Component to build
 * @param {Function} styleTransform Style transformation function
 */
async function buildComponentStyles(component, styleTransform) {
  
  // Read and concat all styles to memory
  let loadedStyles = await loadComponentStyles(component);  

  // Apply transform
  loadedStyles = await styleTransform(loadedStyles, component.build.directory);

  return loadedStyles;
}

/**
 * Reads and concats all top level styles and imported component styles in order (top level > imports)
 * @param {Component} component Component to load styles from
 */
async function loadComponentStyles(component) {
  let externalStyles = component.options.externalStyles || [];
  
  let loadedStyles = '';

  // Read and concat each top-level stylesheet into memory
  for (let style of externalStyles) {
    let styleContents = await fsExt.quickRead(style);
    loadedStyles += styleContents;
  }

  // Load imported styles
  let importedComponents = component.options.imports || [];
  for (let imported of importedComponents) {
    let trueComponent = imported instanceof Component ? imported : imported.component;

    loadedStyles += await loadComponentStyles(trueComponent);
  }

  return loadedStyles;
}

module.exports = buildStyles;
