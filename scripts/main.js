function main(baseURL) {
	window.BASE_URL = baseURL || "https://raw.github.com/Unremarkable/poestashmonkey/master";
	
	$.getScript("http://requirejs.org/docs/release/2.1.9/minified/require.js")
	.done(function() {
		require([
			BASE_URL+"/scripts/ajax.js?_v=12",
			BASE_URL+"/scripts/jungle.js",
			BASE_URL+"/scripts/data/mods.js",
			BASE_URL+"/scripts/data/baseWeapons.js"
		], function() {
			ready();
		});
	});
}