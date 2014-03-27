const path = require('path');
const file = require('fs-utils');
const frep = require('frep');
const log = require('verbalize');
const relative = require('relative');
const request = require('request');

log.runner = 'link-fixer';

const compareFn = require('./utils/compare');
const linkRegex = require('./utils/linkRegex');
const explode = require('./explode');

var isRemoteUrl = function(str) {
  return /https?|:\/\//.test(str);
};

var hasInvalidChar = function(str) {
  return /^['"]|['"]$/.test(str);
};

var emptyURL = function(str) {
  return !str.length;
};

var addMessage = function(str) {
  var msg = '';
  if (hasInvalidChar(str)) {
    msg += 'Invalid chars [remove quotes]';
  }
  if (emptyURL(str)) {
    msg += 'URL is missing';
  }
  return log.verbose.red(' (' + msg + ')');
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
  var filesAsc = compareFn(files, {sortOrder: 'asc'});
  var unmatched = [];
  var badurl = [];


  exploded.files.map(function (options) {
    var content = options.content;
    var dest = options.dest;

    var patterns = [
      {
        pattern: linkRegex,
        replacement: function (match, text, url, alt) {
          alt = alt || '';

          // If it looks like a remote link return the entire match.
          if (isRemoteUrl(url)) {
            var links = {good: [], bad: []};

            // request(url, function (error, response, body) {
            //   if (response) {
            //     var status = response.statusCode;
            //     if (response && response.statusCode == 404) {
            //       links.bad.push(url);
            //       log.verbose.error(url, status);
            //     } else {
            //       links.good.push(url);
            //       log.verbose.success(url, status);
            //     }
            //   } else {
            //     return;
            //   }

            //   return;
            // });

            file.writeJSONSync('test/actual/links.json', links);
            return match;
          }

          // If it looks like a remote link return the entire match.
          if (hasInvalidChar(url)) {
            if (options.strict) {
              throw new Error(log.verbose.error(addMessage(url), match));
            } else {
              unmatched.push(match + addMessage(url));
            }
          }

          // Otherwise, assume it's local and normalize slashes
          url = file.normalizeSlash(path.normalize(url));

          // Split the path, and get the length of the resulting array
          var urlSegments = url.split('/'),
            len = urlSegments.length,
            resolvedUrl;

          // If the array length is greatter than one, then we'll assume
          // that more than a file name was specified in the url, and
          // we'll start looking for matches starting with the _longest_
          // resolved path first
          if (len > 1) {
            for (var i = 0; i < filesAsc.length; i++) {
              resolvedUrl = file.match('**/' + url, filesDesc)[0];
              if(resolvedUrl) {

                log.run('local:original', url);
                log.subhead('local:resolved', relative(dest, resolvedUrl));

                return match.replace(url, relative(dest, resolvedUrl));
              } else {
                unmatched.push(match + addMessage(url));
                return match;
              }
            }

          // Otherwise, assume that only a filename was given, in which
          // case we should start with the shortest resolved path.
          } else if (len = 1) {
            for (var j = 0; j < filesDesc.length; j++) {
              resolvedUrl = file.match('**/' + url, filesAsc)[0];
              if(resolvedUrl) {

                log.run('local:original', url);
                log.subhead('local:resolved', relative(dest, resolvedUrl));

                return match.replace(url, relative(dest, resolvedUrl));
              } else {
                unmatched.push(match + addMessage(url));
                return match;
              }
            }
          }
        }
      }
    ];


    log.verbose.subhead('writing', dest);
    file.writeFileSync(dest, frep.strWithArr(content, patterns));
  });

  log.verbose.warn('  No matches found for\n\n *', unmatched.join('\n * '));

  // Log a success message.
  log.writeln();
  log.success('  link-fixer [done]');
};

