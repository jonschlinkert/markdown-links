const log = require('verbalise');
log.runner = 'link-builder';

var resolveLinks = require('./lib/resolve');

var opts = {
  src: ['**/*.md'],
  dest: 'test/actual',
  glob: {cwd: 'test/links'}
};


resolveLinks(opts.src, opts.dest, opts.glob);