var fs = require('fs');
var path = require('path');
var relative = require('relative');

exports.compare = function(arr) {
  return arr.sort(function (a, b) {
    return b.split('/').length - a.split('/').length;
  });
};

var compareFn = function (arr, options) {
  var opts = _.extend({
    sortOrder: 'asc'
  }, options);

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


exports.matches = function(files, patterns) {
  var positive = [];

  for (var i = 0; i < patterns.length; i++) {
    for (var j = 0; j < files.length; j++) {
      if (new RegExp(patterns[i] + '$', 'g').test(files[j])) {
        positive.push(files[j]);
      }
    }
  }
  return positive;
};

// console.log(new RegExp('nested/two.md' + '$', 'g').test('links/two.md'));
// var files = exports.lookupFiles('test/links');
// var results = exports.matches(files, ['three.md', 'four.md', 'nested/two.md']);
// console.log(results);