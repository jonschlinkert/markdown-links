const fs = require('fs');
const path = require('path');

const file = require('fs-utils');
const frep = require('frep');
const glob = require('globule');
const log = require('verbalise');
const relative = require('relative');
const _ = require('lodash');


// var re = /\[(\[[^\]]*\]|[^\[\]]*)(?:\]\([ \t]*)(<?(?:(?:[^\(]*?\([^\)]*?\)\S*?)|(?:.*?))>?)((?:[ \t]*\"(?:.*?)\"[ \t]*)?)(?:\))/g;
var linkRegex = new RegExp(_.values({
  open:   '(?:\\[)',
  text:   '(\\[[^\\]]*\\]|[^\\[\\]]*)',
  middle: '(?:\\]\\([ \\t]*)',
  url:    '(<?(?:(?:[^\\(]*?\\([^\\)]*?\\)\\S*?)|(?:.*?))>?)',
  alt:    '((?:[ \t]*\"(?:.*?)\"[ \\t]*)?)',
  close:  '(?:\\))'
}).join(''), 'g');

var normalizeFiles = function(src, options) {
  options = _.extend({filter: 'isFile', cwd: ''}, options || {});
  return file.expand(src, options).map(function(filepath) {
    return relative(options.cwd, filepath);
  });
};


var compare = function(arr) {
  return arr.sort(function (a, b) {
    return a.split('/').length - b.split('/').length;
  });
};

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

var lookupFiles = function(dir, order) {
  order = order || 'asc';
  var files = [];

  var stat = fs.statSync(dir);
  if (stat.isFile()) {
    return dir;
  }

  fs.readdirSync(dir).forEach(function (filepath) {
    filepath = path.resolve(path.join(dir, filepath));
    var stat = fs.statSync(filepath);

    if (stat.isDirectory()) {
      files = files.concat(lookupFiles(filepath));
      return;
    }
    if (!stat.isFile()) {
      return;
    }

    files.push(relative(process.cwd(), filepath));
  });

  files = compareFn(files, {sortOrder: order});
  return files;
};


var matches = function(cwd, patterns) {
  var files = lookupFiles(cwd);
  var positive = [];

  log.info('\n');
  // log.success('  [files]\t', files);

  for (var i = 0; i < patterns.length; i++) {
    for (var j = 0; j < files.length; j++) {
      patterns[i] = patterns[i].replace(/\\/g, '/');
      log.warn('  [pattern]\t', patterns[i]);

      if (new RegExp(patterns[i] + '$', 'g').test(files[j])) {
        positive.push(files[j]);
      }
    }
  }

  // log.bold('  [match]\t', positive);
  return positive;
};

// console.log(new RegExp('nested/two.md' + '$', 'g').test('links/two.md'));
// var files = exports.lookupFiles('test/links');
// var results = exports.matches(files, ['three.md', 'four.md', 'nested/two.md']);
// console.log(results);


var resolveLinks = function(cwd, src, dest) {
  var str = file.readFileSync(src);

  var patterns = [
    {
      // Find links
      pattern: linkRegex,
      replacement: function (match, text, url, alt) {
        // Normalize the url before attempting to match
        url = path.normalize(url);
        var filepath = matches(cwd, [url])[0];

        log.verbose.success('  [source]\t', file.name(src));
        log.verbose.bold('  [dest]\t', dest);
        log.verbose.warn('  [paths]\t', filepath[0]);

        return match.replace(url, relative(dest, String(filepath)));
      }
    }
  ];
  return frep.strWithArr(str, patterns);
};


var opts = {
  srcBase: 'test/links',
  destBase: 'test/actual/links'
};

function buildLinks(patterns) {
  var concatenated = [];
  log.info();

  glob.findMapping(patterns, opts).map(function(fp) {
    var dest = fp.dest, result;

    fp.src.map(function(filepath) {
      log.verbose.bold('  [reading] ', filepath);
      result = resolveLinks(opts.srcBase, filepath, fp.dest);
      concatenated.push(filepath);

      // Write the result
      file.writeFileSync(dest, result);
      log.verbose.success('  [writing] ', fp.dest);
    })
  });

  // var result = concatenated.map(function(filepath) {
  //   return resolveLinks(filepath, './');
  // }).join('\n\n');

  // log.verbose.success('  [writing] ', 'README.md');
  // file.writeFileSync('README.md', result);
}

buildLinks('**/*.md');
