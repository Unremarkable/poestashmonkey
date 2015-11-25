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
    $("#searchBox").keyup(function() {
//		$("tr.itemRow").removeClass("searchFilter");
//		$("tr.itemRow:not(:containsIgnoreCase('" + $(this).find("input").val() +"'))").addClass("searchFilter");
        search($(this).val());
    });

    $("#clearSearch").click(function() {
        $(".stash").hide();
        $("tr").show();
        $("#searchBox").val("");

        showTableForSelectedTab();
//		$("#searchBox input").val("");
//		$("tr.itemRow").removeClass("searchFilter");
    });
}

function search(searchString) {
    $(".stash").show();
    $("tr").hide();

    var andSearch = searchString.contains("AND");
    var andSearchTerms = searchString.split("AND");
    var orSearch = searchString.contains("OR");
    var orSearchTerms = searchString.split("OR");

    if (andSearch && orSearch) {
        return; // cannot handle both at the same time
    }

    $("tr").each(function(index, row) {
        var $row = $(row);
        var text = $row.html().toLowerCase();

        if (orSearch) {
            for (var i = 0; i < orSearchTerms.length; i++) {
                var term = orSearchTerms[i].trim();
                if (text.contains(term)) {
                    $row.show();
                }
            }
        } else if (andSearch) {
            var containsAllTerms = true;
            for (var i = 0; i < andSearchTerms.length; i++) {
                var term = andSearchTerms[i].trim();
                if (!text.contains(term)) {
                    containsAllTerms = false;
                }
            }
            if (containsAllTerms) {
                $row.show();
            }
        } else if (text.contains(searchString)) {
            $row.show();
        }
    });

    $("#tabNames .selected").removeClass("selected");
    var tablesWithRowsInSearch = $("table.stash tr:visible").parents("table.stash");
    $(".stash").hide();
    tablesWithRowsInSearch.show();
    tablesWithRowsInSearch.find("#headerRow").show();
}

function showRowsWithTerm(term) {
	$("tr:containsIgnoreCase('" + term + "')").show();
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