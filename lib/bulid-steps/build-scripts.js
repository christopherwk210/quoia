// Imports
const fsExt = require('../utils/fs-ext');
const path = require('path');
const Component = require('../component');

/**
 * Builds all of the scripts for the project
 * @param {BuildConfig} config Build config
 */
async function buildScripts(config) {
  config.scriptInsertionPosition = config.scriptInsertionPosition || 'body';
  config.scriptTransform = config.scriptTransform || (code => code);
  let children = config.rootPage.options.children || [];
  let currentComponent = config.rootPage;

  // Load passthrough scripts
  let configGlobalScripts = config.globalScripts || '';
  let pageGlobalScripts = config.rootPage.options.globalScripts || [];  

  // Read and concat global scripts
  for (let script of pageGlobalScripts) {
    let scriptsContents = await fsExt.quickRead(script);
    configGlobalScripts += scriptsContents;
  }
  
  // Read and concat scripts
  let builtScript = await buildComponentScripts(
    currentComponent,
    config.scriptTransform
  );

  // Prepend global scripts
  builtScript = configGlobalScripts + builtScript;

  if (builtScript.trim().length !== 0) {
    // Create script file
    let scriptName = `${currentComponent.options.name}.js`;
    let scriptPath = path.join(currentComponent.build.directory, scriptName);
    let write = await fsExt.quickWrite(scriptPath, builtScript);
    if (!write) throw new Error(`Could not write script file ${rootHTMLpath}`);

    // Append script tag to html
    let match;
    switch(config.scriptInsertionPosition) {
      case 'body':
        match = /<\/body>/;
        break;
      case 'head':
        match = /<\/head>/;
        break;
    }

    let scriptTag = `<script src="${scriptName}"></script>`;
    currentComponent.build.template = currentComponent.build.template.replace(match, `${scriptTag}$&`);
  }

  // Build scripts
  for (let child of children) {
    let trueComponent = child instanceof Component ? child : child.component;
  
    // Apply to sub children
    await buildScripts({
      ...config,
      rootPage: trueComponent,
      globalScripts: configGlobalScripts
    });
  }
  return;
}

/**
 * Builds scripts for a single component
 * @param {Component} component Component to build
 * @param {Function} scriptTransform Script transformation function
 */
async function buildComponentScripts(component, scriptTransform) {

  // Read and concat all scripts to memory
  let loadedScripts = await loadComponentScripts(component);  

  // Apply transform
  loadedScripts = await scriptTransform(loadedScripts, component.build.directory);

  return loadedScripts;
}

/**
 * Reads and concats all top level scripts and imported component scripts in order (top level > imports)
 * @param {Component} component Component to load scripts from
 */
async function loadComponentScripts(component) {
  let externalScripts = component.options.externalScripts || [];
  
  let loadedScripts = '';

  // Read and concat each top-level script into memory
  for (let script of externalScripts) {
    let scriptContents = await fsExt.quickRead(script);
    loadedScripts += scriptContents;
  }

  // Load imported scripts
  let importedComponents = component.options.imports || [];
  for (let imported of importedComponents) {
    let trueComponent = imported instanceof Component ? imported : imported.component;

    loadedScripts += await loadComponentScripts(trueComponent);
  }

  return loadedScripts;
}

module.exports = buildScripts;
