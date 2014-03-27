/**
 * RegExp for markdown links
 *
 * @type  {RegExp}
 */

var linkRegExp = exports.linkRegExp = {
  open: '(?:\\[)',
  text: '(\\[[^\\]]*\\]|[^\\[\\]]*)',
  middle: '(?:\\]\\([ \\t]*)',
  url: '(<?(?:(?:[^\\(]*?\\([^\\)]*?\\)\\S*?)|(?:.*?))>?)',
  alt: '((?:[ \\t]*\"(?:.*?)\"[ \\t]*)?)',
  close: '(?:\\))'
};

var vals = Object.keys(linkRegExp).map(function (key) {
  return linkRegExp[key];
});

module.exports = new RegExp(vals.join(''), 'g');