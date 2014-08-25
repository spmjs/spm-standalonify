'use strict';

var gutil = require('gulp-util');
var multiline = require('multiline');
var standalonify = require('..');

describe('standalonify', function() {

  var content = multiline(function(){/*
define('a/1.0.0/index.js', ['b/1.0.0/b.js'], function(require, module, exports) {
var b = require('b/1.0.0/b.js');
return b('a');
});
define('b/1.0.0/b.js', [], function(require, module, exports) {
return function(str) {
return str + '+b';
};
});
  */});

  it('normal', function(done) {
    var stream = standalonify();

    stream.on('data', function(file) {
      var code = file.contents.toString();
      code.should.be.equal(multiline(function(){/*
;(function() {
var b_100_bjs, a_100_indexjs;
b_100_bjs = function (str) {
  return str + '+b';
};
a_100_indexjs = function (exports) {
  var b = b_100_bjs;
  return b('a');
}();
}());
      */}));
      done();
    });

    stream.write(new gutil.File({
      contents: new Buffer(content)
    }));
  });

  it('umd', function(done) {
    var stream = standalonify({umd:'a'});

    stream.on('data', function(file) {
      var code = file.contents.toString();
      code.should.be.equal(multiline(function(){/*
;(function() {
var b_100_bjs, a_100_indexjs;
b_100_bjs = function (str) {
  return str + '+b';
};
a_100_indexjs = function (exports) {
  var b = b_100_bjs;
  return b('a');
}();

if (typeof exports == "object") {
  module.exports = a_100_indexjs;
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return a_100_indexjs });
} else {
  this["a"] = a_100_indexjs;
}
}());
      */}));
      done();
    });

    stream.write(new gutil.File({
      contents: new Buffer(content)
    }));
  });

  it('null', function(done) {
    var stream = standalonify({umd:'a'});

    stream.on('data', function(file) {
      String(file.contents).should.be.equal('null');
      done();
    });

    stream.write(new gutil.File());
  });

});
