$.getScript("http://requirejs.org/docs/release/2.1.9/minified/require.js")
.done(function() {
	require([
		"./data/mods.js",
		"./data/baseWeapons.js",
		"./jungle.js",
	], function() {
		console.log(baseWeapons);
		console.log(modData);
		ready();
	});
});