// Imports
const fsExt = require('../utils/fs-ext');

// Cached html
cache = {};

/**
 * Builds all of the HTML for the project
 * @param {BuildConfig} config Build config
 */
async function buildHTML(config) {

  // Build root page
  try {
    let rootHTML = await buildComponentHTML(config.rootPage, config.templatingEngine);
    console.log(rootHTML);
  } catch(e) {
    throw new Error(e);
  }

  // Build sub pages

  return;
}

/**
 * Builds a single HTML component/page
 * @param {Component} component Component to build
 * @param {'handlebars'|'none'} templatingEngine Templating engine to use
 */
async function buildComponentHTML(component, templatingEngine) {

  // Return cached template if available
  if (cache[component.name]) return cache[component.options.name];
  
  // Read template into memory if not cached
  let html = await fsExt.quickRead(component.options.template);
    
  // Ensure the template is valid
  if (html === false) throw new Error(`Could not read ${component.options.template}!`);

  // Run through templating engine
  if (templatingEngine && templatingEngine !== 'none') {
    switch(templatingEngine) {
      case 'handlebars':
        //TODO: run handlebars
        break;
    }
  }

  // Load imported component templates to memory
  let importedComponents = [];
  try {
    importedComponents = await buildImports(component.options.imports);  
  } catch(e) { throw new Error(e) }

  // Replace imported tags
  for (let importedComponent of importedComponents) {
    let tagRegExp = new RegExp(`<(([\s\S]*)${importedComponent.tag}([\s\S]*))>`, 'g');
    html = html.replace(tagRegExp, importedComponent.template);
  }

  // Cache and return template
  cache[component.name] = html;
  return html;
}

/**
 * Cache import templates if needed
 * @param {Array<any>} imports Array of component imports
 */
async function buildImports(imports) {
  if (!imports) return [];

  let importedComponents = [];
  for (let importedComponent of imports) {
    let tag = importedComponent.component.options.selector;

    // Only load the template if it has a selector
    if (tag) {
      // let importedComponentTemplate = await fsExt.quickRead(importedComponent.component.template);
      let importedComponentTemplate = await buildComponentHTML(importedComponent.component);

      // Ensure the template is valid
      if (importedComponentTemplate === false) throw new Error(`Could not read ${importedComponent.component.options.template}!`);

      // Push cached import
      importedComponents.push({
        template: importedComponentTemplate,
        component: importedComponent.component,
        values: importedComponent.values,
        tag: tag
      });
    }
  }

  return importedComponents;
}

module.exports = buildHTML;
