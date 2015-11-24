
// The capacity is based on how much space all of the items in the stash tabs take up.
function showCapacityUsed() {
    var capacityUsed = 0;
    var totalTabs = 0;

    for (var league in stashData) {
        for (var tab in stashData[league]) {
            totalTabs++;
            var items = stashData[league][tab].items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                capacityUsed += item.w * item.h;
            }
        }
    }

    var capacityUtilized = Math.round(capacityUsed / (totalTabs * 144) * 100);
    $("#infoBox").append("<div id='capacityUsed'>Capacity Utilized: " + capacityUtilized + "% (across " + totalTabs + " tabs)</div>");
}

function showAnyItemNameRepeats() {
	var duplicates = "";
	for (var name in itemNames) {
		if (itemNames[name] > 1) {
			duplicates = duplicates + name + " (" + itemNames[name] + ") ";
		}
	}
	if (duplicates.length > 0) {
		$("#infoBox").append("<div id='duplicates'>Item name repeats: " + duplicates + "</div>");
	}
}

var itemNames = [];
function addNameToList(name) {
	if (name) {
		var count = 1;
		if (itemNames[name]) {
			count += itemNames[name];
		}
		itemNames[name] = count;
	}
}
