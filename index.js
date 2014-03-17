var path = require('path');
var file = require('fs-utils');
var marked = require('marked');
var template = require('template');
var relative = require('relative');
var log = require('verbalise');
var _ = require('lodash');

var fixture = file.readFileSync('test/fixtures/Helpers.md');
var fixture2 = file.readFileSync('test/fixtures/Underscore-Mixins.md');
var fixture3 = file.readFileSync('test/fixtures/Custom-Helpers.md');

var clean = function(str) {
  return str.replace(/^\s*"?|"?\s*$/g, '');
};

var tokenize = function(str) {
  return marked.lexer(str);
};

// console.log(tokenize(fixture));
// file.writeJSONSync('tokens.json', tokenize(fixture));

var links = function(str) {
  var tokens = tokenize(str);
  var arr = [];
  arr.push(tokens.links);
  return _.unique(arr).sort();
};
// console.log(links(fixture));


var types = function(str) {
  var tokens = tokenize(str);
  var arr = [];
  tokens.forEach(function(token) {
    arr.push(token.type);
  })
  return _.unique(arr).sort();
};
// console.log(types(fixture));


/**
 * Search tokens
 */

var searchTokens = function(haystack, needle) {
  var tokens = tokenize(haystack);
  var arr = [];

  tokens.forEach(function(token) {
    if(!!~token.type.search(needle)) {
      arr.push(token);
    }
  });
  return arr;
};
// console.log(searchTokens(fixture));

/**
 * Check to see if a string has one of the
 * marked types
 */

var hasType = function(type) {
  return searchTokens(type).length !== -1;
};
// console.log(hasType('links'));

/**
 * Types
 */

// var blockquotes = searchTokens(fixture, 'block');
// var code        = searchTokens(fixture, 'code');
// var headings    = searchTokens(fixture, 'head');
// var html        = searchTokens(fixture, 'html');
// var list        = searchTokens(fixture, 'list');
// var paragraph   = searchTokens(fixture, 'paragraph');
// var table       = searchTokens(fixture, 'table');
// var text        = searchTokens(fixture, 'text');


/**
 * Example for heading text
 */

var headingText = function(fn) {
  fn = fn || function(str) { return str; }
  var str = [];

  // Types: Headings
  headings.forEach(function(heading) {
    str.push(fn(heading.text));
  });
  return str.join('\n');
};

function upper(str) {
  return str.toUpperCase();
}

// console.log(headingText(upper));

var findLinks = function(str) {
  var re = /\[([^\[]+)\]\(([^\)]+)\)/g;
  return str.match(re);
};
// console.log(findLinks(fixture));
// file.writeJSONSync('findLinks.json', findLinks(fixture));


// Get href links, not images or other links
var matchLink = function(str) {
  var re = /[^\[!\[]\[([^\[]+)\]\(([^\)]+)\)/g;
  return str.match(re).map(function(link, i) {
    return link.replace(/^\s+|\s+$/, '');
  });
};

// matchLink(fixture);
// file.writeJSONSync('matchLink.json', matchLink(fixture));

var isLocalLink = function(str) {
  return matchLink(str).map(function(link) {
    return !~link.search('\\]\\(http');
  });
};

var isPageLink = function(str) {
  return isMatch('\\]\\(#', str);
};

var isRemoteLink = function(str) {
  return matchLink(str).map(function(link) {
    return !!~link.search('http');
  });
};

/**
 * Find links. Supports text and URL only, not alt.
 * @param   {[type]}  str  [description]
 * @return  {[type]}       [description]
 */

var links = function (str) {
  var matches = [], i = -1;
  var re = /\[([^\[]+)\]\(([^\)]+)\)/g;
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
// console.log(links(fixture3));


/**
 * Find links. Supports text, URL and alt.
 *
 * @param   {[type]}  str  [description]
 * @return  {[type]}       [description]
 */

var mapLinks = function (str) {
  var matches = [], i = -1;

  // var re = /\[(\[[^\]]*\]|[^\[\]]*)(?:\]\([ \t]*)(<?(?:(?:[^\(]*?\([^\)]*?\)\S*?)|(?:.*?))>?)((?:[ \t]*\"(?:.*?)\"[ \t]*)?)(?:\))/g;
  var reobj = {
    open:   '(?:\\[)',
    text:   '(\\[[^\\]]*\\]|[^\\[\\]]*)',
    middle: '(?:\\]\\([ \\t]*)',
    url:    '(<?(?:(?:[^\\(]*?\\([^\\)]*?\\)\\S*?)|(?:.*?))>?)',
    alt:    '((?:[ \t]*\"(?:.*?)\"[ \\t]*)?)',
    close:  '(?:\\))'
  };
  var re = new RegExp(_.values(reobj).join(''), 'g');

  str.replace(re, function (match, text, url, alt) {
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
// console.log(mapLinks(fixture3));

var localLinks = function(str) {
  var matches = [];
  mapLinks(str).map(function(link) {
    if(!~link.url.search('//')) {
      matches.push(link);
    }
  });
  return matches;
};
// console.log(localLinks(fixture3));

var externalLinks = function(str) {
  var matches = [];
  mapLinks(str).map(function(link) {
    if(!!~link.url.search('//')) {
      matches.push(link);
    }
  });
  return matches;
};
// console.log(externalLinks(fixture3));

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
// console.log(mapLinkReference(fixture2));

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
// console.log(mapReference(fixture2));

var code = function (str) {
  var matches = [], i = -1;

  // Need tests
  // var re =  /(`+)([^\r|\n]*?[^`])(\1)/g;
  // var re =  /(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/gm;
  var re =  /(`+)(.+?[^`])\1(?!`)/gm;
  str.replace(re, function (match, first, code) {
    i++;
    matches.push({
      index: i,
      match: match,
      code: code
    } || {});
  });
  return matches;
};
// console.log(code(fixture));

var codeBlock = function (str) {
  var matches = [];
  var re =  /^\s*(`{3}|~{3})\s*(\S+)?\s*([\s\S]+?)\s*\1\s*(?:\n+|$)/gm;
  var i = -1;
  str.replace(re, function (match, first, lang, code) {
    i++;
    matches.push({
      index: i,
      match: clean(match),
      lang: lang,
      code: code
    } || {});
  });
  return matches;
};

// console.log(codeBlock(fixture));
// console.log(codeBlock(fixture2));


var normalizeLocalLinks = function(str, options) {
  options = options || {};

  return localLinks(str).map(function(link) {
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


var writeExternalLinks = function(str) {
  var tmpl = '* [<%= text %>](<%= url %><%= alt %>)';

  return externalLinks(str).map(function(link) {
    log.success('>> Writing link:', link.url);

    return template(tmpl, {
      text: link.text,
      url: link.url,
      alt: link.alt
    });
  }).join('\n');
};


log.info('>> Scanning files');
// file.writeFileSync('test/actual/local-links.md', normalizeLocalLinks(fixture3, true));
// file.writeFileSync('test/actual/external-links.md', writeExternalLinks(fixture3));

var tmpl = '* [<%= text %>](<%= url %><%= alt %>)';

var writeLinks = function(dest, src, options) {
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

    links.push(normalizeLocalLinks(content, opts));

    // links = links.map(function(link) {
    //   console.log(link);
    //   // return
    // });

    return _.flatten(links).map(function(obj) {
      obj.url = relative(dest, obj.url);
    console.log(obj);
      return template(tmpl, obj);
    }).join('\n');
  }).join('\n');

  file.writeFileSync(dest, result);
};


writeLinks('test/actual/nested.md', '**/*.md', {cwd: 'test/links'});
