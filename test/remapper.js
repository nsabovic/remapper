/*global describe:false it:false beforeEach:false afterEach:false */
"use strict";

var assert = require('assert');

try {
    var Remapper = require('../lib-cov/remapper').Remapper;
} catch(e) {
    var Remapper = require('../lib/remapper').Remapper;
}

describe('Remapper', function() {
  var r;
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
        source: '/profile',
        dest: '/#profile'
      }]);
      assert.equal('http://t.co/#profile', r.map('http://t.co/profile').url);
      assert.equal(null, r.map('http://t.co/unmatched'));
    });
    it('requires config flags', function() {
      r = new Remapper([{
        source: '/src',
        dest: '/dest',
        config: ['knob1', 'group1.knob2']
      }]);
      var c1 = { 'knob1' : true, "group1": { 'knob2': 'string' } };
      var c2 = { 'knob1' : false, "group1": { 'knob2': 'string' } };
      var c3 = { 'knob1' : true };
      assert.equal('http://t.co/dest', r.map('http://t.co/src', c1).url);
      assert.equal(null, r.map('http://t.co/src', c2));
      assert.equal(null, r.map('http://t.co/src', c3));
      assert.equal(null, r.map('http://t.co/unmatched', c1));
    });
    it('requires sourceParams', function() {
      r = new Remapper([{
        source: '/src',
        dest: '/dest',
        sourceParams: [ 'p' ]
      }]);
      assert.equal('http://t.co/dest', r.map('http://t.co/src?p=v').url);
      assert.equal(null, r.map('http://t.co/src'));
    });
    it('supports param embedding in dest', function() {
      r = new Remapper([{
        source: '/src',
        dest: '/dest/{p}'
      }]);
      assert.equal('http://t.co/dest/v', r.map('http://t.co/src?p=v').url);
      assert.equal('http://t.co/dest/', r.map('http://t.co/src').url);
    });
    it('supports param embedding in query params', function() {
      r = new Remapper([{
        source: '/src',
        dest: '/dest',
        destParams: {
          'd': '{p}'
        }
      }]);
      assert.equal('http://t.co/dest?d=v', r.map('http://t.co/src?p=v').url);
    });
    it('supports regex embedding in dest', function() {
      r = new Remapper([{
        source: '/src/(.*)',
        dest: '/dest/{1}'
      }]);
      assert.equal('http://t.co/dest/x', r.map('http://t.co/src/x').url);
    });
    it('supports regex embedding in query params', function() {
      r = new Remapper([{
        source: '/src/(.*)',
        dest: '/dest',
        destParams: {
          'd': '{1}'
        }
      }]);
      assert.equal('http://t.co/dest?d=v', r.map('http://t.co/src/v').url);
    });
    it('supports passing query params', function() {
      r = new Remapper([{
        source: '/s',
        dest: '/d',
        destParams: {
          'd': null
        },
        forwardParams: true
      }]);
      assert.equal('http://t.co/d?p=v', r.map('http://t.co/s?p=v&d=v').url);
    });
  });
});
