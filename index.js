const log = require('verbalise');
log.runner = 'link-builder';

var resolveLinks = require('./lib/resolve');


function fixLinks(dir, dest) {
  resolveLinks(['**/*.md'], dest, {cwd: dir});
}


fixLinks('test/fixtures/links', 'test/actual/links/');
fixLinks('test/fixtures/docs', 'test/actual/docs/');
fixLinks('test/fixtures/nested', 'test/actual/nested/');