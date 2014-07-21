var stashData = {};

$.expr[':'].containsIgnoreCase = function (n, i, m) {
    return jQuery(n).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};
	
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
			"eDMG":    addItemElementalDamage
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

	showAnyItemNameRepeats();
}

function showAnyItemNameRepeats() {
	var duplicates = "";
	for (var name in itemNames) {
		if (itemNames[name] > 1) {
			duplicates = duplicates + name + " (" + itemNames[name] + ") ";
		}
	}
	if (duplicates.length > 0) {
		$("#infoBox").html("Item name repeats: " + duplicates);
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

var tables = {
	"gems": {
		"name":    "Gems",
		"idName":  "gems",
		"columns": ["Icon", "Name", "Level", "Quality", "Mods"]
	},
	"currency": {
		"name":    "Currency",
		"idName":  "currency",
		"columns": ["Icon", "Quantity", "Name", "Mods"]
	},
	"flasks": {
		"name":    "Flasks",
		"idName":  "flasks",
		"columns": ["Icon", "Name", "Level", "Quality", "Mods"]
	},
	"amulets": {
		"name":    "Amulets",
		"idName":  "amulets",
		"columns": ["Icon", "Name", "Level", "Mods", "tResist", "eDMG"]
	},
	"rings": {
		"name":    "Rings",
		"idName":  "rings",
		"columns": ["Icon", "Name", "Level", "Mods", "tResist", "eDMG"]
	},
	"belts": {
		"name":    "Belts",
		"idName":  "belts",
		"columns": ["Icon", "Name", "Level", "Mods", "tResist"]
	},
	"quivers": {
		"name":    "Quivers",
		"idName":  "quivers",
		"columns": ["Icon", "Name", "Level", "Mods", "tResist", "eDMG"]
	},
	"boots": {
		"name":    "Boots",
		"idName":  "boots",
		"columns": ["Icon", "Name", "Level", "Quality", "Sockets", "Mods", "AR", "EV", "ES", "tResist", "eDMG"]
	},
	"gloves": {
		"name":    "Gloves",
		"idName":  "gloves",
		"columns": ["Icon", "Name", "Level", "Quality", "Sockets", "Mods", "AR", "EV", "ES", "tResist", "eDMG"]
	},
	"helmets": {
		"name":    "Helmets",
		"idName":  "helmets",
		"columns": ["Icon", "Name", "Level", "Quality", "Sockets", "Mods", "AR", "EV", "ES", "tResist", "eDMG"]
	},
	"armour": {
		"name":    "Armour",
		"idName":  "armour",
		"columns": ["Icon", "Name", "Level", "Quality", "Sockets", "Mods", "AR", "EV", "ES", "tResist", "eDMG"]
	},
	"weapons": {
		"name":    "Weapons",
		"idName":  "weapons",
		"columns": ["Icon", "Name", "Level", "Quality", "Sockets", "Mods", "DPS", "pDPS", "eDPS", "CPS", "Inc"]
	},
	"shields": {
		"name":    "Shields",
		"idName":  "shields",
		"columns": ["Icon", "Name", "Level", "Quality", "Sockets", "Mods", "tResist"]
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

function addItemElementalDamage(row, item) {
	var eDMG = getElementalDamage(item);
	appendNewCellWithTextAndClass(row, (eDMG[0] || eDMG[1]) ? eDMG[0]+"-"+eDMG[1] : 0, "edmg", eDMG[0] + eDMG[1]);
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
 
function createLevelCell(row, item) {
    var level = getRequirement(item, "Level");
    appendNewCellWithTextAndClass(row, level, "level", level);
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
		search($(this).find("input").val());
	});
	
	$("#searchBox #clearSearch").click(function() {
		$(".stash").hide();
		$("tr").show();
		$("#searchBox input").val("");
		
		showTableForSelectedTab();
//		$("#searchBox input").val("");
//		$("tr.itemRow").removeClass("searchFilter");
	});
}

function search(searchString) {
	$(".stash").show();
	$("tr").hide();
	$("tr:contains('" + searchString + "')").show();
	$("#tabNames .selected").removeClass("selected");
	
	var tablesWithRowsInSearch = $("table.stash tr:visible").parents("table.stash");
	$(".stash").hide();
	tablesWithRowsInSearch.show();
	tablesWithRowsInSearch.find("#headerRow").show();
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
    return $(row).find("td." + col + " input[name='sortValue']").val() || 0;
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

function getWeaponBaseName(typeLine) {
	return getItemBaseName(typeLine, baseWeapons);
}
 
function getWeaponInfo(item) {
    var baseWeapon = baseWeapons[getWeaponBaseName(item.typeLine)];
 
    if (baseWeapon == null) {
        return null;
    }
 
    var weaponInfo = {};
 
    weaponInfo.name = item.name;
    weaponInfo.baseItem = baseWeapon["Name"];
 
    weaponInfo.baseWeaponDps = ((baseWeapon["DamageMin"] + baseWeapon["DamageMax"]) / 2 * baseWeapon["AttacksPerSecond"]).toFixed(1);
 
    addWeaponDamages(item, weaponInfo);
 
    weaponInfo.attacksPerSecond = parseFloat(getItemProperty(item, "Attacks per Second").values[0][0]);
	weaponInfo.cps  = weaponInfo.attacksPerSecond * parseFloat(getItemProperty(item, "Critical Strike Chance").values[0][0]);
	weaponInfo.pdps = weaponInfo.attacksPerSecond * weaponInfo.physical.avg;
	weaponInfo.edps = weaponInfo.attacksPerSecond * weaponInfo.elemental.avg;
    weaponInfo.dps = weaponInfo.pdps + weaponInfo.edps;
    weaponInfo.pIncreaseDps = ((weaponInfo.dps / weaponInfo.baseWeaponDps) - 1) * 100;
 
    return weaponInfo;
}
 
function addWeaponDamages(item, weaponInfo) {
    var physicalDamage = getItemProperty(item, "Physical Damage");
    weaponInfo.physical = getValueRange(physicalDamage.values[0][0]);
    weaponInfo.elemental = { "min": 0, "max": 0, "avg": 0 };
	
    var elementalDamages = getItemProperty(item, "Elemental Damage");
    if (elementalDamages != null) {
        for (var i in elementalDamages.values) {
 
            elementalDamage = elementalDamages.values[i];
            range = getValueRange(elementalDamage[0]);
            if (elementalDamage[1] == 4) {
                weaponInfo.fire = range;
                weaponInfo.fire.avg = range.avg;
            } else if (elementalDamage[1] == 5) {
                weaponInfo.cold = range;
                weaponInfo.cold.avg = range.avg;
            } else if (elementalDamage[1] == 6) {
                weaponInfo.lightning = range;
                weaponInfo.lightning.avg = range.avg;
 
            }
 
            weaponInfo.elemental.min += range.min;
            weaponInfo.elemental.max += range.max;
            weaponInfo.elemental.avg += range.avg;
        }
    }
}
 
function getItemProperty(item, desiredProperty) {
    var properties = item.properties;
 
    for (var i in properties) {
 
        property = properties[i];
        if (property.name == desiredProperty) {
            return property;
        }
    }
}
 
function getValueRange(rangeString) {
    var range = {};
    var values = rangeString.split("-");
    range.min = parseInt(values[0]);
 
    range.max = parseInt(values[1]);
 
    range.avg = ((range.min + range.max) / 2);
    range.label = rangeString
 
    return range;
}
