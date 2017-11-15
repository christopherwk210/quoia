// Imports
const path = require('path');

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

    // Stack prep
    Error.prepareStackTrace = (err, stack) => stack;

    // Escape this file calls
    err.stack.shift()
    err.stack.shift()

    // Get caller file
    currentfile = err.stack.shift().getFileName();

    while (err.stack.length) {
      callerfile = err.stack.shift().getFileName();
      
      if (callerfile && currentfile !== callerfile) return callerfile;
    }
  } catch (err) {}
  return undefined;
}

module.exports = absolutify
