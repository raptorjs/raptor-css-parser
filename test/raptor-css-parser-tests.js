'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var nodePath = require('path');
var fs = require('fs');
var logger = require('raptor-logging').logger(module);

function findUrls(path) {
    try
    {
        var code = fs.readFileSync(nodePath.join(__dirname, path), {encoding: 'utf8'});
        var cssParser = require('../');
        var urls = {};
        cssParser.findUrls(code, function(url, index, endIndex) {
            urls[url] = [index, endIndex];
        });
        return urls;
    }
    
    catch(e) {
        logger.error(e);
        throw e;
    }
}

function replaceUrls(path, callback, thisObj) {
    try {
        var code = fs.readFileSync(nodePath.join(__dirname, path), {encoding: 'utf8'});
        var cssParser = require('../');
        return cssParser.replaceUrls(code, callback, thisObj);
    }
    catch(e) {
        logger.error(e);
        throw e;
    }
}

describe('raptor-css-parser' , function() {

    beforeEach(function(done) {
        for (var k in require.cache) {
            if (require.cache.hasOwnProperty(k)) {
                delete require.cache[k];
            }
        }

        done();
    });

    it('should handle replacements for a simple CSS file', function() {
        var code = replaceUrls('resources/simple.css', function(url) {
            return url.toUpperCase();
        });
        expect(code).to.equal(".test { background-image: url(IMAGE1.PNG); }\n.test2 { background-image: url(IMAGE2.PNG); }");
    });
    
    it('should handle generic CSS file', function() {
        var urls = findUrls('resources/style.css');
        expect(Object.keys(urls).length).to.equal(3);
        expect(urls['d.png']).to.not.equal(null);
        expect(urls['throbber.gif']).to.not.equal(null);
        expect(urls['d.gif']).to.not.equal(null);
    });
});

