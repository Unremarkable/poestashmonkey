var CACHE_MAX_LIFE = 3600000; // one hour
var numberOfTabs = 0;
var stashMetaData = {};

function receiveStashData(league, tab, data) {
	for (var i = 0; i < data.items.length; ++i)
		data.items[i].inventoryId = stashMetaData[league][tab].n;

	stashData[league][tab] = data;
	receiveItemData(data.items)
}

function requestStashData(league, tab) {
    if (typeof league === "undefined" || league == null) league = "Standard";
    if (typeof stashData[league] === "undefined") stashData[league] = {};

    function ajax(league, tab, metadata) {
        return $.ajax("http://www.pathofexile.com/character-window/get-stash-items", {
            data: {
                "league": league,
                "tabs": metadata ? 1 : 0,
                "tabIndex": (tab || 0)
            },
        })
    }

    var tabsLoaded = Object.keys(stashData[league]);

    if (typeof tab !== "undefined") {
        ajax(league, tab);
    } else if (tabsLoaded.length == 0) {
        ajax(league, 0, true)
            .done(function (data) {
            	stashMetaData[league] = data.tabs;
                receiveStashData(league, 0, data);
                requestStashData(league);
            });
    } else {
        var requests = [];
        var requestTabs = [];

        var numTabs = stashData[league][tabsLoaded[0]].numTabs;
        numberOfTabs = numTabs;
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

function getCharacterCache(name) {
	var str = localStorage["/character-window/get-items?character="+name];
	if (typeof str !== "undefined" && str.length > 0) {
		var cache = JSON.parse(str);
		if (cache && ((Date.now() - cache.date) < CACHE_MAX_LIFE))
			return cache.data;
	}
	return false;
}

function setCharacterCache(name, value) {
	localStorage["/character-window/get-items?character="+name] = JSON.stringify({
		date: Date.now(),
		data: value
	});
}

function requestCharacterData(league) {
	$.ajax("http://www.pathofexile.com/character-window/get-characters")
	.done(function(charlist) {
		for (var i = 0; i < charlist.length; ++i) {
			if (charlist[i]["league"] != league)
				continue;
			var name = charlist[i]["name"];
			var cache = getCharacterCache(name);
			if (cache) {
				receiveItemData(cache.items);
			} else {
				(function(name) {
					$.ajax("http://www.pathofexile.com/character-window/get-items", {
						"data" : {
							"character" : name,
							"accountName" : "Unremarkable"
						}
					})
					.done(function(data) {
						for (var i = 0; i < data.items.length; ++i) {
							data.items[i].inventoryId = name + "'s " + data.items[i].inventoryId;
						}
						setCharacterCache(name, data);
						receiveItemData(data.items);
					});
				})(name);
			}
		}
	});
}
