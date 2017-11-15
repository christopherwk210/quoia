// Imports
const fsExt = require('../utils/fs-ext');
const path = require('path');
const Component = require('../component');

// Templating
let Handlebars;
try {
  Handlebars = require('handlebars');
} catch(e) {}

// Cached html
cache = {};

/**
 * Builds all of the HTML for the project
 * @param {BuildConfig} config Build config
 */
async function buildHTML(config) {

  // Save output path to component
  config.rootPage.build.directory = config.outDir;

  // Build root page
  let rootHTML = '';
  try {
    rootHTML = await buildComponentHTML(config.rootPage, config.templatingEngine);
  } catch(e) {
    throw new Error(e);
  }

  // Create output directory if it doesn't exist
  let freshDirectoryResults = await fsExt.mkdirFresh(config.outDir);
  if (!freshDirectoryResults) throw new Error(`Could not create directory ${config.outDir}`);

  // Save compiled template to component
  config.rootPage.build.template = rootHTML;

  // Build sub pages
  if (config.rootPage.options.children) {
    for (let child of config.rootPage.options.children) {
      if (child instanceof Component) {
        trueChild = child;
      } else {
        trueChild = child.component;
        trueChild.options.values = child.values || trueChild.options.values;
      }
  
      // Build current sub page page
      try {
        await buildHTML({
          rootPage: trueChild,
          outDir: path.join(config.outDir, trueChild.options.name),
          templatingEngine: config.templatingEngine
        });
      } catch(e) { throw new Error(e) }
    }
  }

  return;
}

/**
 * Builds a single HTML component/page
 * @param {Component} component Component to build
 * @param {'handlebars'|'none'} templatingEngine Templating engine to use
 */
async function buildComponentHTML(component, templatingEngine) {
  // Return cached template if available
  if (cache[component.options.name]) return cache[component.options.name];
  
  // Read template into memory if not cached
  let html = await fsExt.quickRead(component.options.template);
    
  // Ensure the template is valid
  if (html === false) throw new Error(`Could not read ${component.options.template}!`);

  // Run through templating engine
  if (templatingEngine && templatingEngine !== 'none') {
    switch(templatingEngine) {
      case 'handlebars':
        html = compileHandlebars(html, component.options.values);
        break;
    }
  }

  // Load imported component templates to memory
  let importedComponents = [];
  try {
    importedComponents = await buildImports(component.options.imports, templatingEngine);  
  } catch(e) { throw new Error(e) }

  // Replace imported tags
  for (let importedComponent of importedComponents) {
    let tagRegExp = new RegExp(`<(([\s\S]*)${importedComponent.tag}([\s\S]*))>`, 'g');
    html = html.replace(tagRegExp, importedComponent.template);
  }

  // Cache and return template
  cache[component.options.name] = html;
  return html;
}

/**
 * Cache import templates if needed
 * @param {Array<any>} imports Array of component imports
 * @param {'handlebars'|'none'} templatingEngine Templating engine to use
 */
async function buildImports(imports, templatingEngine) {
  if (!imports) return [];

  let importedComponents = [];
  for (let importedComponent of imports) {

    // Resolve proper component and values
    let trueImport, values = {};
    if (importedComponent instanceof Component) {
      trueImport = importedComponent;
      values = importedComponent.options.values;
    } else {
      trueImport = importedComponent.component;
      values = importedComponent.values || trueImport.options.values;
    }

    // Get component selector
    let tag = trueImport.options.selector;

    // Only load the template if it has a selector
    if (tag) {
      let importedComponentTemplate = await buildComponentHTML(trueImport, templatingEngine);

      // Ensure the template is valid
      if (importedComponentTemplate === false) throw new Error(`Could not read ${trueImport.options.template}!`);

      // Run through templating engine
      if (templatingEngine && templatingEngine !== 'none' && trueImport.options.values) {
        switch(templatingEngine) {
          case 'handlebars':
            importedComponentTemplate = compileHandlebars(importedComponentTemplate, values);
            break;
        }
      }

      // Push cached import
      importedComponents.push({
        template: importedComponentTemplate,
        component: trueImport,
        values: values,
        tag: tag
      });
    }
  }

  return importedComponents;
}

/**
 * Compiles a template with Handlebars
 * @param {string} template HTML string
 * @param {any} values Handlebars values
 */
function compileHandlebars(template, values) {
  if (!Handlebars) return template;
  values = values || {};

  // Compile template
  let compiled = Handlebars.compile(template);
  let result = compiled(values);

  return result;
}

module.exports = buildHTML;
