/**
 * Generates a random UUID
 * @param {number} [a] 
 */
function uuid(a) {
  return a ? (a ^ Math.random() * 16 >> a/4).toString(16) : ([1e8] +- 1e4 +- 4e4 +- 4e4 +- 1e12).replace(/[018]/g, uuid);
}

/**
 * Generates a unique short ID
 * @param {number} [a]
 */
function shortID(a) {
  return a ? (a ^ Math.random() * 16 >> a/4).toString(16) : ([1e8] +- 1e8).replace(/[018]/g, shortID)
}

module.exports.uuid = uuid;
module.exports.shortID = shortID;
