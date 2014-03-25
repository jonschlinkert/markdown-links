const fs = require('fs');
const path = require('path');

const file = require('fs-utils');
const frep = require('frep');
const glob = require('globule');
const log = require('verbalise');
const relative = require('relative');
const _ = require('lodash');


var explode = require('./explode');


var compareFn = function (arr, options) {
  var opts = _.extend({sortOrder: 'asc'}, options);
  var sortOrder = opts.sortOrder.toLowerCase();

  return arr.sort(function (a, b) {
    a = a.split('/').length;
    b = b.split('/').length;

    var result = a > b ? 1 : a < b ? -1 : 0;

    if (sortOrder === 'desc') {
      return result * -1;
    }

    return result;
  });
};

var linkRegex = new RegExp(_.values({
  open: '(?:\\[)',
  text: '(\\[[^\\]]*\\]|[^\\[\\]]*)',
  middle: '(?:\\]\\([ \\t]*)',
  url: '(<?(?:(?:[^\\(]*?\\([^\\)]*?\\)\\S*?)|(?:.*?))>?)',
  alt: '((?:[ \t]*\"(?:.*?)\"[ \\t]*)?)',
  close: '(?:\\))'
}).join(''), 'g');

var compareFn = function(arr, options) {
  var opts = _.extend({sortOrder: 'asc'}, options);
  var sortOrder = opts.sortOrder.toLowerCase();

  return arr.sort(function (a, b) {
    a = a.split('/').length;
    b = b.split('/').length;

    var result = a > b ? 1 : a < b ? -1 : 0;

    if(sortOrder === 'desc') {
      return result * -1;
    }

    return result;
  });
};

/**
 * This is just silly
 */

module.exports = function(src, dest, opts) {
  var exploded = explode(src, dest, opts);
  var exploded2 = explode(src, dest, opts);

  var files = exploded.destFiles;
  var files2 = exploded2.destFiles;

  var filesDesc = compareFn(files, {sortOrder: 'desc'});
  var filesAsc = compareFn(files2, {sortOrder: 'asc'});

  exploded.files.map(function (options) {
    var content = options.content;
    var dest = options.dest;

    var patterns = [
      {
        pattern: linkRegex,
        replacement: function (match, text, url, alt) {
          url = file.normalizeSlash(path.normalize(url));
          var urlSegments = url.split('/'),
            len = urlSegments.length;

          // If only a file name was specified in the url, assume
          // that we should start with the shortest resolved path
          if (len > 1) {
            for (var i = 0; i < filesAsc.length; i++) {
              var foo = file.match('**/' + url, filesDesc)[0];
              if(foo) {
                return match.replace(url, relative(dest, foo));
              }
            }

          // Otherwise, start with the longest resolved path.
          } else {
            for (var j = 0; j < filesDesc.length; j++) {
              var bar = file.match('**/' + url, filesAsc)[0];
              if(bar) {
                return match.replace(url, relative(dest, bar));
              }
            }
          }


        }
      }
    ];

    log.subhead('writing', dest);
    file.writeFileSync(dest, frep.strWithArr(content, patterns));
  });
}

// Log a success message.
log.info();
log.success('  link-builder [done]');
