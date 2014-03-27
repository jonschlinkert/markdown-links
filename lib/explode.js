const file = require('fs-utils');
const log = require('verbalise');
const relative = require('relative');
const _ = require('lodash');


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
  log.write();
  log.verbose.subhead('expanding', src);

  var filesObj = _.extend(opts, {
    files: [],
    srcFiles: [],
    destFiles: []
  });

  file.expandMapping(src, opts).map(function(fp) {
    filesObj.destFiles.push(fp.dest);

    fp.src.map(function(filepath) {
      filesObj.srcFiles.push(filepath);
      log.verbose.run('exploding', relative(process.cwd(), filepath));

      filesObj.files.push({
        src: filepath,
        dest: fp.dest,
        content: file.readFileSync(filepath)
      });

    });
  });

  return filesObj;
};