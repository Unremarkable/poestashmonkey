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
	style.href=BASE_URL+"/css/main.css?_v=3";
    $("head")[0].appendChild(style);
}

var existingItems = [];

function getParameterByName(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

function ready() {
    insertStylesheet();

    if ($("pre").length > 0) {
        existingItems = JSON.parse($("pre").html()).items;
    }

    $("body").html("<h2>Loading...</h2>");

	var league = getParameterByName("league") || "Standard";

	buildPage();
	requestCharacterData(league);
    requestStashData(league);

    // does not work yet
    // fetchCurrencyConversionTable();
};

function prepareItems(items) {
	for (var i = 0; i < items.length; ++i) {
		var item = items[i];

		if (item.prepared)
			return;
		item.prepared = true;

		if (item.properties) {
			var temp = item.properties;
			item.properties = {};

			for (var p = 0; p < temp.length; ++p) {
				item.properties[temp[p].name] = temp[p];
			}
		} else {
			item.properties = [];
		}

		item.implicitMods = parseMods(item.implicitMods);
		item.explicitMods = parseMods(item.explicitMods);

		if (typeof item["socketedItems"] !== "undefined") {
			for (var j = 0; j < item["socketedItems"].length; ++j) {
				var socketedItem = item["socketedItems"][j];
				socketedItem.inventoryId = item.inventoryId;
				socketedItem.x = item.x;
				socketedItem.y = item.y;
				items.push(socketedItem);
			}
		}
	}
}

function createRowFor(item, table) {
	var row = newItemRow();

	for (var c = 0; c < table.columns.length; ++c) {
		({
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
            "AffixRating": addAffixRating
		})[table.columns[c]](row, item);
	}

	table.dom.appendChild(row);
}

var currency = [];
var itemNames = [];

function receiveItemData(items) {
	prepareItems(items);

	for (var i = 0; i < items.length; ++i) {
		var item = items[i];
		var itemType = item.frameType;
		var name = item.typeLine
		addNameToList(item.name);

		// note, frameType 6 are green items (ie in game things like "Sewer Keys")

		if (itemType == 5) {
			addCurrency(item);
		} else if (itemType == 4) {
			createRowFor(item, tables["gems"]);
		} else {
			if (isFlask(name)) {
				createRowFor(item, tables["flasks"]);
			} else if (isRing(name)) {
				createRowFor(item, tables["rings"]);
			} else if (isAmulet(name)) {
				createRowFor(item, tables["amulets"]);
			} else if (isMap(item)) {
				createRowFor(item, tables["maps"]);
			} else if (isBelt(name)) {
				createRowFor(item, tables["belts"]);
			} else if (isQuiver(name)) {
				createRowFor(item, tables["quivers"]);
			} else if (isBoots(name)) {
				createRowFor(item, tables["boots"]);
			} else if (isGloves(name)) {
				createRowFor(item, tables["gloves"]);
			} else if (isHelmet(name)) {
				createRowFor(item, tables["helmets"]);
			} else if (isShield(item)) {
				createRowFor(item, tables["shields"]);
			} else if (isArmour(item)) {
				createRowFor(item, tables["armour"]);
			} else if (isWeapon(item)) {
				item.weaponInfo = getWeaponInfo(item);	// HACK
				createRowFor(item, tables["weapons"]);
			} else {
				createRowFor(item, tables["uncategorized"]);
				console.log("Uncategorized Item", item);
			}
		}
	}
}

function addNameToList(name) {
	if (name) {
		var count = 1;
		if (itemNames[name]) {
			count += itemNames[name];
		}
		itemNames[name] = count;
	}
}

function receiveStashDataFinished() {
	for (var item in currency) {
		createRowFor(currency[item], tables["currency"]);
	}

	if ($("#uncategorized").length > 1) {
		$("li[href='#uncategorized']").show();
	}

	$("#tabNames li").first().addClass("selected");
	showTableForSelectedTab();

    showCapacityUsed();
	showAnyItemNameRepeats();
}

// The capacity is based on how much space all of the items in the stash tabs take up.
function showCapacityUsed() {
    var capacityUsed = 0;
    var totalTabs = 0;

    for (var league in stashData) {
        for (var tab in stashData[league]) {
            totalTabs++;
            var items = stashData[league][tab].items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                capacityUsed += item.w * item.h;
            }
        }
    }

    var capacityUtilized = Math.round(capacityUsed / (totalTabs * 144) * 100);
    $("#infoBox").append("<div id='capacityUsed'>Capacity Utilized: " + capacityUtilized + "% (across " + totalTabs + " tabs)</div>");
}

function showAnyItemNameRepeats() {
	var duplicates = "";
	for (var name in itemNames) {
		if (itemNames[name] > 1) {
			duplicates = duplicates + name + " (" + itemNames[name] + ") ";
		}
	}
	if (duplicates.length > 0) {
		$("#infoBox").append("<div id='duplicates'>Item name repeats: " + duplicates + "</div>");
	}
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

	currency[name].instances.push(item);
	currency[name].totalQuantity += item.quantity;
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

var basicColumns = ["Icon", "Name", "Level"];
var accesoriesColumns  =  basicColumns.concat(["Mods", "tResist", "AffixRating"]);
var accesoriesColumnsWithDamage = accesoriesColumns.concat(["eDMG"]);
var advancedColumns = basicColumns.concat(["Str", "Int", "Dex", "Quality", "Sockets", "Mods", "AffixRating"]);
var gearColumns =  advancedColumns.concat(["AR", "EV", "ES", "tResist", "eDMG"]);

var tables = {
	"gems": {
		"name":    "Gems",
		"idName":  "gems",
		"columns": basicColumns.concat(["Str", "Int", "Dex", "Quality", "Mods"])
	},
	"currency": {
		"name":    "Currency",
		"idName":  "currency",
		"columns": ["Icon", "Quantity", "Name", "Mods"]
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
		"columns": advancedColumns.concat(["DPS", "pDPS", "eDPS", "CPS", "Inc"])
	},
	"shields": {
		"name":    "Shields",
		"idName":  "shields",
		"columns": advancedColumns.concat(["tResist"])
	},
	"maps": {
		"name":    "Maps",
		"idName":  "maps",
		"columns": ["Icon", "Name", "Mods", "Quality"]
	},
	"uncategorized": {
		"name":    "Uncategorized",
		"idName":  "uncategorized",
		"columns": ["Icon", "Name", "Mods"]
	}
};

 var rings = ["Iron Ring", "Coral Ring", "Paua Ring", "Gold Ring", "Ruby Ring", "Sapphire Ring", "Topaz Ring", "Diamond Ring", "Moonstone Ring", "Prismatic Ring", "Amethyst Ring", "Two-Stone Ring", "Unset Ring"];
 var amulets = ["Paua Amulet", "Coral Amulet", "Amber Amulet", "Jade Amulet", "Lapis Amulet", "Gold Amulet", "Onyx Amulet", "Agate Amulet", "Turquoise Amulet", "Citrine Amulet"];

function isFlask(name) { return name.match(/Flask/) != null; }

function isRing(name)   { return getItemBaseName(name, rings); }
function isAmulet(name) { return getItemBaseName(name, amulets); }

function isQuiver(name) { return name.match(/Quiver/) != null; }
function isBelt(name) { return name.match(/Belt|Sash/) != null; }

function isGloves(name) { return name.match(/Mitts|Gloves|Gauntlets/) != null; }
function isBoots(name) { return name.match(/Boots|Slippers|Shoes|Greaves/) != null; }
function isHelmet(name) { return name.match(/Cage|Mask|Helmet|Sallet|Hood|Tricorne|Helm|Circlet|Cap|Pelt|Burgonet|Bascinet|Crown|Coif|Hat/) != null; }

function isArmour(item) { return (item.properties["Evasion Rating"] || item.properties["Armour"] || item.properties["Energy Shield"]); }

function isWeapon(item) { return (item.properties["Physical Damage"]); }

function isShield(item) { return (item.properties["Chance to Block"]); }

function isMap(item) { return (item.properties["Map Level"]); }

function parseMods(descriptions) {
    var mods = {};

    for (var i in descriptions) {
        var mod = {
			"description": descriptions[i],
			"name":        descriptions[i].replace(/\d+/g, "#"),
			"values":      descriptions[i].match  (/\d+/g),
		};

        mods[mod.name] = mod;
    }

    return mods;
}

var resistTypes = {
		"+#% to Cold Resistance" : 1,
		"+#% to Lightning Resistance" : 1,
		"+#% to Fire Resistance" : 1,
		"+#% to Chaos Resistance" : 1,
		"+#% to all Elemental Resistances" : 3,
		"+#% to Cold and Lightning Resistances" : 2,
		"+#% to Fire and Cold Resistances" : 2,
		"+#% to Fire and Lightning Resistances" : 2
};

function getTotalResistances(item) {
	return addResistsFromMods(item.implicitMods) + addResistsFromMods(item.explicitMods);
}

function addResistsFromMods(modGroup) {
	var tResist = 0;
	for (var type in resistTypes) {
		var mod = modGroup[type];
		var multiplier = resistTypes[type];
		if (mod)
			tResist += parseInt(mod.values[0]) * multiplier;
	}
	return tResist;
}

var damageTypes = [
		"Adds #-# Cold Damage",
		"Adds #-# Lightning Damage",
		"Adds #-# Fire Damage"
];

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

function getAverageAffixLevel(affixes) {
    return Object.min(affixes, function(combination) {
        var sum = 0;
        for (var affix in combination) {
            sum += combination[affix].level;
        }
        return sum / combination.length;
    });
}

function addItemElementalDamage(row, item) {
	var eDMG = getElementalDamage(item);
	appendNewCellWithTextAndClass(row, (eDMG[0] || eDMG[1]) ? eDMG[0]+"-"+eDMG[1] : 0, "edmg", eDMG[0] + eDMG[1]);
}

function addAffixRating(row, item) {
    var baseItem = getBaseItem(item);
    var affixes = getAffixesFor(item, baseItem);
    var average = getAverageAffixLevel(affixes) - baseItem.level;
    average = average? average.toFixed(1) : 0;
    appendNewCellWithTextAndClass(row, average, "AffixRating", average);
}

function getItemQuality(item) {
	return item.properties["Quality"] ? parseInt(item.properties["Quality"].values[0]) : 0;
}

function addItemQuality(row, item) {
	var quality = getItemQuality(item);
	appendNewCellWithTextAndClass(row, quality + "%", "quality", quality);
}

function addTotalResistances(row, item) {
	var tResist = getTotalResistances(item);
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

function createHeaders(table, headers) {
    var headerRow = newRow();
    headerRow.id = "headerRow";
    for (var i = 0; i < headers.length; i++) {
        var td = document.createElement("th");

        td.id = headers[i].toLowerCase();
        td.innerHTML = headers[i];
        headerRow.appendChild(td);
    }
    table.appendChild(headerRow);
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
		function fI(item) {
			return "[" + item.quantity + "] " + item.inventoryId + " (" + item.x + ", " + item.y + ")";
		}
		td.title = fI(item.instances[0]);
		for (var i = 1; i < item.instances.length; ++i)
			td.title += "\n" + fI(item.instances[i]);
	}
}

function createQuantityCell(row, item) {
	appendNewCellWithTextAndClass(row, item.totalQuantity, "quantity", item.quantity);
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
			html += "<div class='unidentified'>UNIDENTIFIED</div>"
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
		var total  = 0;

		for (var i = 0; i < item.sockets.length; ++i) {
			var socket = item.sockets[i];

			if (socket.group >= groups.length)
				groups[socket.group] = {"S":0, "D":0, "I":0, "total":0};

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
function createLevelCell(row, item) { createRequirementCell(row, item, "Level"); }

function createRequirementCell(row, item, reqName) {
    var req = getRequirement(item, reqName);
    appendNewCellWithTextAndClass(row, req, reqName.toLowerCase(), req);
}

function appendNewCellWithTextAndClass(row, text, className, sortValue) {
    var td = newCell();
    td.className = className;
    if (text) {
        var sortBlurb = sortValue ? "<input type='hidden' name='sortValue' value='" + sortValue + "' />" : "";
        td.innerHTML = sortBlurb + text;
    }
    row.appendChild(td);
    return td;
}

function newRow() {
    var row = document.createElement("tr");
	return row;
}

function newItemRow() {
    var row = document.createElement("tr");
	$(row).addClass("itemRow");
	return row;
}

function newCell() {
    return document.createElement("td");
}

function buildPage() {
    var title = "<h1>Stash Inventory</h1>";
    var searchBox = "<form onSubmit='return false;' id='searchBox'><input type='text' placeholder='Search...' /><div id='clearSearch'>x</div></form>";
    var infoBox = "<div id='infoBox'></div>";
    $("body").html("<div>" + title + searchBox + infoBox + "</div>");

	var tabView = $("<div></div>").attr("id", "tabView");
	tabView.append($("<ul></ul>").attr("id", "tabNames"));
	tabView.append($("<div></div>").attr("id", "tabContents"));
	$("body").append(tabView);

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
