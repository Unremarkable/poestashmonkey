$.getScript("http://requirejs.org/docs/release/2.1.9/minified/require.js")
.done(function() {
	require([
		"https://raw.github.com/Unremarkable/poestashmonkey/master/scripts/ajax.js",
		"https://raw.github.com/Unremarkable/poestashmonkey/master/scripts/jungle.js",
		"https://raw.github.com/Unremarkable/poestashmonkey/master/scripts/data/mods.js",
		"https://raw.github.com/Unremarkable/poestashmonkey/master/scripts/data/baseWeapons.js"
	], function() {
		ready();
	});
});