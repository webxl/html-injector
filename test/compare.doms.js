var createDom     = require("../lib/injector").createDom;
var jsdom         = require("jsdom").jsdom;
var assert        = require("chai").assert;
var htmlInjector  = require("../index");
var _             = require("lodash");
var multiline     = require("multiline");

describe("Comparing Simple doms", function(){

    it("returns element index when it has different children", function(){

        var str1 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
                <h1>❤ unicorns</h1>
             </body>
         </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
                <h1><span>❤</span> unicorns</h1>
             </body>
         </html>
         */});

        var oldDom = createDom(str1);
        var newDom = createDom(str2);

        var results = htmlInjector.getDiffs(oldDom, newDom);

        assert.equal(results.length, 1);
        assert.equal(results[0].diffs.length, 1);
        assert.equal(results[0].diffs[0].tagName, "H1");
        assert.equal(results[0].diffs[0].index, "0");
    });

    it("returns element index when it has missing children", function(){

        var str1 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
             </body>
         </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
                <h1><span>❤</span> unicorns</h1>
             </body>
         </html>
         */});

        var oldDom = createDom(str1);
        var newDom = createDom(str2);

        var results = htmlInjector.getDiffs(oldDom, newDom);

        assert.equal(results.length, 1);
        assert.equal(results[0].diffs.length, 1);
        assert.equal(results[0].diffs[0].tagName, "BODY");
        assert.equal(results[0].diffs[0].index, "0");
    });

    it("Removes duplicate diffs if on same element", function(){

        var str1 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
                <h1><span>❤s</span> unicorns <i>What you saying?</i></h1>
             </body>
         </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
                <h1><span>❤</span> unicorns</h1>
             </body>
         </html>
         */});

        var oldDom = createDom(str1);
        var newDom = createDom(str2);

        var results = htmlInjector.getDiffs(oldDom, newDom);

        assert.equal(results.length, 1);
        assert.equal(results[0].diffs.length, 2);
        assert.equal(results[0].diffs[0].tagName, "SPAN");
    });

    it("Removes duplicate diffs if on same element", function(){

        var str1 = multiline.stripIndent(function(){/*
            <!doctype html>
            <html lang="en-US">
            <head>
                <meta charset="UTF-8">
                <title>This has a Title</title>
            </head>
            <body>
                <h1>HTML injector</h1>
                <h1 class="hidden" style="background: red;">HTML injector is prettty cool</h1>
            </body>
            </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
            <!doctype html>
            <html lang="en-US">
            <head>
                <meta charset="UTF-8">
                <title>This has a Title</title>
                <style>
                    .hidden {}
                </style>
                <link href="style.css"></link>
            </head>
            <body>
                <h1>HTML injector</h1>
                <h1 class="hidden" style="background: red;">HTML injector is prettty cool</h1>
            </body>
            </html>
         */});

        var oldDom = createDom(str1);
        var newDom = createDom(str2);

        var results = htmlInjector.getDiffs(oldDom, newDom);

        assert.equal(results.length, 1);
        assert.equal(results[0].diffs.length, 1);
        assert.equal(results[0].diffs[0].tagName, "HEAD");
    });

    it("Returns diffs from mulitple elements", function(){

        var str1 = multiline.stripIndent(function(){/*
            <!doctype html>
            <html lang="en-US">
            <head>
                <meta charset="UTF-8">
                <title>This has a Title</title>
            </head>
            <body>
                <h1>HTML injector</h1>
                <h1 class="hidden" style="background: red;">HTML injector is prettty cool</h1>
            </body>
            </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
            <!doctype html>
            <html lang="en-US">
            <head>
                <meta charset="UTF-8">
                <title>This has a Title</title>
                <style>
                    .hidden {}
                </style>
                <link href="style.css"></link>
            </head>
            <body>
                <h1>HTML injector</h1>
                <h1 class="hidden" style="background: red;">HTML injector is prettty coolsss</h1>
            </body>
            </html>
         */});


        var oldDom = createDom(str1);
        var newDom = createDom(str2);

        var results = htmlInjector.getDiffs(oldDom, newDom);

        assert.equal(results.length, 1);
        assert.equal(results[0].diffs.length, 2);
        assert.equal(results[0].diffs[0].tagName, "HEAD");
        assert.equal(results[0].diffs[1].tagName, "H1");
    });
});

describe("Removing excluded", function(){

    it("returns a filtereed list", function(){

        var str1 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
         <body>
         <h1>❤ unicornsss</h1>
         <h2><span>HATE</span> unicornsss</h2>
         <h3>Hi there</h3>
         </body>
         </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
         <body>
         <h1>❤ unicornsss</h1>
         <h2><span>HATE</span> unicornsssas</h2>
         <h3 class="hidden">Hi there</h3>
         </body>
         </html>
         */});

        var oldDom = createDom(str1);
        var newDom = createDom(str2);

        var results = htmlInjector.getDiffs(oldDom, newDom, {excludedTags: ["H1", "H3"]});

        assert.equal(results.length, 1);
        assert.equal(results[0].selector, "html");
        assert.equal(results[0].diffs.length, 1);
        assert.equal(results[0].diffs[0].index, 0); // should ignore outer H3
        assert.equal(results[0].diffs[0].tagName, "H2");
    });
});