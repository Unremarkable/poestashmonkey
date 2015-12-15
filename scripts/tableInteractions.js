function attachHandlers() {
    handleSearching();
    handleTabSwitching();
    handleSorting();
    handleSelectedItems();
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
        var text = $row.html().toLowerCase();
        var termsContained = termsContainedInText(searchTerms, text);

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

function termsContainedInText(searchTerms, text) {
    var termsContained = 0;
    for (var i = 0; i < searchTerms.length; i++) {
        var term = searchTerms[i];
        if (text.match(new RegExp(term, 'g'))) {
            termsContained++;
        }
    }
    return termsContained;
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
    $("#tabContents " + tableName).show();
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
            value1 = parseInt(value1) || value1;

            var value2 = getSortValue(b, col);
            value2 = parseInt(value2) || value2;

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
    return $(row).find("td." + col).attr("data-sortValue") || 0;
}