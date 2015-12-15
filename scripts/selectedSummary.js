function handleSelectedSummary() {
	var $selectedSummary = $("<div></div>").attr("id", "selectedSummary");
	$("body").append($selectedSummary);

	var $selectedSummaryTable = $("<table></table>")
		.attr("id", "selectedSummaryTable")
		.attr("class", "stash");
	$selectedSummary.append($selectedSummaryTable);
}

function showSelectedItemsSummaryTable(selectedItemsMapOriginal) {
	var selectedItemsMap = JSON.parse(JSON.stringify(selectedItemsMapOriginal)); // COPY
	preprocessItemMods(selectedItemsMap);

	var $table = $("#selectedSummaryTable");

	var $headerRow = $("<tr></tr>").addClass("headerRow");
	$table.append($headerRow);
	addHeaderCell($headerRow, "");

	var modsMap = {};
	var rows = {};
	for (var itemId in selectedItemsMap) {
		var item = selectedItemsMap[itemId];
		addModsToSummaryMap(modsMap, item.mods);

		var $row = $("<tr></tr>").attr("data-item-id", item.id);
		$table.append($row);
		createTitleCell($row[0], item);
		rows[item.id] = $row;
	}

	$totalsRow = $("<tr></tr>").addClass("totalsRow");
	$table.append($totalsRow);
	addCellWithValue($totalsRow, "TOTALS");

	var sortedModNames = Object.keys(modsMap).sort();
	for (var i = 0; i < sortedModNames.length; i++) {
		var modName = sortedModNames[i];
		addHeaderCell($headerRow, modName);

		for (var itemId in rows) {
			var item = selectedItemsMap[itemId];
			var displayText = renderValuesArray(item.mods[modName]);
			var $row = rows[itemId];
			addCellWithValue($row, displayText);
		}

		var totalsText = renderValuesArray(modsMap[modName]);
		addCellWithValue($totalsRow, totalsText);
	}
}

function renderValuesArray(values) {
	return values ? values.join("-") : "";
}

function addModsToSummaryMap(modsMap, mods) {
	for (var modName in mods) {
		var values = mods[modName];
		if (modsMap[modName]) {
			values = mergeValuesArrays(values, modsMap[modName]);
		}
		modsMap[modName] = values;
	}
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

function preprocessItemMods(items) {
	for (var itemId in items) {
		var item = items[itemId];
		item.mods = {};
		moveToModsAttribute(item, item.implicitMods);
		moveToModsAttribute(item, item.explicitMods);
	}
}

function moveToModsAttribute(item, otherMods) {
	for (var modName in otherMods) {
		var values = otherMods[modName].values;
		if (resistTypesComboConversion[modName]) {
			flattenComboModForItem(item, modName, values);
		} else {
			addValuesForMods(item, modName, values);
		}
	}
}

function flattenComboModForItem(item, comboModName, comboModValue) {
	var comboModList = resistTypesComboConversion[comboModName];

	for (var i = 0; i < comboModList.length; i++) {
		var modName = comboModList[i];
		addValuesForMods(item, modName, comboModValue);
	}
}

function addValuesForMods(item, modName, values) {
	if (item.mods[modName]) {
		values = mergeValuesArrays(values, item.mods[modName]);
	}
	item.mods[modName] = values;
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