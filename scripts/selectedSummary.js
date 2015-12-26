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
	addCellWithValue($totalsRow, "TOTALS");

	var sortedStatNames = Object.keys(statsMap).sort();
	for (var i = 0; i < sortedStatNames.length; i++) {
		var statName = sortedStatNames[i];
		addHeaderCell($headerRow, statName);

		for (var itemId in rows) {
			var item = selectedItemsMap[itemId];
			var displayText = renderValuesArray(item.stats[statName]);
			var $row = rows[itemId];
			addCellWithValue($row, displayText);
		}

		var totalsText = renderValuesArray(statsMap[statName]);
		addCellWithValue($totalsRow, totalsText);
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
			values = mergeValuesArrays(values, statsMap[statName]);
		}
		statsMap[statName] = values;
	}
}

function mergeValuesArrays(first, second) {
	if (!first) return second;
	if (!second) return first;

	var sumArray = [];
	// assuming these are the same length since they should be the same stat type
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