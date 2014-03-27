const path = require('path');
const file = require('fs-utils');
const log = require('verbalize');
const cwd = require('cwd');
const relative = require('relative');
const _ = require('lodash');

log.runner = 'link-fixer';

module.exports = function(src, dest, options) {
  options = options || {};

  var opts = _.defaults(options, {
    sep: options.sep || '\n',
    cwd: options.cwd || process.cwd(),
    ext: options.ext || '.md',
    destBase: dest
  });

  opts.srcBase = opts.cwd;

  // Log the start.
  var resolved = cwd(opts.srcBase, String(src));
  log.subhead('expanding', relative(process.cwd(), resolved));
  log.writeln();

  var filesObj = _.extend(opts, {
    files: [],
    srcFiles: [],
    destFiles: []
  });

  file.expandMapping(src, opts).map(function(fp) {
    filesObj.destFiles.push(fp.dest);

    fp.src.map(function(filepath) {
      filesObj.srcFiles.push(filepath);
      log.verbose.run('scanning', relative(process.cwd(), filepath));

      filesObj.files.push({
        src: filepath,
        dest: fp.dest,
        content: file.readFileSync(filepath)
      });

    });
  });

  return filesObj;
};