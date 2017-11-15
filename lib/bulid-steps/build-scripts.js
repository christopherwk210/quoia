/**
 * Builds all of the scripts for the project
 * @param {BuildConfig} config Build config
 */
async function buildScripts(config) {
  config.scriptInsertionPosition = config.scriptInsertionPosition || 'body';
  config.scriptTransform = config.scriptTransform || (code => code);

  // Build root page scripts
  await buildComponentScripts(config.rootPage);

  // Build sub page scripts


  console.log('\n');
  console.log('\n');
  return;
}

/**
 * Builds scripts for a single component
 * @param {Component} component Component to build
 */
async function buildComponentScripts(component) {
  let externalScripts = component.options.externalScripts;
  if (!externalScripts) return;

  console.log(externalScripts);
}

module.exports = buildScripts;
