var file = require('fs-utils');
var log = require('verbalise');
var relative = require('relative');
var _ = require('lodash');


log.runner = 'link-builder';


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


var explode = module.exports = function(src, dest, options) {
  options = options || {};

  var opts = _.defaults(options, {
    sep: options.sep || '\n',
    cwd: options.cwd || process.cwd(),
    ext: options.ext || '.md',
    destBase: dest
  });

  opts.srcBase = opts.cwd;

  // Log the start.
  log.write();
  log.subhead('expanding', src);

  var filesObj = _.extend(opts, {
    files: [],
    srcFiles: [],
    destFiles: []
  });

  file.expandMapping(src, opts).map(function(fp) {
    filesObj.destFiles.push(fp.dest);

    fp.src.map(function(filepath) {
      filesObj.srcFiles.push(filepath);
      log.run('exploding', relative(process.cwd(), filepath));

      filesObj.files.push({
        src: filepath,
        dest: fp.dest,
        content: file.readFileSync(filepath)
      });

    });
  });

  return filesObj;
};