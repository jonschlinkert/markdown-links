const argv = require('minimist')(process.argv.slice(2));
const log = require('verbalize');
const resolveLinks = require('./lib/resolve');

// `verbalize` settings
log.runner = 'link-fixer';
log.mode.verbose = argv.v || argv.verbose || false;


function fixLinks(dir, dest) {
  resolveLinks(['**/*.md'], dest, {cwd: dir});
}


fixLinks('test/fixtures/links', 'test/actual/links/');
fixLinks('test/fixtures/docs', 'test/actual/docs/');
fixLinks('test/fixtures/nested', 'test/actual/nested/');