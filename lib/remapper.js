"use strict";

var querystring = require('querystring');
var url = require('url');
var util = require('util');


/* // Should we be testing the patterns beforehand?

    var item = config[i];
    this.patterns[i] = new RegExp('^' + item.source);

    // Calculate the number of capture groups in the pattern.
    var captures = 0;
    var patternString = item.source;
    var nextPos = 0;
    while (~(nextPos = patternString.search(/\(/))) {
      ++captures;
      patternString = patternString.slice(nextPos);
    }

    // Verify that all the references exist.
    for (var j = 0; j < item.destinations.length; ++j) {
      var match = /\{(.*)\}/.exec(item.destinations[j]);
      if (match && !match.slice(1).every(function (key) {
        return key === 'allParams' ||
               (!isNaN(parseInt(id)) && id < captures) || location.query[id];
      }) {
        throw new Error("Invalid reference " + key);
      })
    }
*/

var Remapper = module.exports.Remapper = function Remapper(config) {
  if (!Array.isArray(config)) {
    throw new Error("Invalid config");
  }
  this.items = config;
  this.patterns = config.map(function(item) {
    return new RegExp('^' + item.source);
  });
};

Remapper.prototype.map = function map(src, config) {
  function findNamedItem(key) {
    return key.split('.').reduce(function(obj, part) {
      return (typeof obj === 'object') ? obj[part] : undefined;
    }, config);
  }

  function decorateString(str, matches) {
    // This nastiness matches {var} or {var|srch|replace}.
    return str.replace(/\{([^}|]*)(?:\|([^}|]*)(?:\|([^}|]*))?)?\}/,
      function(_, id, regex, replace) {
        // Look up numbers in the match or the config object.
        var v = (!isNaN(parseInt(id, 10)) && matches[id]) ||
                findNamedItem(id) || "";
        // If regex is found, do search and replace.
        return regex ? v.replace(new RegExp(regex, 'g'), replace || '') : v;
      }
    );
  }

  function decorateObject(obj, matches) {
    var result = {};
    for (var k in obj) {
      result[k] = typeof obj[k] === 'object' ?
         decorateObject(obj[k], matches) :
         decorateString(obj[k].toString(), matches);
    }
    return result;
  }

  // Check all the patterns.
  for (var i = 0; i < this.patterns.length; ++i) {
    // Match the pattern & check config.
    var item = this.items[i];
    var match = this.patterns[i].exec(src);
    if (!match || (Array.isArray(item.required) &&
                  !item.required.every(findNamedItem))) {
      continue;
    }

    for (var j = 0; j < item.destinations.length; ++j) {
      var dest = item.destinations[j];
      if (Array.isArray(dest.required) &&
         !dest.required.every(findNamedItem)) {
        continue;
      }

      return decorateObject(dest, match);
    }

  }
  return null;
};
