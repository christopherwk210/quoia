/**
 * Build options
 * @typedef {Object} BuildConfig
 * @property {string} outDir Output directory
 * @property {Component} rootPage Root website page
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

/**
 * Build steps
 * @type {Array<BuildStep>}
 */
const steps = [
  {
    name: 'Clean output directory',
    pre: () => log.yellow('Recreating output directory...'),
    action: require('./bulid-steps/clean-output'),
    post: () => log.green('✔ Output directory clean', -1)
  },
  {
    name: 'Build HTML',
    pre: () => log.yellow('Building HTML...'),
    action: () => {},
    post: () => log.green('✔ HTML built', -1)
  },
  {
    name: 'Build scripts',
    pre: () => log.yellow('Building scripts...'),
    action: () => {},
    post: () => log.green('✔ Scripts built', -1)
  },
  {
    name: 'Build styles',
    pre: () => log.yellow('Building styles...'),
    action: () => {},
    post: () => log.green('✔ Styles built', -1)
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
}

/**
 * Returns an absolute filepath relative to the calling file
 * @param {string} filepath File path
 */
function absolutify(filepath) {
  let callingFilePath = path.dirname( getCallerFile() );
  return path.join(callingFilePath, filepath);
}

/**
 * Returns absolute path of the calling file
 */
function getCallerFile() {
  try {
    let err = new Error();
    let callerfile;
    let currentfile;

    Error.prepareStackTrace = (err, stack) => stack;

    currentfile = err.stack.shift().getFileName();

    while (err.stack.length) {
      callerfile = err.stack.shift().getFileName();

      if (currentfile !== callerfile) return callerfile;
    }
  } catch (err) {}
  return undefined;
}

module.exports = build;
