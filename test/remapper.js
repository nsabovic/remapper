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
          path: '/#dest' } ]
      }]);
      assert.equal('/#dest', r.map('/src').path);
      assert.deepEqual({}, r.map('/unmatched'));
    });
    it('toplevel required is respected', function() {
      r = new Remapper([{
        source: '/src',
        required: ['knob1'],
        destinations: [ {
          path: '/dest' } ]
      }]);
      c1 = { 'knob1' : true };
      c2 = { 'knob1' : false };
      c3 = { };
      assert.equal('/dest', r.map('/src', c1).path);
      assert.deepEqual({}, r.map('/src', c2));
      assert.deepEqual({}, r.map('/src', c3));
      assert.deepEqual({}, r.map('/unmatched', c1));
    });
    it('required flags can be nested', function() {
      r = new Remapper([{
        source: '/src',
        required: ['knob1', 'knob2.nested'],
        destinations: [ {
          path: '/dest' } ]
      }]);
      c1 = { 'knob1' : true, 'knob2': { 'nested': true } };
      c2 = { 'knob1' : true, 'knob2': true };
      c3 = { };
      assert.equal('/dest', r.map('/src', c1).path);
      assert.deepEqual({}, r.map('/src', c2));
      assert.deepEqual({}, r.map('/src', c3));
      assert.deepEqual({}, r.map('/unmatched', c1));
    });
    it('nested required is respected', function() {
      r = new Remapper([{
        source: '/src',
        destinations: [ {
          required: ['knob1'],
          path: '/dest' } ]
      }]);
      c1 = { 'knob1' : true };
      c2 = { 'knob1' : false };
      c3 = { };
      assert.equal('/dest', r.map('/src', c1).path);
      assert.deepEqual({}, r.map('/src', c2));
      assert.deepEqual({}, r.map('/src', c3));
      assert.deepEqual({}, r.map('/unmatched', c1));
    });
    it('supports embedding', function() {
      r = new Remapper([{
        source: '/src',
        destinations: [ {
          required: [ 'p' ],
          path: '/dest/{p}' } ]
      }]);
      assert.equal('/dest/v', r.map('/src', {p:'v'}).path);
      assert.deepEqual({}, r.map('http://t.co/src'));
    });
    it('supports multiple embeddings', function() {
      r = new Remapper([{
        source: '/src',
        destinations: [ {
          required: [ 'p', 'q' ],
          path: '/dest/{p}/{q}' } ]
      }]);
      assert.equal('/dest/v/w', r.map('/src', {p:'v', q:'w'}).path);
      assert.deepEqual({}, r.map('http://t.co/src'));
    });
    it('supports nested embedding', function() {
      r = new Remapper([{
        source: '/src',
        destinations: [ {
          required: [ 'p' ],
          query: {
            nested: '/dest/{p}' } } ]
      }]);
      assert.equal('/dest/v', r.map('/src', {p:'v'}).query.nested);
      assert.deepEqual({}, r.map('http://t.co/src'));
    });
    it('supports regex replace in embedding', function() {
      r = new Remapper([{
        source: '/src',
        destinations: [ {
          required: [ 'p' ],
          path: '/dest/{p|a(b)c|$1}' } ]
      }]);
      assert.equal('/dest/b', r.map('/src', {p:'abc'}).path);
    });
    it('supports regex embedding', function() {
      r = new Remapper([{
        source: '/src/(.*)',
        destinations: [ {
          path: '/dest/{1}' } ]
      }]);
      assert.equal('/dest/x', r.map('/src/x').path);
    });
    it('supports multiple destinations based on required', function() {
      r = new Remapper([{
        source: '/src/(.*)',
        destinations: [ {
          required: [ 'p' ],
          path: '/withp'
        }, {
          path: '/withoutp' } ]
      }]);
      assert.equal('/withp', r.map('/src/x', {p: '1'}).path);
      assert.equal('/withoutp', r.map('/src/x').path);
    });
  });
});
