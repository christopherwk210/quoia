// Imports
const path = require('path');
const absolutify = require('./utils/absolutify');

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
 * @property {string} name Name of component to be used as path name
 * @property {string} [selector] Tag name
 * @property {Array<Component|ComponentDescriptor>} [imports] Imported components
 * @property {Array<string>} [externalStyles] CSS files to apply to this component (scoped)
 * @property {Array<string>} [externalScripts] JS files to apply to this component
 * @property {any} [values] Object to pass to handlebars
 * @property {Array<string>} [globalStyles] CSS files to apply to this component and all child components
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
    this.options.template = absolutify(this.options.template);

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
        if (this.options[pathToFix]) {
          this.options[pathToFix].forEach(path => {
            fix.push( absolutify(path) );
          });

          // Reassign
          this.options[pathToFix] = fix;
        }
      }
    }
  }
}

module.exports = Component;
