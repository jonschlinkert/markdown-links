var path = require('path');
var file = require('fs-utils');
var relative = require('relative');
var glob = require('globule');
var frep = require('frep');
var log = require('verbalise');
var _ = require('lodash');



// var re = /\[(\[[^\]]*\]|[^\[\]]*)(?:\]\([ \t]*)(<?(?:(?:[^\(]*?\([^\)]*?\)\S*?)|(?:.*?))>?)((?:[ \t]*\"(?:.*?)\"[ \t]*)?)(?:\))/g;
var linkRegex = new RegExp(_.values({
  open:   '(?:\\[)',
  text:   '(\\[[^\\]]*\\]|[^\\[\\]]*)',
  middle: '(?:\\]\\([ \\t]*)',
  url:    '(<?(?:(?:[^\\(]*?\\([^\\)]*?\\)\\S*?)|(?:.*?))>?)',
  alt:    '((?:[ \t]*\"(?:.*?)\"[ \\t]*)?)',
  close:  '(?:\\))'
}).join(''), 'g');

var mapLinks = function (str) {
  var matches = [], i = -1;
  str.replace(linkRegex, function (match, text, url, alt) {
    i++;
    matches.push({
      index: i,
      match: match,
      text: text,
      url: url || '',
      alt: alt || ''
    } || {});
  });

  return matches;
};

var normalizeFiles = function(src, options) {
  options = _.extend({filter: 'isFile', cwd: ''}, options || {});
  return file.expand(src, options).map(function(filepath) {
    return path.resolve(options.cwd, filepath);
  });
};

// var fixLinks = function(src, dest, options) {
//   return normalizeFiles(src, options).filter(function(filepath) {
//     dest = dest || process.cwd();

//     var str = file.readFileSync(filepath);
//     return str.replace(linkRegex, function (match, text, url, alt) {
//       url = path.normalize(url);


//       return file.expand(src, options).filter(function(filepath) {
//         filepath = path.join(options.cwd, filepath);

//         if(file.isMatch('**/' + url, filepath)) {
//           console.log(relative(dest, file.match('**/' + url, filepath)[0]));
//           return relative(dest, file.match('**/' + url, filepath)[0]);
//         }
//       });
//     });
//   });
// };

var str = file.readFileSync('test/links/nested/four.md');

var resolveLinks = function(str, dest) {
  var files = normalizeFiles('**', {cwd: 'test/links'});
  var patterns = [
    {
      pattern: linkRegex,
      replacement: function (match, text, url, alt) {
        url = path.normalize(url);
        var fullpath = file.match('**/' + url, files)[0];
        return match.replace(url, relative(dest, fullpath));
      }
    }
  ];

  console.log(frep.strWithArr(str, patterns));
  return frep.strWithArr(str, patterns);

};

// file.writeFileSync('test/actual/links/links.md', resolveLinks(str, 'test/actual'));

var opts = {
  srcBase: 'test/links',
  destBase: 'test/actual/links'
};



glob.findMapping('**/*.md', opts).map(function(fp) {
  var src = file.readFileSync(fp.src);
  var dest = fp.dest;
  var result = resolveLinks(src, opts.destBase);

  // Write the result
  file.writeFileSync(dest, result);
});


// // console.log(resolveLinks(str));
// resolveLinks(str, 'test/actual');

// var request = require('request');
// request('http://assemble.io', function (err, resp) {
//   if (resp.statusCode === 200) {
//     console.log('exists');
//     return;
//   }
//   console.log('doesn\'t exist');
//   return;
// });

// console.log(fixLinks('**', {cwd: 'test/links'}));
// var foo = fixLinks('**', 'test/actual', {cwd: 'test/links'});


// var normalizeLocalLinks = function(str, options) {
//   options = options || {};

//   return localLinks(str).map(function(link) {
//     link.url = path.normalize(link.url);

//     file.expand('**', options.glob).filter(function(filepath) {
//       filepath = path.resolve(path.join(options.glob.cwd, filepath));

//       if(filepath.indexOf(link.url) !== -1) {
//         link.url = relative(process.cwd(), filepath);
//       }
//     });

//     log.info('>> Writing local link:', link.url);

//     return {
//       text: link.text,
//       url: link.url,
//       alt: link.alt
//     };
//   });
// };



// fixLinks('test/actual/nested.md', '**/*.md', {cwd: 'test/links'});
