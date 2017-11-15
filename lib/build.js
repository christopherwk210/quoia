/**
 * Build options
 * @typedef {Object} BuildConfig
 * @property {string} outDir Output directory
 * @property {Component} rootPage Root website page
 * @property {'handlebars'|'none'} [templatingEngine='none'] Templating engine to use
 * @property {'body'|'head'} [scriptInsertionPosition='body'] Where to insert script tag on a page
 * @property {Function} [scriptTransform] Apply pre-compile transformations (i.e. babel, minification, etc.)
 */

/**
 * Build step
 * @typedef {Object} BuildStep
 * @property {string} name Title of this build step
 * @property {Function} pre Pre-execute function
 * @property {Function} action Build function for this step
 * @property {Function} post Post-execute function
 */

// Node imports
const path = require('path');

// Local imports
const log = require('./utils/log');
const absolutify = require('./utils/absolutify');

// Build steps
const buildSteps = {
  clean: require('./bulid-steps/clean-output'),
  html: require('./bulid-steps/build-html'),
  scripts: require('./bulid-steps/build-scripts'),
  writeHTML: require('./bulid-steps/write-html')
};

/**
 * Build steps
 * @type {Array<BuildStep>}
 */
const steps = [
  {
    name: 'Clean output directory',
    pre: () => log.yellow('Recreating output directory...'),
    action: buildSteps.clean,
    post: () => log.green('✔ Output directory clean', -1)
  },
  {
    name: 'Compile HTML',
    pre: () => log.yellow('Compiling HTML...'),
    action: buildSteps.html,
    post: () => log.green('✔ HTML Compiled', -1)
  },
  {
    name: 'Build scripts',
    pre: () => log.yellow('Building scripts...'),
    action: buildSteps.scripts,
    post: () => log.green('✔ Scripts built', -1)
  },
  {
    name: 'Build styles',
    pre: () => log.yellow('Building styles...'),
    action: () => {},
    post: () => log.green('✔ Styles built', -1)
  },
  {
    name: 'Write HTML',
    pre: () => log.yellow('Writing HTML...'),
    action: buildSteps.writeHTML,
    post: () => log.green('✔ HTML saved', -1)
  },
  {
    name: 'Copy static assets',
    pre: () => log.yellow('Copying assets...'),
    action: () => {},
    post: () => log.green('✔ Assets copied', -1)
  }
]

/**
 * Builds a Quoia project
 * @param {BuildConfig} config
 */
async function build(config) {

  // Absolute output path
  config.outDir = absolutify(config.outDir);

  // Start the party!
  log.magenta('\nStarting Quoia build...');

  // Execute each build step
  for (let step of steps) {
    // Execute pre
    await step.pre();

    // Execute step
    try {
      await step.action(config);      
    } catch(e) {
      log.red(`Failed step '${step.name}': ${e}`);
      process.exit();
    }

    // Execute post
    await step.post();
  }
  
  // Done!
  log.green('✔ Done!');
  return true;
}

module.exports = build;
