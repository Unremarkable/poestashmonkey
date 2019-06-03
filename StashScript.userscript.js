// ==UserScript==
// @name        StashScript
// @namespace   www.pathofexile.com
// @description Script to see more things on the PoE Stash
// @include     https://www.pathofexile.com/account/view-profile/*/stashes
// @require     http://code.jquery.com/jquery-1.12.4.min.js
// @version     1
// @grant       none
// ==/UserScript==

//var BASE_URL = "http://localhost:8080/poestashmonkey";
var BASE_URL = "https://raw.githack.com/Unremarkable/poestashmonkey/master/scripts/main.js";


$.getScript(BASE_URL+"/scripts/main.js", function() {
    main(BASE_URL);
});