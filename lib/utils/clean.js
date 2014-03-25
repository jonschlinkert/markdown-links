/**
 * Sanitize paths
 *
 * @param   {String}  str
 * @return  {String}
 */

module.exports = function(str) {
  return str.replace(/^\s*"?|"?\s*$/g, '');
};