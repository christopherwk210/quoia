// Imports
const fsExt = require('../utils/fs-ext');
const path = require('path');
const Component = require('../component');

// Preprocessor
let sass;
try {
  sass = require('node-sass');
} catch(e) {}

/**
 * Builds all of the styles for the project
 * @param {BuildConfig} config Build config
 */
async function buildStyles(config) {
  config.styleTransform = config.styleTransform || (code => code);
  config.cssPreprocessor = config.cssPreprocessor || 'none';
  config.cssIncludePaths = config.cssIncludePaths || [];

  let children = config.rootPage.options.children || [];
  let currentComponent = config.rootPage;

  // Load passthrough styles
  let configGlobalStyles = config.globalStyles || '';
  let pageGlobalStyles = config.rootPage.options.globalStyles || [];  

  // Read and concat global styles
  for (let style of pageGlobalStyles) {
    try {
      let styleContents = await fsExt.quickRead(style);      
    } catch(e) {
      throw new Error(e);
    }

    if (config.cssPreprocessor === 'sass') {
      styleContents = await compileSass(styleContents, config.cssIncludePaths);      
    }

    configGlobalStyles += styleContents;
  }

  // Read and concat styles
  let builtStyles = await buildComponentStyles(currentComponent, config.cssPreprocessor, config.cssIncludePaths);

  // Prepend global styles
  builtStyles = configGlobalStyles + builtStyles;

  // Apply transform
  builtStyles = await config.styleTransform(builtStyles, currentComponent.build.directory);

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
 * @param {string} preprocessor CSS preprocessor
 * @param {Array<string>} includePaths Paths to include in preprocessor search
 */
async function buildComponentStyles(component, preprocessor, includePaths) {
  
  // Read and concat all styles to memory
  let loadedStyles = await loadComponentStyles(component, preprocessor, includePaths);

  return loadedStyles;
}

/**
 * Reads and concats all top level styles and imported component styles in order (top level > imports)
 * @param {Component} component Component to load styles from
 * @param {string} preprocessor CSS preprocessor
 * @param {Array<string>} includePaths Paths to include in preprocessor search
 */
async function loadComponentStyles(component, preprocessor, includePaths) {
  // Full selector match
  //let cssSelectorRegEx = /(((\w+)|(\.\w+)|(\#\w+)|\*)(\[(.+(=".+"|\*".+"|\^".+"|))\])?(::|:)?\s*(,|<|>| |\+|~|-|)?\s*){1,}\{/gm;

  // Individual CSS items
  let cssSelectorRegEx = /(((\w+)|(\.\w+)|(\#\w+)|\*)(\[(.+(=".+"|\*".+"|\^".+"|))\])?(::|:)?)+(?=[ \S]*\{)/gm;
  let externalStyles = component.options.externalStyles || [];
  let loadedStyles = '';

  // Read and concat each top-level stylesheet into memory
  for (let style of externalStyles) {
    try {
      let styleContents = await fsExt.quickRead(style);      
    } catch(e) {
      throw new Error(e);
    }

    loadedStyles += styleContents;
  }

  // Compile preprocessor if needed
  if (preprocessor && preprocessor === 'sass') {
    try {
      loadedStyles = await compileSass(loadedStyles, includePaths);    
    } catch(e) {
      throw new Error(e);
    }
  }

  // Prepend styles with component ID
  let componentClass = `.-q${component.build.id}`;
  loadedStyles = loadedStyles.replace(cssSelectorRegEx, match => {
    let psuedoPos = match.indexOf(':');
    if (~psuedoPos) {
      return `${match.substring(0, psuedoPos)}${componentClass}${match.substring(psuedoPos, match.length)}`;
    } else {
      return `${match}${componentClass}`;
    }
  });

  // Load imported styles
  let importedComponents = component.options.imports || [];
  for (let imported of importedComponents) {
    let trueComponent = imported instanceof Component ? imported : imported.component;

    // Only load styles if the import has a selector to begin with
    if (trueComponent.options.selector) {
      let importedStyles = await loadComponentStyles(trueComponent, preprocessor, includePaths);
      
      loadedStyles += importedStyles;
    }
  }

  return loadedStyles;
}

/**
 * Compiles sass styles
 * @param {string} styles Styles to compile
 * @param {Array<string>} includePaths Paths to include in search
 */
async function compileSass(styles, includePaths) {
  if (!sass || !styles || styles.length === 0) return styles;

  return new Promise((resolve, reject) => {
    sass.render({
      data: styles,
      includePaths: includePaths
    }, (err, result) => {
      if (err) reject(err);

      resolve(result.css.toString());
    });
  });
}

module.exports = buildStyles;
