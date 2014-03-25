var path = require('path');
var file = require('fs-utils');
var template = require('template');
var relative = require('relative');
var log = require('verbalise');
var _ = require('lodash');

var tmpl = '* [<%= text %>](<%= url %><%= alt %>)';


var mapLinkReference = function (str) {
  var matches = [], i = -1;
  var re =  /\[((?:[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)(\])/g;
  str.replace(re, function (match, text, url) {
    i++;
    matches.push({
      index: i,
      match: match,
      text: text,
      url: url || ''
    } || {});
  });
  return matches;
};

var mapReference = function (str) {
  var matches = [], i = -1;
  var re = /^[ ]{0,3}\[([^\]]+)\]:\s*([^ ]+)(\s*(?:[\"][^\"]+[\"])?(\s*))$/gm;
  // var re = /^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*)\3|\((.*?)\)))?\n?/gm; // $1 $2 $4
  str.replace(re, function (match, text, url, alt) {
    i++;
    matches.push({
      index: i,
      match: match,
      text: text,
      url: url,
      alt: clean(alt) || ''
    } || {});
  });
  return matches;
};


var normalizeReferences = function(str, options) {
  options = options || {};

  return mapLinkReference(str).map(function(link) {
    link.url = path.normalize(link.url);

    file.expand('**', options.glob).filter(function(filepath) {
      filepath = path.resolve(path.join(options.glob.cwd, filepath));

      if(filepath.indexOf(link.url) !== -1) {
        link.url = relative(process.cwd(), filepath);
      }
    });

    log.info('>> Writing local link:', link.url);

    return {
      text: link.text,
      url: link.url,
      alt: link.alt
    };
  });
};

var writeReferences = function(dest, src, options) {
  options = options || {};
  options.cwd = options.cwd || process.cwd();
  options.tmpl = options.tmpl || tmpl;

  var result = file.expand(src, options).map(function(filepath) {
    filepath = relative(process.cwd(), path.join(options.cwd, filepath));

    var content = file.readFileSync(filepath);
    log.success('\n>> Reading:', filepath);

    var links = [];
    var opts = {
      resolve: true,
      glob: {
        cwd: path.join(process.cwd(), options.cwd),
        matchBase: true
      }
    };

    links.push(normalizeReferences(content, opts));

    return _.flatten(links).map(function(obj) {
      obj.url = relative(dest, obj.url);
      return template(tmpl, obj);
    }).join('\n');
  }).join('\n');

  file.writeFileSync(dest, result);
};

writeReferences('test/actual/nested.md', '**/*.md', {cwd: 'test/links'});
