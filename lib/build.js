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
  }
]

/**
 * Builds a Quoia project
 */
async function build(config) {
  // Absolute output path
  config.outDir = absolutify(config.outDir);

  // Start the party!
  log.magenta('Starting Quoia build...');

  // Execute each build step
  for (let step of steps) {
    await step.pre();

    try {
      await step.action(config);      
    } catch(e) {
      log.red(`Failed step '${step.name}': ${e}`);
      process.exit();
    }

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
