function main(baseURL) {
	window.BASE_URL = baseURL || "https://raw.github.com/Unremarkable/poestashmonkey/master";
	var timestamp = new Date().getTime();
	
	$.getScript("http://requirejs.org/docs/release/2.1.9/minified/require.js")
	.done(function() {
		require([
			BASE_URL+"/scripts/ajax.js?_v="+timestamp,
			BASE_URL+"/scripts/jungle.js?_v="+timestamp,
			BASE_URL+"/scripts/currency.js?_v="+timestamp,
			BASE_URL+"/scripts/tableInteractions.js?_v="+timestamp,
			BASE_URL+"/scripts/data/affixes.js?_v="+timestamp,
			BASE_URL+"/scripts/data/baseWeapons.js?_v="+timestamp
		], function() {
			ready();
		});
	});
}