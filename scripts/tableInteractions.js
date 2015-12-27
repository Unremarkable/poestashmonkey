function attachHandlers() {
    handleSearching();
    handleTabSwitching();
    handleSorting();
    handleSelectedItems();
    handleFilters();

    attachCloseDialogBoxHandler();
}

function showDialogBoxWithId(id) {
	$("#overlay").show();
	$("#" + id).show();
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

/* ----------------- STAT SEARCH ----------------- */

function handleFilters() {
	var filterBox = $("<div id='filterBox' class='dialogBox'></div>");
	filterBox.append("<div class='closeDialogBox'>x</div>");
	filterBox.append("<h2>Filters</h2>");
	filterBox.append("<div>Coming soon!</div>");
	$("body").append(filterBox);

	$("#filterMenuButton").click(function() {
		showDialogBoxWithId("filterBox");
	});
}

// for now filtering only supports available stats and requirements
var sampleStatSearch = {"Level" : [50, 52], "+# to maximum Life" : [80,100]};

function performStatFilter(filters) {
	var results = itemStore;
	// perform multiple filters that each thin down the list to items that match all filters
	for (var filterName in filters) {
		var filter = filters[filterName];
		results = filterForStat(results, filterName, filter[0], filter[1]);
	}

	displayItems(results);
}

function filterForStat(list, statName, minValue, maxValue) {
	minValue = minValue || 0;
	console.log("Searching for " + statName + " with minimum " + minValue + " and maximum " + maxValue);

	var results = [];
	for (var i = 0; i < list.length; i++) {
		var item = list[i];

		// could be a stat or a requirement
		var stat = item.stats[statName];
		var requirement = getRequirement(item, statName);

		var value = stat ? stat : requirement ? parseInt(requirement) : null;

		if (value && value >= minValue && (!maxValue || value <= maxValue)) {
			results.push(item);
		}
	}
	return results;
}
