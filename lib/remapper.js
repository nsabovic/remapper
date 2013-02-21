"use strict";

var querystring = require('querystring');
var url = require('url');
var util = require('util');

var FINISH_REGEX_STRING = /(?:[\&\?\/].*|)$/.source;
var START_REGEX_STRING = /^/.source;


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

var Remapper = module.exports.Remapper = function Remapper(config, options) {
  if (!Array.isArray(config)) {
    throw new Error("Invalid config");
  }

  // By default, start from the beginning, use '?', '&' and end as delimiters.
  var startRegex  = (options || {}).startRegex  || START_REGEX_STRING;
  var finishRegex = (options || {}).finishRegex || FINISH_REGEX_STRING;

  this.configs = new Array(config.length);
  for (var i = 0; i < config.length; ++i) {
    var item = config[i];
    this.configs[i] = {
      item: item,
      pattern: item.source instanceof RegExp ?
               item.source :
               new RegExp(startRegex + item.source + finishRegex)
    };
  }
};

Remapper.prototype.map = function map(src, input) {
  function findNamedItem(key) {
    return key.split('.').reduce(function(obj, part) {
      return (typeof obj === 'object') ? obj[part] : undefined;
    }, input);
  }

  function decorateString(str, matches) {
    // This nastiness matches {var} or {var|srch|replace}.
    return str.replace(/\{([^}|]*)(?:\|([^}|]*)(?:\|([^}|]*))?)?\}/g,
      function(_, id, regex, replace) {
        // Look up numbers in the match or the input object.
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

  function failsRequirements(x) {
    return ((Array.isArray(x.required) && !x.required.every(function(x) {
      return findNamedItem(x) !== undefined; })) ||
           (typeof x.required === 'function' && !x.required(input)));
  }

  var result = null;

  // Check all the patterns.
  this.configs.some(function(config) {
    var item = config.item;
    var match = config.pattern.exec(src);

    if (!match || failsRequirements(item)) {
      return false;
    }

    item.destinations.some(function (dest) {
      if (failsRequirements(dest)) {
        return false;
      }
      result = decorateObject(dest, match);
      if (typeof dest.decorate === 'function') {
        dest.decorate(input, result);
      }
      return true;
    });

    return result !== null;
  });

  return result || {};
};
