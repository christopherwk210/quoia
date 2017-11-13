// Imports
const path = require('path');

/**
 * Component options
 * @typedef {Object} ComponentDescriptor
 * @property {Component} component Component reference
 * @property {any} [values] Object to pass to handlebars
 */ 

/**
 * Component options
 * @typedef {Object} ComponentOptions
 * @property {string} template Path to HTML template for this component
 * @property {string} [selector] Tag name
 * @property {Array<Component|ComponentDescriptor>} [imports] Imported components
 * @property {Array<string>} [externalStyles] CSS files to apply to this component (scoped)
 * @property {Array<string>} [externalScripts] JS files to apply to this component
 * @property {any} [values] Object to pass to handlebars
 * @property {Array<string>} [globalStyles] CSS files to apply to all child pages
 * @property {Array<Component|ComponentDescriptor>} [children] Child pages of this component
 */

/** Component class */
class Component {
  
  /**
   * Define a Quoia Component
   * @param {ComponentOptions} options Component options
   */
  constructor(options) {
    this.options = options;

    // Fix file paths
    this.fixPaths();
  }

  /**
   * Absolutifies all component options
   */
  fixPaths() {

    // Template path
    this.options.template = this.absolutify(this.options.template);

    // Determine path option parameters that need to be fixed
    let pathsToFix = [
      'externalScripts',
      'externalStyles',
      'globalStyles'
    ];

    // Fix 'em
    for (let pathToFix of pathsToFix) {

      // If path(s) provided
      if (this.options[pathToFix]) {
        let fix = [];

        // Absolutify each
        this.options[pathToFix].forEach(path => {
          fix.push( this.absolutify(path) );
        });

        // Reassign
        this.options[papathToFixth] = fix;
      }
    }
  }

  /**
   * Returns an absolute filepath relative to the calling file
   * @param {string} filepath File path
   */
  absolutify(filepath) {
    let callingFilePath = path.dirname( this.getCallerFile() );
    return path.join(callingFilePath, filepath);
  }

  /**
   * Returns absolute path of the calling file
   */
  getCallerFile() {
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
  
}

module.exports = Component;
