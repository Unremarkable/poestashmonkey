function attachHandlers() {
    handleSearching();
    handleTabSwitching();
    handleSorting();
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

function handleSearching() {
	$("#searchBox").keypress(function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code == 13) { // Enter keycode
			search($(this).val());
		}
	});

    $("#clearSearch").click(function() {
        $(".stash").hide();
        $("tr").show();
        $("#searchBox").val("");

        showTableForSelectedTab();
        removeTermHighlighting();
    });
}

function search(searchString) {
    $(".stash").show();
    $("tr").hide();
    removeTermHighlighting();

    var andSearch = searchString.contains("AND");
    var orSearch = searchString.contains("OR");
    if (searchString.length == 0 || andSearch && orSearch) {
        return;
    }

    var searchTerms = prepareSearchTerms(searchString, andSearch, orSearch);
    $("tr").each(function(index, row) {
        var $row = $(row);
        var text = $row.html().toLowerCase();
        var termsContained = termsContainedInText(searchTerms, text);

        if (termsContained > 0 && !andSearch || termsContained == searchTerms.length) {
            highlightTermsInRow(searchTerms, $row);
            $row.show();
        }
    });

    $("#tabNames .selected").removeClass("selected");
    var tablesWithRowsInSearch = $("table.stash tr:visible").parents("table.stash");
    $(".stash").hide();
    tablesWithRowsInSearch.show();
    tablesWithRowsInSearch.find("#headerRow").show();
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
        if (text.contains(term)) {
            termsContained++;
        }
    }
    return termsContained;
}

function highlightTermsInRow(searchTerms, $row) {
    var text = $row.html();
    for (var i = 0; i < searchTerms.length; i++) {
        var term = searchTerms[i];
        var regEx = new RegExp(term, "ig");
        var replaceMask = "<span class='searchHighlight'>" + term + "</span>";
        text = text.replace(regEx, replaceMask);
    }
    $row.html(text);
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
    $(".stash th").click(function() {
        var header = $(this);
        var table = header.parents("table");
        var col = header.attr("id");
        var headerRow = table.find("#headerRow");
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