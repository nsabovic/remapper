"use strict";

var url = require('url');
var util = require('util');

var Remapper = module.exports.Remapper = function Remapper(config) {
  if (!Array.isArray(config)) {
    throw new Error("Invalid config");
  }
  this.config = config;
  this.patterns = new Array(config.length);
  for (var i = 0; i < config.length; ++i) {
    this.patterns[i] = new RegExp('^' + config[i].source);
  }
};

Remapper.prototype.map = function map(src, config) {
  var location = url.parse(src, true);

  // Map one item, presuming the source pattern matches.
  function mapItem(match, item) {
    // Make sure all the config keys are present.
    if (Array.isArray(item.config) && !item.config.every(function(c) {
      // Support a.b.c notation.
      return c.split('.').reduce(function(obj, key) {
        return (obj || {})[key];
      }, config);
    })) {
      return null;
    }

    // Make sure all the required query parameters are there.
    if (Array.isArray(item.sourceParams) && !item.sourceParams.every(function(p) {
      return p in location.query;
    })) {
      return null;
    }

    function hydrateString(s) {
      return s.replace(/\{(.*)\}/, function(_, id) {
        if (id in location.query) {
          return location.query[id];
        } else if (id in match) {
          return match[id];
        } else {
          return "";
        }
      });
    }

    var queryParams = item.forwardParams ?
      location.query :
      Object.create(null);

    // If we needd to add query params, hydrate them too.
    if (typeof item.destParams === 'object') {
      Object.keys(item.destParams).forEach(function(key) {
        var destParam = item.destParams[key];
        if (typeof destParam === 'string') {
          queryParams[key] = hydrateString(destParam);
        } else {
          // Specifying `null` for a param deletes it.
          delete queryParams[key];
        }
      });
    }

    return {
      url: url.format({
        protocol: location.protocol,
        host: location.host,
        pathname: hydrateString(item.dest),
        query: queryParams
      }),
      data: item.data
    };
  }

  // Check all the patterns.
  for (var i = 0; i < this.patterns.length; ++i) {
    // Match the pattern.
    var match = this.patterns[i].exec(location.pathname);
    if (!match) {
      continue;
    }

    var result = mapItem(match, this.config[i]);
    if (result !== null) {
      return result;
    }
  }
  return null;
};

// new require('./lib/remapper').Remapper([{source:"/a", dest:"/b"}])
