function attachHandlers() {
    handleSearching();
    handleTabSwitching();
    handleSorting();
    handleSelectedItems();
    handleFilters();
    handleStatRankings();

    attachCloseDialogBoxHandler();
}

function showDialogBoxWithId(id) {
	$("#overlay").show();
	$("#" + id).show();
}

function closeDialogBoxes() {
	$(".dialogBox").hide();
	$("#overlay").hide();
}

function attachCloseDialogBoxHandler() {
	$(".closeDialogBox").click(function() {
		$(this).parents(".dialogBox").hide();
		$("#overlay").hide();
	});
}

function handleTabSwitching() {
    $("#tabNames li").click(function() {
        $("#tabNames .selected").removeClass("selected");
        $(this).addClass("selected");

        var tableName = "table" + $(this).attr("href");
        $("#tabContents .stash").hide();
        $("#tabContents " + tableName).show();
    });
}

function handleSelectedItems() {
	$("#showSelected").click(function() {
		var button = $(this);
		if (button.hasClass("showingSelected")) {
			button.removeClass("showingSelected");
			button.html("show selected");
			clearFilter();
			showTableForSelectedTab();
			$("#selectedSummaryTable").empty();
			return;
		}

		preFilter();
		$("#selectedSummaryTable").remove("tr");

		var selectedItems = $("tr input[name='selectedItem']:checked");
		var selectedItemsMap = {};
		selectedItems.each(function() {
			var $row = $(this).parents("tr");
			$row.show();

			var item = itemStore[$row.attr("id")];
			selectedItemsMap[item.id] = item;
		});

		button.addClass("showingSelected").html("show all");
		postFilter();

		showSelectedItemsSummaryTable(selectedItemsMap);
	});
}

function handleSearching() {
	$("#searchBox").keypress(function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code == 13) { // Enter keycode
			search($(this).val());
		}
	});

    $("#clearSearch").click(function() {
        clearFilter();
        $("#searchBox").val("");

        showTableForSelectedTab();
        removeTermHighlighting();
    });
}

function clearFilter() {
    $("#tabView .stash").hide();
    $("#tabView tr").show();
}

function preFilter() {
    $("#tabView .stash").show();
    $("#tabView tr").hide();
}

function postFilter() {
    $("#tabNames .selected").removeClass("selected");
    var tablesWithRowsInSearch = $("#tabView table.stash tr:visible").parents("table.stash");
    $("#tabView .stash").hide();
    tablesWithRowsInSearch.show();
    tablesWithRowsInSearch.find(".headerRow").show();
}

function displayItems(items) {
	preFilter();
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		$("#tabView #" + item.id).show();
	}
	postFilter();
}

function search(searchString) {
	preFilter();
    removeTermHighlighting();

    var andSearch = searchString.match(/AND/) != null;
    var orSearch = searchString.match(/OR/) != null;
    if (searchString.length == 0 || andSearch && orSearch) {
        return;
    }

    var searchTerms = prepareSearchTerms(searchString, andSearch, orSearch);
    $("#tabView tr").each(function(index, row) {
        var $row = $(row);
        var termsContained = searchForTermsInRow(searchTerms, $row);

        if (termsContained > 0 && !andSearch || termsContained == searchTerms.length) {
            highlightTermsInRow(searchTerms, $row);
            $row.show();
        }
    });

    postFilter();
}

function prepareSearchTerms(searchString, andSearch, orSearch) {
    var searchTermsRaw = [];
    if (andSearch) {
        searchTermsRaw = searchString.split("AND");
    } else if (orSearch) {
        searchTermsRaw = searchString.split("OR");
    } else {
        searchTermsRaw.push(searchString);
    }

    var searchTerms = [];
    for (var i = 0; i < searchTermsRaw.length; i++) {
        var term = searchTermsRaw[i].trim().toLowerCase();
        if (term.length > 0) {
            searchTerms.push(term);
        }
    }
    return searchTerms;
}

function searchForTermsInRow(searchTerms, $row) {
    var termsContained = 0;
    for (var i = 0; i < searchTerms.length; i++) {
        var term = searchTerms[i];
        if (searchForTermInElement(term, $row)) {
            termsContained++;
        }
    }
    return termsContained;
}

function searchForTermInElement(term, element) {
    var found = false;
    if (element.children().length === 0) {
        if (element.html().match(new RegExp(term, 'ig'))) {
            found = true;
        }
    } else {
        element.children().each(function(){
            if (searchForTermInElement(term, $(this))) {
                found = true;
            }
        });
    }
    return found;
}

function highlightTermsInRow(searchTerms, $row) {
    for (var i = 0; i < searchTerms.length; i++) {
        var term = searchTerms[i];
        highlightTermInElement(term, $row);
    }
}

function highlightTermInElement(term, element) {
	if (element.children().length === 0) {
        var regEx = new RegExp("(" + term + ")", "ig");
        var replaceMask = "<span class='searchHighlight'>$1</span>";
        var text = element.html().replace(regEx, replaceMask);
        element.html(text);
	} else {
		element.children().each(function(){
			highlightTermInElement(term, $(this));
		});
	}
}

function removeTermHighlighting() {
    $(".searchHighlight").each(function(index, term) {
        term.outerHTML = term.innerHTML;
    });
}

function showTableForSelectedTab() {
    var tableName = $("#tabNames .selected").attr("href");
    $("#tabContents " + tableName).css("display", "table");
}

function handleSorting() {
    $("#tabView .stash th").click(function() {
        var header = $(this);
        var table = header.parents("table");
        var col = header.attr("id");
        var headerRow = table.find(".headerRow");
        headerRow.removeClass("unsorted");

        var sortDescending = header.hasClass("ascending");
        header.toggleClass("ascending");

        var rows = table.find("td." + col).parents("tr");

        rows.sort(function(a, b) {
            var value1 = getSortValue(a, col);
            var value2 = getSortValue(b, col);

            if (value1 > value2) {
                if (sortDescending) return 1;
                return -1;
            }
            if (value2 > value1) {
                if (sortDescending) return -1;
                return 1;
            }
            return 0;
        });

        for (var i = 0; i < rows.length; ++i) {
            table.prepend(rows[i]);
        }
    });
}

function getSortValue(row, col) {
    var value = $(row).find("td." + col).attr("data-sortValue");
    if (value) {
        var number = parseFloat(value);
        return number ? number : value;
    }
    return 0;
}

/* ----------------- STAT SORT ------------------- */
function handleStatSort() {
    $("table.stash .statRanking > div").click(function() {
        var stat = $(this);
        var statName = stat.attr("data-name");
        var table = stat.parents("table.stash");

        var rows = table.find("td.rating").parents("tr");
        rows.sort(function(row1, row2) {
            var value1 = getSortValueForStat(row1, statName);
            var value2 = getSortValueForStat(row2, statName);

            if (value1 > value2) {
                return 1;
            }
            if (value2 > value1) {
                return -1;
            }
            return 0;
        });

        for (var i = 0; i < rows.length; ++i) {
            table.prepend(rows[i]);
        }
    });
}

function getSortValueForStat(row, statName) {
    var id = $(row).attr("id");
    var item = itemStore[id];
    var stat = item.stats[statName];
    if (stat != null) {
        return getValueForStat(stat);
    }
    return 0;
}

/* ----------------- STAT SEARCH ----------------- */

function handleFilters() {
	var filterBox = $("<div id='filterBox' class='dialogBox'></div>");
	filterBox.append("<div class='closeDialogBox'>x</div>");
	filterBox.append("<input id='runFilterButton' type='button' value='Run Filter'>");
	filterBox.append("<form id='filterList'></form>");
	$("body").append(filterBox);

	addFilterGroup("Requirements", ["Level", "Str", "Int", "Dex"]);
	addFilterGroup("Attributes", attributes);
	addFilterGroup("Defense Properties", defenseProperties);
	addFilterGroup("Resistances", resistances.concat(totalResistance));
	addFilterGroup("Damage", damageProperties.concat(computedDPS));

	$("#filterMenuButton").click(function() {
		showDialogBoxWithId("filterBox");
	});

	handleFilterSearch();
}

function addFilterGroup(groupName, filterNames) {
	var filterList = $("#filterList");

	var filterGroup = $("<div class='filterGroup'></div>");
	filterList.append(filterGroup);

	var groupNameLabel = $("<h4>" + groupName + "</h4>");
	filterGroup.append(groupNameLabel);

	for (var i = 0; i < filterNames.length; i++) {
		var filterName = filterNames[i];
		filterGroup.append(createFilter(filterName));
	}
}

function createFilter(filterName) {
	var labelName = $("<span class='filterName'></span>");
	labelName.html(cleanStatName(filterName) + ":");

	var filterLine = $("<div class='filter'></div>");
	filterLine.append(labelName);

	filterLine.append(createInputEntry("min", filterName + "|min", 2));
	filterLine.append(createInputEntry("max", filterName + "|max", 2));

	return filterLine;
}

function createInputEntry(labelText, name, size) {
	var label = $("<label>" + labelText + "</label>");

	var input = $("<input />");
	input.attr("name", name);
	input.attr("size", size);

	var span = $("<span></span>");
	span.append(label);
	span.append(input);

	return span;
}

function handleFilterSearch() {
    $("#runFilterButton").click(function() {
        closeDialogBoxes();
        performStatFilter(getFiltersFromForm());
    });
}

function getFiltersFromForm() {
    var filters = {};
    $("#filterList").serializeArray().filter(function(x) {
        if (x.value) {
	        var parts = x.name.split("|");
	        var stat = parts[0];
	        var valueObject = {};
	        if (filters[stat]) {
	            valueObject = filters[stat];
	        }
	        valueObject[parts[1]] = parseInt(x.value);
	        filters[stat] = valueObject;
        }
    });
    return filters;
}

// for now filtering only supports available stats and requirements
var sampleStatSearch = {"Level" : {"min": 50, "max": 52}, "+# to maximum Life" : {"min": 80, "max": 100}};

function performStatFilter(filters) {
	var results = itemStore;
	// perform multiple filters that each thin down the list to items that match all filters
	for (var filterName in filters) {
		var filter = filters[filterName];
		results = filterForStat(results, filterName, filter);
	}

	displayItems(results);
}

function filterForStat(list, statName, filter) {
	filter.min = filter.min || 0;
	console.log("Searching for " + statName + " with minimum " + filter.min + " and maximum " + filter.max);

	var results = [];
	for (var i = 0; i < list.length; i++) {
		var item = list[i];

		// could be a stat or a requirement
		var stat = item.stats[statName];
		var requirement = getRequirement(item, statName);

		var value = stat ? getValueForStat(stat) : requirement ? parseInt(requirement) : null;


		if (value && value >= filter.min && (!filter.max || value <= filter.max)) {
			results.push(item);
		}
	}
	return results;
}

/* ----------------- STAT RANKINGS ----------------- */
var statRankings = {};

function handleStatRankings() {
	$("#addStatRankings").click(function() {
		computeStatRankings();
		displayStatRankings();
		$(this).hide(); // hide button since rankings cannot be shown again
	});
}

function computeStatRankings() {
	var start = new Date().getTime();

	for (var i = 0; i < itemStore.length; i++) {
		var item = itemStore[i];
		addToRankings(item);
	}

	sortStatRankings();

	var end = new Date().getTime();
	console.log("Ranking stat computation took " + (end - start) + " miliseconds");
}

function sortStatRankings() {
	for (var rankTypeName in statRankings) {
		var rankingsMap = statRankings[rankTypeName];
		for (var statName in rankingsMap) {
			var rankList = rankingsMap[statName];
			if (rankList && rankList[0] != null) {
				// sort highest to lowest
				rankList.sort(function(a, b) {
					if (a.constructor === Array) {
						return (b[0] + b[1]) - (a[0] + a[1]); // essentially sorting by average
					} else {
						return b - a;
					}
				});
			}
		}
	}
}

function addToRankings(item) {
	var rankingsForType = {};
	if (statRankings[item.type]) {
		rankingsForType = statRankings[item.type];
	}
	for (var statName in item.stats) {
		var rankingsList = [];
		var itemStat = item.stats[statName];

		if (rankingsForType[statName]) {
			rankingsList = rankingsForType[statName];
		}

		rankingsList.push(itemStat);
		rankingsForType[statName] = rankingsList;
	}
	statRankings[item.type] = rankingsForType;
}

function displayStatRankings() {
	$(".statRanking").each(function() {
		var rankBox = $(this);
		var itemId = rankBox.parents("tr.itemRow").attr("id");
		var item = itemStore[itemId];

		var rankingsForGroup = statRankings[item.type];
		var orderedStats = getOrderedStats(item.stats);

		for (var i = 0; i < orderedStats.length; i++) {
			var statName = orderedStats[i];
			var stat = item.stats[statName];
			var rankingsForStat = rankingsForGroup[statName];

			if (stat && rankingsForStat) {
				addRankingsToBox(rankBox, statName, stat, rankingsForStat);
			}
		}
	});

	handleStatSort();
}

function getOrderedStats(stats) {
	var importantList = [];
	var othersList = [];
	for (var statName in stats) {
		if (importantStats.indexOf(statName) >= 0) {
			importantList.push(statName);
		} else {
			othersList.push(statName);
		}
	}
	return importantList.concat(othersList.sort());
}

function addRankingsToBox(rankBox, statName, stat, rankingsForStat) {
	var rank = rankingsForStat.indexOf(stat) + 1;

	var statDiv = $("<div></div>");
	statDiv.attr("data-name", statName);

	var statText = stat;
	if (stat.constructor === Array) {
		statText = stat.join("-");
	}

	statDiv.html("[" + statText + "] " + cleanStatName(statName) + " (" + rank + "/" + rankingsForStat.length + ")");
	statDiv.attr("title", rankingsForStat.join(", "));

	var className = "";
	if (rank == 1) {
		className = "rankFirst";
	} else if (rank <= rankingsForStat.length * 0.1 || rank <= 3) { // top ten percent or top 3
		className = "rankTop";
	}
	if (importantStats.indexOf(statName) >= 0) {
		className += " importantStat";
	}
	statDiv.attr("class", className);

	rankBox.append(statDiv).show();
}