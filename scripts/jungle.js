var stashData = {};

$.expr[':'].containsIgnoreCase = function (n, i, m) {
    return jQuery(n).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str) {
    return this.substring(0, str.length) === str;
  };
}

function insertStylesheet() {
    var style = window.document.createElement("link");
	style.rel = "stylesheet";
	style.type="text/css";
	var timestamp = new Date().getTime();
	style.href=BASE_URL+"/css/main.css?_v=" + timestamp;
    $("head")[0].appendChild(style);
}

var existingItems = [];

function preload_main() {
	$("body").append(PoEData.ui.base);
}

function ready() {
    insertStylesheet();

    if ($("pre").length > 0) {
        existingItems = JSON.parse($("pre").html()).items;
    }

    $("body").html("<h2>Loading...</h2>");

	buildPage();
	preload_main();
};

function createRowFor(item, table) {
	var row = newItemRow(item.id);

	for (var c = 0; c < table.columns.length; ++c) {
		({
			"+":       createSelectedCell,
			"Icon":    createImageCell,
			"Name":    createTitleCell,
			"Quantity":createQuantityCell,
			"Level":   createLevelCell,
			"Str":     createStrCell,
			"Int":     createIntCell,
			"Dex":     createDexCell,
			"Mods":    createModsCell,
			"Quality": addItemQuality,
			"tResist": addTotalResistances,
			"Sockets": createSocketsCell,
			"AR":      addArmour,
			"EV":      addEvasion,
			"ES":      addEnergyShield,
			"DPS":     addDPS,
			"pDPS":    addPDPS,
			"eDPS":    addEDPS,
			"CPS":     addCPS,
			"Inc":     addpIncreaseDPS,
			"eDMG":    addItemElementalDamage,
			"APS": addAttacksPerSecondCell,
			"CritChance": addCritChanceCell,
			"Type": addWeaponTypeCell,
			"Rarity":  addIncreasedRarity,
            "Rating": addAffixRating,
            "MapTier": addMapTier,
            "StackSize": createStackSizeCell,
            "Description": addDescription,
            "SkillType": addSkillType,
            "Support": addSupport,
            "GemLevel": addGemLevel,
            "ManaCost": addManaCost,
            "CastTime": addCastTime
		})[table.columns[c]](row, item);
	}

	table.dom.appendChild(row);
}

var itemStore = [];
var itemStoreIdCounter = 0;

var renderItemsDuration = 0;

function receiveItemData(items) {
	prepareItems(items);
	var start = new Date().getTime();

	for (var i = 0; i < items.length; ++i) {
		var item = items[i];

		// store items in structure for later referencing and processing
		item.id = itemStoreIdCounter;
		itemStoreIdCounter++;
		itemStore.push(item);

		addNameToList(item.name);

		if (item.type == "currency") {
			addCurrency(item);
		} else {
			if (item.type == "uncategorized") {
				console.log("Uncategorized Item", item);
			}
			createRowFor(item, tables[item.type]);
		}
	}
	var end = new Date().getTime();
	renderItemsDuration += end - start;
}

var currency = [];

function receiveStashDataFinished() {
    console.log("Time to render items: " + renderItemsDuration + " miliseconds");
    console.log("Time to prepare items: " + prepareItemsDuration + " miliseconds");

	for (var item in currency) {
		createRowFor(currency[item], tables["currency"]);
	}

	if ($("#uncategorized").length > 1) {
		$("li[href='#uncategorized']").show();
	}

	$("#tabNames li").first().addClass("selected");
	showTableForSelectedTab();

    showCapacityUsed();
    showCurrencyValue();
    showAnyItemNameRepeats();
}

function addCurrency(item) {
	var name = item.typeLine;

	setItemQuantity(item);

	if (!currency[name]) {
		currency[name] = item;
		removeStackSizeFromImageLink(item);
		currency[name].instances = [];
		currency[name].totalQuantity = 0;
	}

	currency[name].instances.push(cloneItem(item));
	currency[name].totalQuantity += item.quantity;
}

function addStackSizeToProperties(item, value, total) {
	var stackSizeProperty = {};
	stackSizeProperty.name = "Stack Size";
	stackSizeProperty.displayMode = 0;
	stackSizeProperty.values = [[value + "/" + total], 0];
	item.properties["Stack Size"] = stackSizeProperty;
}

// this is a clean copy so it prevents cycles
function cloneItem(item) {
	return JSON.parse(JSON.stringify(item));
}

function setItemQuantity(item) {
	item.quantity = parseInt(item.properties["Stack Size"].values[0][0].split("/"));
}

function removeStackSizeFromImageLink(item) {
	var parts = item.icon.split("stackSize");
	if (parts.length > 1) {
		item.icon = parts[0] + parts[1].split("&").splice(1).join("&");
	}
}

/*
// only quantities up to 200 will render on the image
function changeImageStackSize(imgLink, n) {
	var params = imgLink.split("&");
	for (var i = 0; i < params.length; i++) {
		if (params[i].startsWith("stackSize")) {
			params[i] = "stackSize=" + n;
		}
	}
	return params.join("&");
}
*/

var basicColumns = ["+", "Icon", "Name", "Level"];
var accesoriesColumns  =  basicColumns.concat(["Mods", "tResist", "Rating"]);
var accesoriesColumnsWithDamage = accesoriesColumns.concat(["eDMG", "Rarity"]);
var advancedColumns = ["Str", "Int", "Dex", "Quality", "Sockets", "Mods", "Rating"];
var gearColumns =  basicColumns.concat(advancedColumns).concat(["AR", "EV", "ES", "tResist", "eDMG", "Rarity"]);

var tables = {
	"currency": {
		"name":    "Currency",
		"idName":  "currency",
		"columns": ["Icon", "Quantity", "Name", "Mods"]
	},
	"gems": {
		"name":    "Gems",
		"idName":  "gems",
		"columns": basicColumns.concat(["GemLevel", "Str", "Int", "Dex", "Quality", "ManaCost", "CastTime", "Support", "SkillType", "Mods", "Description"])
	},
	"jewels": {
		"name":    "Jewels",
		"idName":  "jewels",
		"columns": ["+", "Icon", "Name", "Mods", "Rating"]
	},
	"flasks": {
		"name":    "Flasks",
		"idName":  "flasks",
		"columns": basicColumns.concat(["Quality", "Mods"])
	},
	"amulets": {
		"name":    "Amulets",
		"idName":  "amulets",
		"columns": accesoriesColumnsWithDamage
	},
	"talismans": {
		"name":    "Talismans",
		"idName":  "talismans",
		"columns": accesoriesColumnsWithDamage
	},
	"rings": {
		"name":    "Rings",
		"idName":  "rings",
		"columns": accesoriesColumnsWithDamage
	},
	"belts": {
		"name":    "Belts",
		"idName":  "belts",
		"columns": accesoriesColumns
	},
	"quivers": {
		"name":    "Quivers",
		"idName":  "quivers",
		"columns": accesoriesColumnsWithDamage
	},
	"boots": {
		"name":    "Boots",
		"idName":  "boots",
		"columns": gearColumns
	},
	"gloves": {
		"name":    "Gloves",
		"idName":  "gloves",
		"columns": gearColumns
	},
	"helmets": {
		"name":    "Helmets",
		"idName":  "helmets",
		"columns": gearColumns
	},
	"armour": {
		"name":    "Armour",
		"idName":  "armour",
		"columns": gearColumns
	},
	"weapons": {
		"name":    "Weapons",
		"idName":  "weapons",
		"columns": basicColumns.concat(["Type"]).concat(advancedColumns).concat(["DPS", "pDPS", "eDPS", "CPS", "Inc", "APS", "CritChance"])
	},
	"shields": {
		"name":    "Shields",
		"idName":  "shields",
		"columns": basicColumns.concat(advancedColumns).concat(["tResist"])
	},
	"maps": {
		"name":    "Maps",
		"idName":  "maps",
		"columns": ["Icon", "Name", "MapTier", "Quality", "Mods"]
	},
	"cards": {
		"name":    "Cards",
		"idName":  "cards",
		"columns": ["Icon", "Name", "Mods", "StackSize"]
	},
	"uncategorized": {
		"name":    "Uncategorized",
		"idName":  "uncategorized",
		"columns": ["Icon", "Name", "Mods"]
	}
};

function getElementalDamage(item) {
	var eDMG = [0, 0];

	for (var type in damageTypes) {
		var mod = item.explicitMods[damageTypes[type]];
		if (mod) {
			eDMG[0] += parseInt(mod.values[0]);
			eDMG[1] += parseInt(mod.values[1]);
		}
	}

	return eDMG;
}

function getRequiredLevel(item) {
    if (item.baseItem) {
        if (item.affixes && item.affixes.length > 0) {
            var highestAffix = Object.max(item.affixes, function (affix) {
                return affix.level;
            });
            return Math.max(item.baseItem.level, Math.floor(highestAffix * 0.8));
        }
        return item.baseItem.level;
    }

    return getRequirement(item, "level");
}

function addItemElementalDamage(row, item) {
	var eDMG = getElementalDamage(item);
	appendNewCellWithTextAndClass(row, (eDMG[0] || eDMG[1]) ? eDMG[0]+"-"+eDMG[1] : 0, "edmg", eDMG[0] + eDMG[1]);
}

function getRarityIncreaseForMods(mods) {
	var rarityType = "#% increased Rarity of Items found";

	var rarityIncrease = 0;
	var mod = mods[rarityType];
	if (mod) {
		rarityIncrease = parseInt(mod.values[0]);
	}
	return rarityIncrease;
}

function addIncreasedRarity(row, item) {
	var rarityIncrease = getRarityIncreaseForMods(item.explicitMods) + getRarityIncreaseForMods(item.implicitMods);
	appendNewCellWithTextAndClass(row, rarityIncrease, "rarity", rarityIncrease);
}

function addAffixRating(row, item) {
	var rankingDiv = "</div><div class='statRanking'></div>";

    if (item.affixes && item.affixes.length > 0) {
        var average = (item.affixes.reduce(function (sum, affix) {
            return sum + affix.level;
        }, 0) / item.affixes.length) - parseInt(getRequirement(item, "Level"));

        var text = "<ul class='affixes'>"+item.affixes.map(function (affix) {
            var highestForItemLevel = true;
            var highestInGroup      = true;

            var highestAffixLevel = Math.floor(parseInt(getRequirement(item, "Level")) / 0.8 + 1);

            Object.forEach(Affixes[affix.key][affix.group].affixes, function (alternative) {
               if (alternative.level > affix.level) {
                   highestInGroup = false;
                   if (alternative.level <= highestAffixLevel)
                        highestForItemLevel = false;
               }
            });

            // this should be moved to affix.js
            var title = affix.properties.map(function (property) {
                if (property.range.length == 2)
                    return property.name.replace("#-#","["+property.range[0].min+"-"+property.range[0].max+"]-["+property.range[1].min+"-"+property.range[1].max+"]");
                return property.name.replace("#","["+property.range[0].min+"-"+property.range[0].max+"]");
            }).join("\n");

            var val = "<li title=\""+title+"\">"+affix.name + "(" + affix.level + ")</li>";

            if (highestInGroup)
                return val.fontcolor("green");
            if (highestForItemLevel)
                return val.fontcolor("yellow");

            return val;
        }).join("")+"</ul>";

        appendNewCellWithTextAndClass(row, text + rankingDiv, "rating", average);
    } else {
        appendNewCellWithTextAndClass(row, rankingDiv, "rating", -9999);
    }
}

function getItemQuality(item) {
	return item.properties["Quality"] ? parseInt(item.properties["Quality"].values[0]) : 0;
}

function addItemQuality(row, item) {
	var quality = getItemQuality(item);
	appendNewCellWithTextAndClass(row, quality + "%", "quality", quality);
}

function addTotalResistances(row, item) {
	var tResist = item.stats["Total Resistance"];
	appendNewCellWithTextAndClass(row, tResist + "%", "tresist", tResist);
}

 function addArmour(row, item) {
	var ar  = item.properties["Armour"] ? parseInt(item.properties["Armour"].values[0]) : 0;
	appendNewCellWithTextAndClass(row, ar, "ar", ar);
 }

 function addEvasion(row, item) {
	var ev = item.properties["Evasion Rating"] ? parseInt(item.properties["Evasion Rating"].values[0]) : 0;
	appendNewCellWithTextAndClass(row, ev, "ev", ev);
 }

 function addEnergyShield(row, item) {
	var es = item.properties["Energy Shield"] ? parseInt(item.properties["Energy Shield"].values[0]) : 0;
	appendNewCellWithTextAndClass(row, es, "es", es);
 }

 function addDPS(row, item) {
	var dps = item.weaponInfo ? item.weaponInfo.dps.toFixed(1) : 0;
	appendNewCellWithTextAndClass(row, dps, "dps", dps);
 }

 function addPDPS(row, item) {
	var pdps = item.weaponInfo ? item.weaponInfo.pdps.toFixed(1) : 0;
	appendNewCellWithTextAndClass(row, pdps, "pdps", pdps);
 }

 function addEDPS(row, item) {
	var edps = item.weaponInfo ? item.weaponInfo.edps.toFixed(1) : 0;
	appendNewCellWithTextAndClass(row, edps, "edps", edps);
 }

 function addCPS(row, item) {
	var cps = item.weaponInfo ? item.weaponInfo.cps.toFixed(1) : 0;
	appendNewCellWithTextAndClass(row, cps, "cps", cps);
 }

 function addpIncreaseDPS(row, item) {
	var pIncreaseDps = item.weaponInfo ? item.weaponInfo.pIncreaseDps.toFixed(1) : 0;
	appendNewCellWithTextAndClass(row, pIncreaseDps + " %", "inc", pIncreaseDps);
 }

function addAttacksPerSecondCell(row, item) {
    var aps = item.properties["Attacks per Second"] ? parseFloat(item.properties["Attacks per Second"].values[0][0]) : 0;
    appendNewCellWithTextAndClass(row, aps, "aps", aps);
}

function addCritChanceCell(row, item) {
    var critChance = item.properties["Critical Strike Chance"] ? parseFloat(item.properties["Critical Strike Chance"].values[0][0]) : 0;
    appendNewCellWithTextAndClass(row, critChance + "%", "critChance", critChance);
}

function addMapTier(row, item) {
    var mapTier = item.properties["Map Tier"] ? parseInt(item.properties["Map Tier"].values[0]) : 0;
    appendNewCellWithTextAndClass(row, mapTier, "mapTier", mapTier);
}

function addWeaponTypeCell(row, item) {
	var text = "";
	for (var i = 0; i < weaponTypes.length; i++) {
		var type = weaponTypes[i];
		if (item.properties[type]) {
			text = type;
		}
	}
    appendNewCellWithTextAndClass(row, text, "type", text);
}

function createStackSizeCell(row, item) {
    var text = "";
    var sortValue = 0;
    var stackSizeProperty = item.properties["Stack Size"];
    if (stackSizeProperty) {
        var stackSize = stackSizeProperty.values[0][0];
        var parts = stackSize.split("/");
        sortValue = (parts[0] / parts[1]).toPrecision(2);

        text = stackSize;
        if (sortValue == 1) {
            text = "<span class='completeStack'>" + text + "</span>";
        }
    }
    appendNewCellWithTextAndClass(row, text, "stackSize", sortValue);
}

function addDescription(row, item) {
	var text = item.secDescrText ? item.secDescrText : "";
    appendNewCellWithTextAndClass(row, text, "description", text);
}

function addSupport(row, item) {
	var text = item.support ? "Support" : "";
	var sortValue = item.support ? 1 : 0;
    appendNewCellWithTextAndClass(row, text, "support", sortValue);
}

function getValueForProperty(item, propertyName) {
	var property = item.properties[propertyName];
	return property ? property.values[0][0] : "";
}

function addGemLevel(row, item) {
	var value = getValueForProperty(item, "Level");
    appendNewCellWithTextAndClass(row, value, "gemLevel", value);
}

function addManaCost(row, item) {
	var value = getValueForProperty(item, "Mana Cost");
    appendNewCellWithTextAndClass(row, value, "manaCost", value);
}

function addCastTime(row, item) {
	var value = getValueForProperty(item, "Cast Time");
    appendNewCellWithTextAndClass(row, value, "castTime", value.split(" ")[0]);
}

function addSkillType(row, item) {
    var text = "";
    for (var property in item.properties) {
        // need to identify names like "Totem, Aura, Spell, AoE, Duration"
        // unless we build a list of expected values we could potentially look for presence of a comma
        // right now this seems to be the only requirement without values
        if (item.properties[property].values.length == 0) {
            text = property;
        }
    }

    appendNewCellWithTextAndClass(row, text, "skillType", text);
}

function createHeaders(table, headers) {
    var headerRow = newRow();
    $(headerRow).addClass("headerRow");
    for (var i = 0; i < headers.length; i++) {
        var td = document.createElement("th");

        td.id = headers[i].toLowerCase();
        td.innerHTML = headers[i];
        headerRow.appendChild(td);
    }
    table.appendChild(headerRow);
}

function createSelectedCell(row, item) {
	var td = newCell();
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.name = "selectedItem";
	$(checkbox).attr("data-item-id", item.id);
	td.appendChild(checkbox);
	row.appendChild(td);
}

function createImageCell(row, item) {
    var td = newCell();
    var img = document.createElement("img");
    img.src = item.icon;

    if (item.descrText) {
	    img.title = item.descrText;
	}

    td.appendChild(img);
    row.appendChild(td);
}

function createTitleCell(row, item) {
    var t = item.frameType;
    var type = t == 3 ? "unique" : t == 2 ? "rare" : t == 1 ? "magic" : "normal";
    var className = "name " + type;

    var title = "";
    if (item.name) {
        title += "<strong>" + item.name + "</strong><br />";
    }
    title += item.typeLine;

    var td = appendNewCellWithTextAndClass(row, title, className, item.typeLine);

	if (typeof item.instances === "undefined") {
		td.title = item.inventoryId + " (" + item.x + ", " + item.y + ")";
	} else {
		td.title = getCurrencyTitle(item.instances[0]);
		for (var i = 1; i < item.instances.length; ++i)
			td.title += "\n" + getCurrencyTitle(item.instances[i]);
	}
}

function getCurrencyTitle(item) {
	return "[" + item.quantity + "] " + item.inventoryId + " (" + item.x + ", " + item.y + ")";
}

function createQuantityCell(row, item) {
	appendNewCellWithTextAndClass(row, item.totalQuantity, "quantity", item.totalQuantity);
}

function createModsCell(row, item) {
    var td = newCell();
    td.className = "mods";

    var implicit = getModsText(item.implicitMods);
    var explicit = getModsText(item.explicitMods);

	var html = "";

	if (implicit.length > 0)
		html += "<div class='implicit'>"+implicit+"</div>";

	if (explicit.length > 0 || !item.identified) {
		if (implicit.length > 0)
			html += "<div class='divider'></div>";
		if (explicit.length > 0)
			html += "<div class='explicit'>"+explicit+"</div>";
		else
			html += "<div class='unidentified'>UNIDENTIFIED</div>";
	}

    td.innerHTML = html;
    row.appendChild(td);
}

function getModFormat(mod) {
    return "<span>" + mod.description + "</span>";
}

function getModsText(mods) {
    var modsText = "";
    var modNames = Object.keys(mods);

    if (mods && modNames.length > 0) {
        modsText = getModFormat(mods[modNames[0]]);
        for (var j = 1; j < modNames.length; ++j) {
            modsText += "<br />" + getModFormat(mods[modNames[j]]);

        }
    }
    return modsText;
}

function createSocketsCell(row, item) {
	var text  = "";
	var value = 0;

    if (item.sockets) {
		var groups = [];

		for (var i = 0; i < item.sockets.length; ++i) {
			var socket = item.sockets[i];

			if (socket.group >= groups.length)
				groups[socket.group] = {"S":0, "D":0, "I":0, "G":0, "total":0};

			groups[socket.group][socket.attr]++;
			groups[socket.group].total++;
		}

		for (var i = 0; i < groups.length; ++i) {
			var group = groups[i];

			value += [0,1,7,22,45,53,55][group.total];

			if (i > 0)
				text += "<br />";
			text += "<span class='group'>";

			if (group["S"] > 0) { text += "<span class='S'>"; for (var j = 0; j < group["S"]; ++j) text += "R"; text += "</span>"; }
			if (group["D"] > 0) { text += "<span class='D'>"; for (var j = 0; j < group["D"]; ++j) text += "G"; text += "</span>"; }
			if (group["I"] > 0) { text += "<span class='I'>"; for (var j = 0; j < group["I"]; ++j) text += "B"; text += "</span>"; }
			if (group["G"] > 0) { text += "<span class='G'>"; for (var j = 0; j < group["G"]; ++j) text += "W"; text += "</span>"; }

			text += "</span>";
		}
    }

	appendNewCellWithTextAndClass(row, text, "sockets", value);
}

function getRequirement(item, type) {
    if (item.requirements) {
        for (var i = 0; i < item.requirements.length; i++) {
            var req = item.requirements[i];
            if (req["name"] == type) {
                return req["values"][0][0];
            }
        }
    }
    return 0;
}

function createDexCell(row, item) { createRequirementCell(row, item, "Dex"); }
function createIntCell(row, item) { createRequirementCell(row, item, "Int"); }
function createStrCell(row, item) { createRequirementCell(row, item, "Str"); }
function createLevelCell(row, item) {
    createRequirementCell(row, item, "Level");
//    var req = getRequiredLevel(item);
//    var old = getRequirement(item, "Level");
//    if (req != old && req && old && item.frameType != 3 && old.indexOf("(gem)") == -1)
//        console.log("cmp", item, req, old, mistake_count++);
//    appendNewCellWithTextAndClass(row, req, "level", req);
}

var mistake_count = 0;
function createRequirementCell(row, item, reqName) {
    var req = getRequirement(item, reqName);
    appendNewCellWithTextAndClass(row, req, reqName.toLowerCase().replace(" ", ""), req);
}

function appendNewCellWithTextAndClass(row, text, className, sortValue) {
    var td = newCell();
    td.className = className;
    $(td).attr("data-sortValue", sortValue);
    td.innerHTML = text;
    row.appendChild(td);
    return td;
}

function newRow() {
    var row = document.createElement("tr");
	return row;
}

function newItemRow(itemId) {
    var row = document.createElement("tr");
    $(row).attr("id", itemId);
	$(row).addClass("itemRow");
	return row;
}

function newCell() {
    return document.createElement("td");
}

function buildPage() {
    var title = $("<h1>Stash Inventory</h1>");

    var addStatRankings = $("<div id='addStatRankings'>add stat rankings</div>");
    var showSelected = $("<div id='showSelected'>show selected</div>");
    var filter = $("<div id='filterMenuButton'>filter</div>");
    var actions = $("<div id='actions'></div>");
    actions.append(addStatRankings);
    actions.append(showSelected);
    actions.append(filter);

    var searchBox = $("<div id='searchBoxContainer'><input id='searchBox' type='text' placeholder='Search...' autofocus /><div id='clearSearch'>x</div></div>");
    var infoBox = $("<div id='infoBox'></div>");
    var overlay = $("<div id='overlay'></div>"); // background for dialog boxes

    var interactions = $("<div id='interactions'></div>");
    interactions.append(title);
    interactions.append(actions);
    interactions.append(searchBox);
    interactions.append(infoBox);
    interactions.append(overlay);

    $("body").html(interactions);

    $("#tabView").keypress(function(e) {
        if (!$("#searchBox").is(":focus")) {
            $("#searchBox").focus();
        }
    });

	var tabView = $("<div></div>").attr("id", "tabView");
	tabView.append($("<ul></ul>").attr("id", "tabNames"));
	tabView.append($("<div></div>").attr("id", "tabContents"));
	$("body").append(tabView);

	handleSelectedSummary();

	for (var t in tables) {
		tables[t].dom = buildTable(tables[t]["name"], tables[t]["idName"], tables[t]["columns"]);
	}

	attachHandlers();
}

function buildTable(titleText, idName, headers) {
 	var tab = $("<li></li>");
	tab.html(titleText);
	tab.attr("href", "#"+idName);
	$("#tabNames").append(tab);

    var table = document.createElement("table");
    table.id = idName;
    table.className = "stash";

    createHeaders(table, headers);

    $("#tabContents").append(table);

	return table;
}

/*
    WeaponInfo
        - name
        - baseItem
        - baseWeaponDps
        - attacksPerSecond
        - dps

        - physical
        - fire
        - cold

        - lightning
*/

function getItemBaseName(typeLine, itemList) {
    var name = typeLine;

    if (isItemInList(name, itemList)) return name;

    // search for and remove suffix
    var end = name.indexOf(" of ");
    if (end != -1) name = name.substring(0, end);

    if (isItemInList(name, itemList)) return name;

    // iteratively remove prefixes
    var start = 0;
    while ((start = name.indexOf(" ", start)) != -1) {
        name = name.substring(start + 1);

        if (isItemInList(name, itemList)) return name;
    }

    return false;
}

function isItemInList(item, list) {
    if (list instanceof Array) {
        return list.indexOf(item) >= 0;
    }
    return typeof list[item] !== "undefined";
}
