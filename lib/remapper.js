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
  function findConfigItem(key) {
    return key.split('.').reduce(function(obj, part) {
      return (typeof obj === 'object') ? obj[part] : undefined;
    }, config);
  }

  function checkRequiredParams(required) {
    return !Array.isArray(required) || required.every(findConfigItem);
  }

  function decorateMatch(_, matched) {
    var parts = matched.split('|');
    var id = parts[0];
    var regex = parts[1];
    var result =
      (!isNaN(parseInt(id, 10)) && match[id]) ||
      findConfigItem(id) ||
      "";

    return typeof(regex === 'string') ?
      result.replace(new RegExp(regex, 'g'), parts[2] || '') :
      result;
  }

  // Check all the patterns.
  for (var i = 0; i < this.patterns.length; ++i) {
    // Match the pattern & check config.
    var item = this.items[i];
    var match = this.patterns[i].exec(src);
    if (!match || !checkRequiredParams(item.required)) {
      continue;
    }

    for (var j = 0; j < item.destinations.length; ++j) {
      var dest = item.destinations[j];
      if (!checkRequiredParams(dest.required)) {
        continue;
      }

      var result = {};
      for (var k in dest) {
        if (k !== 'required') {
          result[k] = dest[k].replace(/\{(.*)\}/, decorateMatch);
        }
      }
      return result;
    }

  }
  return null;
};
