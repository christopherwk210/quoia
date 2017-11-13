// Imports
const readline = require('readline');

/** Valid terminal color codes */
colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Logs a message to the console
 * @param {string} message Message
 */
function log(message) {
  console.log(message);
}

/**
 * Clears a line of the console relative to the current cursor position
 * @param {number} [position=0] Y position of the cursor relative to its current Y position
 */
log.clearLine = position => {
  position = position || 0;
  readline.moveCursor(process.stdout, 0, position);
  readline.clearLine(process.stdout, 0);
}

// Expose color strings
log.colors = colors;

// Apply colors
for(let prop in colors) {
  if (colors.hasOwnProperty(prop)) {
    log[prop] = (message, line) => {
      if (line !== undefined && typeof line === 'number') {
        log.clearLine(line);
      }

      console.log(`${colors[prop]}%s${colors.reset}`, message);
    };
  }
}

module.exports = log;
