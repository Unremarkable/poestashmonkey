function handleSelectedSummary() {
	var $selectedSummary = $("<div></div>").attr("id", "selectedSummary");
	$("body").append($selectedSummary);

	var $selectedSummaryTable = $("<table></table>")
		.attr("id", "selectedSummaryTable")
		.attr("class", "stash");
	$selectedSummary.append($selectedSummaryTable);
}

function showSelectedItemsSummaryTable(selectedItemsMap) {
	var $table = $("#selectedSummaryTable");
	var $headerRow = $("<tr></tr>").addClass("headerRow");
	$table.append($headerRow);

	var modsMap = {};
	var rows = {};
	for (var itemId in selectedItemsMap) {
		var item = selectedItemsMap[itemId];
		handleModsMap(modsMap, item.implicitMods);
		handleModsMap(modsMap, item.explicitMods);

		var $row = $("<tr></tr>").attr("data-item-id", item.id);
		$table.append($row);
		rows[item.id] = $row;
		createTitleCell($row[0], item);
	}

	addHeaderCell($headerRow, "");
	$totalsRow = $("<tr></tr>").addClass("totalsRow");
	$table.append($totalsRow);
	addCellWithValue($totalsRow, "TOTALS");

	console.log("MODS SUMMARY MAP: ", modsMap);

	var sortedMods = Object.keys(modsMap).sort();
	for (var i = 0; i < sortedMods.length; i++) {
		var mod = sortedMods[i];
		addHeaderCell($headerRow, mod);

		for (var itemId in rows) {
			var item = selectedItemsMap[itemId];
			var values = getModValuesForItem(item, mod);
			var displayText = renderValuesArray(values);
			var $row = rows[itemId];
			addCellWithValue($row, displayText);
		}

		var totalsText = renderValuesArray(modsMap[mod]);
		addCellWithValue($totalsRow, totalsText);
	}
}

function renderValuesArray(values) {
	return values ? values.join("-") : "";
}

function handleModsMap(modsMap, mods) {
	if (mods) {
		for (var mod in mods) {
			var values = mods[mod].values;
			if (modsMap[mod]) {
				values = mergeValuesArrays(values, modsMap[mod]);
			}
			modsMap[mod] = values;
		}
	}
}

function getModValuesForItem(item, mod) {
	var implicitMods = item.implicitMods[mod];
	var explicitMods = item.explicitMods[mod];

	// the mod may not exist for this item or may exist in only the implicit or explicit mods
	if (!implicitMods && !explicitMods) return null;
	if (!implicitMods) return explicitMods.values;
	if (!explicitMods) return implicitMods.values;

	return mergeValuesArrays(implicitMods.values, explicitMods.values);
}

function mergeValuesArrays(first, second) {
	if (!first) return second;
	if (!second) return first;

	var sumArray = [];
	// assuming these are the same length since they should be the same mod type
	for (var i = 0; i < first.length; i++) {
		var sum = parseInt(first[i]) + parseInt(second[i]);
		sumArray.push(sum);
	}
	return sumArray;
}

function getModAverageValue(mod) {
	var values = mod.values;
	if (values.length == 0) {
		return 0;
	}

	var sum = 0;
	for (var i = 0; i < values.length; i++) {
		sum += values[i];
	}
	return sum / values.length;
}

function addHeaderCell($row, value) {
	var cell = document.createElement("th");
	cell.innerHTML = value;
	$row.append(cell);
}

function addCellWithValue($row, value) {
	var cell = document.createElement("td");
	cell.innerHTML = value;
	$row.append(cell);
}

function addSummaryRowForItem(item) {
	var row = newItemRow("summary-" + item.id);

	createImageCell(row, item);
	createTitleCell(row, item);

	addCellWithValue(row, 0);
	addCellWithValue(row, 0);
	addCellWithValue(row, 0);

	$("#selectedSummaryTable")[0].appendChild(row);
}

var coldResistance = 		"+#% to Cold Resistance";
var lightningResistance = 	"+#% to Lightning Resistance";
var fireResistance = 		"+#% to Fire Resistance";
var chaosResistance = 		"+#% to Chaos Resistance";

var resistTypesComboConversion = {
		"+#% to all Elemental Resistances" : [coldResistance, lightningResistance, fireResistance],
		"+#% to Cold and Lightning Resistances" : [coldResistance, lightningResistance],
		"+#% to Fire and Cold Resistances" : [fireResistance, coldResistance],
		"+#% to Fire and Lightning Resistances" : [fireResistance, lightningResistance]
};