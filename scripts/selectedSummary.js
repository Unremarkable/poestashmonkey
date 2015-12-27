function handleSelectedSummary() {
	var $selectedSummary = $("<div></div>").attr("id", "selectedSummary");
	$("body").append($selectedSummary);

	var $selectedSummaryTable = $("<table></table>")
		.attr("id", "selectedSummaryTable")
		.attr("class", "stash");
	$selectedSummary.append($selectedSummaryTable);
}

function showSelectedItemsSummaryTable(selectedItemsMapOriginal) {
	var selectedItemsMap = cloneItem(selectedItemsMapOriginal);
	var $table = $("#selectedSummaryTable");

	var $headerRow = $("<tr></tr>").addClass("headerRow");
	$table.append($headerRow);
	addHeaderCell($headerRow, "");

	var statsMap = {};
	var rows = {};
	for (var itemId in selectedItemsMap) {
		var item = selectedItemsMap[itemId];
		addStatsToSummaryMap(statsMap, item.stats);

		var $row = $("<tr></tr>").attr("data-item-id", item.id);
		$table.append($row);
		createTitleCell($row[0], item);
		rows[item.id] = $row;
	}

	$totalsRow = $("<tr></tr>").addClass("totalsRow");
	$table.append($totalsRow);
	addCellWithContentAndClass($totalsRow, "TOTALS");

	var sortedStatMap = getOrderedListForStats(statsMap);
	for (var statName in sortedStatMap) {
		var className = sortedStatMap[statName].className;
		addHeaderCell($headerRow, statName, className);

		for (var itemId in rows) {
			var item = selectedItemsMap[itemId];
			var displayText = renderValuesArray(item.stats[statName]);
			var $row = rows[itemId];
			addCellWithContentAndClass($row, displayText, className);
		}

		var totalsText = renderValuesArray(sortedStatMap[statName].values);
		addCellWithContentAndClass($totalsRow, totalsText, className);
	}
}

function getOrderedListForStats(statsMapOriginal) {
	var statsMap = cloneItem(statsMapOriginal);

	var orderedMap = {};
	moveStatsFromListToOrderedMap(statsMap, orderedMap, resistances.concat(totalResistance), "resist");
	moveStatsFromListToOrderedMap(statsMap, orderedMap, defenseStats, "defense");
	moveStatsFromListToOrderedMap(statsMap, orderedMap, defenseProperties, "defense");
	moveStatsFromListToOrderedMap(statsMap, orderedMap, attributes, "attribute");
	moveStatsFromListToOrderedMap(statsMap, orderedMap, damageTypes, "damage");

	// copy over remainder of stats
	for (var stat in statsMap) {
		orderedMap[stat] = statsMap[stat];
	}

	return orderedMap;
}

function moveStatsFromListToOrderedMap(statsMap, orderedMap, list, className) {
	for (var i = 0; i < list.length; i++) {
		var stat = list[i];
		if (statsMap[stat]) {
			orderedMap[stat] = statsMap[stat];
			delete statsMap[stat];
			orderedMap[stat]["className"] = className;
		}
	}
}

function renderValuesArray(values) {
	if (values != null) {
		if (values.constructor === Array){
			return values.join("-");
		}
		return values; // might be a single value
	}
	return "";
}

function addStatsToSummaryMap(statsMap, stats) {
	for (var statName in stats) {
		var values = stats[statName];
		if (statsMap[statName]) {
			values = mergeValuesArrays(values, statsMap[statName].values);
		}
		statsMap[statName] = {"values" : values};
	}
}

function mergeValuesArrays(first, second) {
	if (first == null) return second;
	if (second == null) return first;

	if (first.constructor === Array && second.constructor === Array) {
		var sumArray = [];
		// assuming these are the same length since they should be the same stat type
		for (var i = 0; i < first.length; i++) {
			var sum = first[i] + second[i];
			sumArray.push(sum);
		}
		return sumArray;
	} else {
		return first + second;
	}
}

function addHeaderCell($row, value) {
	var cell = document.createElement("th");
	cell.innerHTML = value;
	$row.append(cell);
}

function addCellWithContentAndClass($row, content, className) {
	var cell = document.createElement("td");
	if (className) {
		cell.className = className;
	}
	cell.innerHTML = content;
	$row.append(cell);
}

function addSummaryRowForItem(item) {
	var row = newItemRow("summary-" + item.id);

	createImageCell(row, item);
	createTitleCell(row, item);

	addCellWithContentAndClass(row, 0);
	addCellWithContentAndClass(row, 0);
	addCellWithContentAndClass(row, 0);

	$("#selectedSummaryTable")[0].appendChild(row);
}