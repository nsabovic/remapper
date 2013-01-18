/*global describe:false it:false xit:false beforeEach:false afterEach:false */
"use strict";

var assert = require('assert');

try {
    var Remapper = require('../lib-cov/remapper').Remapper;
} catch(e) {
    var Remapper = require('../lib/remapper').Remapper;
}

describe('Remapper', function() {
  var r, c1, c2, c3;
  describe('constructor', function() {
    it('complains on invalid config', function() {
      assert.throws(function() {
        r = new Remapper({});
      });
    });
  });
  describe('map', function() {
    it('actually remaps', function() {
      r = new Remapper([{
        source: '/src',
        destinations: [ {
          dest: '/#dest' } ]
      }]);
      assert.equal('/#dest', r.map('/src').url);
      assert.equal(null, r.map('/unmatched').url);
    });
    it('requires config flags', function() {
      r = new Remapper([{
        source: '/src',
        config: ['knob1'],
        destinations: [ {
          dest: '/dest' } ]
      }]);
      c1 = { 'knob1' : true };
      c2 = { 'knob1' : false };
      c3 = { };
      assert.equal('/dest', r.map('/src', c1).url);
      assert.equal(null, r.map('/src', c2).url);
      assert.equal(null, r.map('/src', c3).url);
      assert.equal(null, r.map('/unmatched', c1).url);
    });
    it('config flags can be nested', function() {
      r = new Remapper([{
        source: '/src',
        config: ['knob1', 'knob2.nested'],
        destinations: [ {
          dest: '/dest' } ]
      }]);
      c1 = { 'knob1' : true, 'knob2': { 'nested': true } };
      c2 = { 'knob1' : true, 'knob2': true };
      c3 = { };
      assert.equal('/dest', r.map('/src', c1).url);
      assert.equal(null, r.map('/src', c2).url);
      assert.equal(null, r.map('/src', c3).url);
      assert.equal(null, r.map('/unmatched', c1).url);
    });
    it('requires sourceParams', function() {
      r = new Remapper([{
        source: '/src',
        destinations: [ {
          sourceParams: [ 'p' ],
          dest: '/dest' } ]
      }]);
      assert.equal('/dest', r.map('/src?p=v').url);
      assert.equal(null, r.map('/src').url);
    });
    it('supports param embedding in dest', function() {
      r = new Remapper([{
        source: '/src',
        destinations: [ {
          sourceParams: [ 'p' ],
          dest: '/dest/{p}' } ]
      }]);
      assert.equal('/dest/v', r.map('/src?p=v').url);
      assert.equal(null, r.map('http://t.co/src').url);
    });
    it('supports regex replace in param embedding', function() {
      r = new Remapper([{
        source: '/src',
        destinations: [ {
          sourceParams: [ 'p' ],
          dest: '/dest/{p|a(b)c|$1}' } ]
      }]);
      assert.equal('/dest/b', r.map('/src?p=abc').url);
    });
    it('supports allParam embedding in dest', function() {
      r = new Remapper([{
        source: '/src',
        destinations: [ {
          dest: '/dest?{allParams}' } ]
      }]);
      assert.equal('/dest?p=v&r=q', r.map('/src?p=v&r=q').url);
    });
    it('supports regex embedding in dest', function() {
      r = new Remapper([{
        source: '/src/(.*)',
        destinations: [ {
          dest: '/dest/{1}' } ]
      }]);
      assert.equal('/dest/x', r.map('/src/x').url);
    });
    it('supports multiple destinations based on params', function() {
      r = new Remapper([{
        source: '/src/(.*)',
        destinations: [ {
          sourceParams: [ 'p' ],
          dest: '/withp'
        }, {
          dest: '/withoutp' } ]
      }]);
      assert.equal('/withp', r.map('/src/x?p=1').url);
      assert.equal('/withoutp', r.map('/src/x').url);
    });
  });
});
