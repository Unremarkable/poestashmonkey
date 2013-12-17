function receiveStashData(league, tab, data) {
    console.log("receiveStashData(" + league + "," + tab + ");");
    stashData[league][tab] = data;
}

function receiveStashDataFinished() {
    console.log("receiveStashDataFinished();");
    var items = existingItems;
    var tabs = stashData["Standard"];
    for (var tab in Object.getOwnPropertyNames(tabs)) {
        items = items.concat(tabs[tab].items);
    }

    buildPage(items);
}

function requestStashData(league, tab) {
    if (typeof league === "undefined") league = "Standard";
    if (typeof stashData[league] === "undefined") stashData[league] = {};

    function ajax(league, tab) {
        return $.ajax("http://www.pathofexile.com/character-window/get-stash-items", {
            data: {
                "league": league,
                "tabs": 0,
                "tabIndex": (tab || 0)
            },
        })
    }

    var tabsLoaded = Object.keys(stashData[league]);

    if (typeof tab !== "undefined") {
        ajax(league, tab);
    } else if (tabsLoaded.length == 0) {
        ajax(league, 0)
            .done(function (data) {
                receiveStashData(league, 0, data);
                requestStashData(league);
            });
    } else {
        var requests = [];
        var requestTabs = [];

        var numTabs = stashData[league][tabsLoaded[0]].numTabs;
        for (var i = 0; i < numTabs; ++i) {
            if (typeof stashData[league][i] === "undefined") {
                requests.push(ajax(league, i));
                requestTabs.push(i);
            }
        }
        if (requests.length > 0) {
            $.when.apply($, requests).done(function () {
                for (var i in arguments)
                    receiveStashData(league, requestTabs[i], arguments[i][0]);
                receiveStashDataFinished();
            })
        }
    }
}