var stashData = {};

function insertStylesheet() {
    var style = window.document.createElement("link");
	style.rel = "stylesheet";
	style.type="text/css";
	style.href=BASE_URL+"/css/main.css?_v=3";
    $("head")[0].appendChild(style);
}
 
var existingItems = [];
 
function ready() {
    insertStylesheet();
 
    if ($("pre").length > 0) {
        existingItems = JSON.parse($("pre").html()).items;
    }
 
    $("body").html("<h2>Loading...</h2>");
 
	buildPage();
	requestCharacterData();
    requestStashData("Standard");
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
	var row = newRow();

	for (var c = 0; c < table.columns.length; ++c) {
		({
			"Icon":    createImageCell,
			"Name":    createTitleCell,
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

function receiveItemData(items) {
	prepareItems(items);
	
	for (var i = 0; i < items.length; ++i) {
		var item = items[i];
		var itemType = item.frameType;

		if (itemType == 5) {
			createRowFor(item, tables["Currency"]);
		} else if (itemType == 4) {
			createRowFor(item, tables["Gems"]);
		} else {
			var name = item.typeLine;
			if (isFlask(name)) {
				createRowFor(item, tables["Flasks"]);
			} else if (isRing(name)) {
				createRowFor(item, tables["Rings"]);
			} else if (isAmulet(name)) {
				createRowFor(item, tables["Amulets"]);
			} else if (!item.properties) {
				createRowFor(item, tables["Belts & Quivers"]);
			} else if (isArmour(item)) {
				createRowFor(item, tables["Armour"]);
			} else if (isWeapon(item)) {
				item.weaponInfo = getWeaponInfo(item);	// HACK
				createRowFor(item, tables["Weapons"]);
			} else {
				console.log("Uncategorised Item", item);
			}
		}
	}
}

var tables = {
	"Gems": {
		"name":    "Gems",
		"idName":  "gems",
		"columns": ["Icon", "Name", "Level", "Quality", "Mods"]
	},
	"Currency": {
		"name":    "Currency",
		"idName":  "currency",
		"columns": ["Icon", "Name", "Mods"]
	},
	"Flasks": {
		"name":    "Flasks",
		"idName":  "flasks",
		"columns": ["Icon", "Name", "Level", "Quality", "Mods"]
	},
	"Amulets": {
		"name":    "Amulets",
		"idName":  "amulets",
		"columns": ["Icon", "Name", "Level", "Mods", "tResist", "eDMG"]
	},
	"Rings": {
		"name":    "Rings",
		"idName":  "rings",
		"columns": ["Icon", "Name", "Level", "Mods", "tResist", "eDMG"]
	},
	"Belts & Quivers": {
		"name":    "Belts & Quivers",
		"idName":  "nonSocket",
		"columns": ["Icon", "Name", "Level", "Mods", "tResist"]
	},
	"Armour": {
		"name":    "Armour",
		"idName":  "gear",
		"columns": ["Icon", "Name", "Level", "Quality", "Sockets", "Mods", "AR", "EV", "ES", "tResist", "eDMG"]
	},
	"Weapons": {
		"name":    "Weapons",
		"isName":  "weapons",
		"columns": ["Icon", "Name", "Level", "Quality", "Sockets", "Mods", "DPS", "pDPS", "eDPS", "CPS", "Inc"]
	}
};
 
function buildPage() {
    $("body").html("");
    var title = document.createElement("h1");
 
    title.innerHTML = "Stash Inventory";
    $("body")[0].appendChild(title);
 
	var tabView = $("<div></div>").attr("id", "tabView");
	tabView.append($("<ul></ul>").attr("id", "tabNames"));
	tabView.append($("<div></div>").attr("id", "tabContents"));
	$("body").append(tabView);
	
	for (var t in tables) {
		tables[t].dom = buildTable(tables[t]["name"], tables[t]["idName"], tables[t]["columns"]);
	}
	
	$("#tabNames li").click(function() {
		$(".selected").removeClass("selected");
		$(this).addClass("selected");
		$("#tabContents table"+$(this).attr("href")).addClass("selected");
	});
	
	$("#tabNames li").first().addClass("selected");
	$("#tabContents table").first().addClass("selected");
}
 
 var rings = { "Iron Ring" : true, "Coral Ring" : true, "Paua Ring" : true, "Gold Ring" : true, "Ruby Ring" : true, "Sapphire Ring" : true, "Topaz Ring" : true, "Diamond Ring" : true, "Moonstone Ring" : true, "Prismatic Ring" : true, "Amethyst Ring" : true, "Two-Stone Ring" : true };
 var amulets = { "Paua Amulet" : true, "Coral Amulet" : true, "Amber Amulet" : true, "Jade Amulet" : true, "Lapis Amulet" : true, "Gold Amulet" : true, "Onyx Amulet" : true, "Agate Amulet" : true, "Turquoise Amulet" : true, "Citrine Amulet" : true };
 
function isFlask(name) { return name.match(/Flask/) != null; }
  
function isRing(name)   { return !!getItemBaseName(name, rings); }
function isAmulet(name) { return !!getItemBaseName(name, amulets); }
 
function isArmour(item) { return !!(item.properties["Evasion Rating"] || item.properties["Armour"] || item.properties["Energy Shield"]); }
function isWeapon(item) { return !!(item.properties["Physical Damage"]); }

var Mods = {
    "Adds (\\d+)-(\\d+) Physical Damage": "Physical Damage",
    "Adds (\\d+)-(\\d+) Cold Damage": "Cold Damage",
    "Adds (\\d+)-(\\d+) Lightning Damage": "Lightning Damage",
    "Adds (\\d+)-(\\d+) Fire Damage": "Fire Damage",
    "(\\d+)% Increased Physical Damage": "+% Local Physical Damage",
    "(\\d+)% Increased Critical Strike Chance": "+% Local Critical Strike",
    "(\\d+)% Increased Attack Speed": "+% Local Attack Speed",
	"\\+(\\d+)% to Cold Resistance": "+% Cold Resistance",
	"\\+(\\d+)% to Lightning Resistance": "+% Lightning Resistance",
	"\\+(\\d+)% to Fire Resistance": "+% Fire Resistance",
	"\\+(\\d+)% to all Elemental Resistances": "+% All Resistances",
	"\\+(\\d+)% to Cold and Lightning Resistances": "+% Cold and Lightning Resistances",
	"\\+(\\d+)% to Fire and Cold Resistances":      "+% Fire and Cold Resistances",
	"\\+(\\d+)% to Fire and Lightning Resistances": "+% Fire and Lightning Resistances",
};
 
function parseMods(descriptions) {
    function parseMod(description) {
        var generic = description
			.replace(/\+/g, "\\+")
			.replace(/\d+/g, "(\\d+)");
 
        if (typeof Mods[generic] !== "undefined") {
            return {
                "name": Mods[generic],
                "description": description,
                "values": description.match(generic).slice(1),
                "parsed": true
            }
        }
 
        return {
            "name": description,
            "description": description,
            "parsed": false
        };
    }
 
    var mods = {};
 
    for (var i in descriptions) {
        var mod = parseMod(descriptions[i]);
        mods[mod.name] = mod;
    }
 
    return mods;
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
 
    attachHandlers();
	
	return table;
}

function getTotalResistances(item) {
	var tResist = 0;
	
	if (item.implicitMods["+% Cold Resistance"     ]) tResist += parseInt(item.implicitMods["+% Cold Resistance"     ].values[0]);
	if (item.implicitMods["+% Lightning Resistance"]) tResist += parseInt(item.implicitMods["+% Lightning Resistance"].values[0]);
	if (item.implicitMods["+% Fire Resistance"     ]) tResist += parseInt(item.implicitMods["+% Fire Resistance"     ].values[0]);
	if (item.implicitMods["+% All Resistances"     ]) tResist += parseInt(item.implicitMods["+% All Resistances"     ].values[0]) * 3;
	
	if (item.implicitMods["+% Cold and Lightning Resistances"]) tResist += parseInt(item.implicitMods["+% Cold and Lightning Resistances"].values[0]) * 2;
	if (item.implicitMods["+% Fire and Cold Resistances"     ]) tResist += parseInt(item.implicitMods["+% Fire and Cold Resistances"     ].values[0]) * 2;
	if (item.implicitMods["+% Fire and Lightning Resistances"]) tResist += parseInt(item.implicitMods["+% Fire and Lightning Resistances"].values[0]) * 2;
	
	if (item.explicitMods["+% Cold Resistance"     ]) tResist += parseInt(item.explicitMods["+% Cold Resistance"     ].values[0]);
	if (item.explicitMods["+% Lightning Resistance"]) tResist += parseInt(item.explicitMods["+% Lightning Resistance"].values[0]);
	if (item.explicitMods["+% Fire Resistance"     ]) tResist += parseInt(item.explicitMods["+% Fire Resistance"     ].values[0]);
	if (item.explicitMods["+% All Resistances"     ]) tResist += parseInt(item.explicitMods["+% All Resistances"     ].values[0]) * 3;
	
	return tResist;
}

function getElementalDamage(item) {
	var eDMG = [0, 0];
	
	if (item.explicitMods["Cold Damage"     ]) { eDMG[0] += parseInt(item.explicitMods["Cold Damage"     ].values[0]); eDMG[1] += parseInt(item.explicitMods["Cold Damage"     ].values[1]); }
	if (item.explicitMods["Lightning Damage"]) { eDMG[0] += parseInt(item.explicitMods["Lightning Damage"].values[0]); eDMG[1] += parseInt(item.explicitMods["Lightning Damage"].values[1]); }
	if (item.explicitMods["Fire Damage"     ]) { eDMG[0] += parseInt(item.explicitMods["Fire Damage"     ].values[0]); eDMG[1] += parseInt(item.explicitMods["Fire Damage"     ].values[1]); }
	
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
	var ar  = item.properties["Armour"       ] ? parseInt(item.properties["Armour"        ].values[0]) : 0;
	appendNewCellWithTextAndClass(row, ar, "ar", ar);
 }
 
 function addEvasion(row, item) {
	var ev = item.properties["Evasion Rating"] ? parseInt(item.properties["Evasion Rating"].values[0]) : 0;
	appendNewCellWithTextAndClass(row, ev, "ev", ev);
 }
 
 function addEnergyShield(row, item) {
	var es = item.properties["Energy Shield" ] ? parseInt(item.properties["Energy Shield"  ].values[0]) : 0;
	appendNewCellWithTextAndClass(row, es, "es", es);
 }
 
 function addDPS(row, item) {
	var dps = item.weaponInfo.dps.toFixed(1);
	appendNewCellWithTextAndClass(row, dps, "dps", dps);
 }
 
 function addPDPS(row, item) {
	var pdps = item.weaponInfo.pdps.toFixed(1);
	appendNewCellWithTextAndClass(row, pdps, "pdps", pdps);
 }
 
 function addEDPS(row, item) {
	var edps = item.weaponInfo.edps.toFixed(1);
	appendNewCellWithTextAndClass(row, edps, "edps", edps);
 }
 
 function addCPS(row, item) {
	var cps = item.weaponInfo.cps.toFixed(1);
	appendNewCellWithTextAndClass(row, cps, "cps", cps);
 }
 
 function addpIncreaseDPS(row, item) {
	var pIncreaseDps = item.weaponInfo.pIncreaseDps.toFixed(1);
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
    img.title = item.descrText;
 
    td.appendChild(img);
    row.appendChild(td);
}
 
function createTitleCell(row, item) {
    var td = newCell();
 
    var t = item.frameType;
    var type = t == 3 ? "unique" : t == 2 ? "rare" : t == 1 ? "magic" : "normal";
    td.className = "title " + type;
    td.title = item.inventoryId + " (" + item.x + ", " + item.y + ")";
 
 
    var title = "";
    if (item.name) {
        title += "<strong>" + item.name + "</strong><br />";
    }
    td.innerHTML = title + item.typeLine;
 
    row.appendChild(td);
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
			html += "<hr />";
		if (explicit.length > 0)
			html += "<div class='explicit'>"+explicit+"</div>";
		else
			html += "<div class='unidentified'>UNIDENTIFIED</div>"
	}
 
    td.innerHTML = html;
    row.appendChild(td);
}
 
function getModFormat(mod) {
    if (!mod.parsed)
        return "<span class='unparsed'>" + mod.description + "</span>";
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
		
		var longest = 0;
		
		for (var i = 0; i < groups.length; ++i) {
			var group = groups[i];
			
			if (group.total > longest)
				longest = group.total;
			
			if (i > 0) 
				text += "<br />";
			text += "<span class='group'>";

			if (group["S"] > 0) { text += "<span class='S'>"; for (var j = 0; j < group["S"]; ++j) text += "R"; text += "</span>"; }
			if (group["D"] > 0) { text += "<span class='D'>"; for (var j = 0; j < group["D"]; ++j) text += "G"; text += "</span>"; }
			if (group["I"] > 0) { text += "<span class='I'>"; for (var j = 0; j < group["I"]; ++j) text += "B"; text += "</span>"; }
			
			text += "</span>";
		}
		
		value = longest * 10 + item.sockets.length;
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
}
 
function newRow() {
    return document.createElement("tr");
}
 
function newCell() {
    return document.createElement("td");
}
 
function attachHandlers() {
    $(".stash th").click(function () {
        var table = $(this).parents("table");
        var col = $(this).attr("id");
        var header = table.find("#headerRow");
		header.removeClass("unsorted");
       
        var rows = table.find("td." + col).parents("tr");
        
		rows.sort(function(a, b) {
			return getValue(a, col) - getValue(b, col);
		});
		
		for (var i = 0; i < rows.length; ++i) {
			table.prepend(rows[i]);
		}
	});
}

function getValue(row, col) {
    return parseInt($(row).find("td." + col + " input[name='sortValue']").val()) || 0; 
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
 
    if (typeof itemList[name] !== "undefined") return name;
 
    // search for and remove suffix
    var end = name.indexOf(" of ");
    if (end != -1) name = name.substring(0, end);
 
    if (typeof itemList[name] !== "undefined") return name;
 
    // iteratively remove prefixes
    var start = 0;
    while ((start = name.indexOf(" ", start)) != -1) {
        name = name.substring(start + 1);
 
        if (typeof itemList[name] !== "undefined") return name;
    }
 
    return false;
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