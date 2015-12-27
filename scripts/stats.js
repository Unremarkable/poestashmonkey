
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
		var duplicatesBox = $("<div id='duplicates'></div>");

		var toggleDuplicatesButton = $("<div id='toggleDuplicatesButton'>show item name repeats -></div>");
		var duplicatesContent = $("<div id='duplicatesContent'>" + duplicates + "</div>");
		duplicatesBox.append(toggleDuplicatesButton);
		duplicatesBox.append(duplicatesContent);

		$("#infoBox").append(duplicatesBox);
	}

	$("#toggleDuplicatesButton").click(function() {
		var toggleButton = $(this);
		console.log("toggleButton", toggleButton);
		var content = $("#duplicatesContent");
		console.log("content", content);
		if (content.is(":visible")) {
			console.log("should hide");
			content.hide();
			toggleButton.html("show item name repeats ->");
		} else {
			console.log("should show");
			content.show();
			toggleButton.html("hide item name repeats ->");
		}
	});
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

function showCurrencyValue() {
	var totalValueInChaos = 0;
	for (var itemName in currency) {
		var quantity = currency[itemName].totalQuantity;
		var rate = currencyToChaosMap[itemName];
		if (rate) {
			totalValueInChaos += quantity * rate;
		}
	}
    $("#infoBox").append("<div id='currencyValue'>Currency value estimate in chaos: " + totalValueInChaos.toFixed(0) + "</div>");
}