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
  var location = url.parse(src, true);

  function checkRequiredParams(current, required) {
    return !Array.isArray(required) || required.every(function(key) {
      return key.split('.').reduce(function(obj, part) {
        return (typeof obj === 'object') ? obj[part] : undefined;
      }, current);
    });
  }

  function decorateMatch(_, matched) {
    var parts = matched.split('|');
    var id = parts[0];
    var regex = parts[1];
    var result = id === 'allParams' ?
           querystring.stringify(location.query) :
           (!isNaN(parseInt(id, 10)) && match[id]) || location.query[id] || "";
    return typeof(regex === 'string') ?
      result.replace(new RegExp(regex, 'g'), parts[2] || '') :
      result;
  }

  // Check all the patterns.
  for (var i = 0; i < this.patterns.length; ++i) {
    // Match the pattern & check config.
    var item = this.items[i];
    var match = this.patterns[i].exec(location.pathname);
    if (!match || !checkRequiredParams(config, item.config)) {
      continue;
    }

    for (var j = 0; j < item.destinations.length; ++j) {
      var dest = item.destinations[j];
      if (!checkRequiredParams(location.query, dest.sourceParams)) {
        continue;
      }

      return {
        url: dest.dest.replace(/\{(.*)\}/, decorateMatch),
        data: dest.data
      };
    }

  }
  return { url: null, data: undefined };
};
