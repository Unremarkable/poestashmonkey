alert($);

require([
    "data/mods.js",
    "data/baseWeapons.js",
    "jungle.js",
], function() {
    console.log(baseWeapons);
    console.log(modData);
    ready();
});