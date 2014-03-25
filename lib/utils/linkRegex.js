const _ = require('lodash');

/**
 * RegExp for markdown links
 *
 * @type  {RegExp}
 */

module.exports = new RegExp(_.values({
  open: '(?:\\[)',
  text: '(\\[[^\\]]*\\]|[^\\[\\]]*)',
  middle: '(?:\\]\\([ \\t]*)',
  url: '(<?(?:(?:[^\\(]*?\\([^\\)]*?\\)\\S*?)|(?:.*?))>?)',
  alt: '((?:[ \t]*\"(?:.*?)\"[ \\t]*)?)',
  close: '(?:\\))'
}).join(''), 'g');


// Same as above in a single expression.
var linkRegex = /\[(\[[^\]]*\]|[^\[\]]*)(?:\]\([ \t]*)(<?(?:(?:[^\(]*?\([^\)]*?\)\S*?)|(?:.*?))>?)((?:[ \t]*\"(?:.*?)\"[ \t]*)?)(?:\))/g;
