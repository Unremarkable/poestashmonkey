// ==UserScript==
// @name        StashScript
// @namespace   www.pathofexile.com
// @description Script to see more things on the PoE Stash
// @include     http://www.pathofexile.com/character-window/*
// @require     http://code.jquery.com/jquery-1.10.2.min.js
// @version     1
// @grant       none
// ==/UserScript==

var BASE_URL = "https://raw.github.com/Unremarkable/poestashmonkey/master"

$.getScript(BASE_URL+"/scripts/main.js", function() {
    main(BASE_URL);
});