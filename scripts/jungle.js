var stashData = {};

function insertStylesheet() {
    var text = [
        "body { background-color: #0F0F0F; border-collapse: collapse; color: #A38D6D; font-family: Verdana; font-size: 14px; }",
        "h1, h2 { margin: 15px; }",
 
 
        ".stash { background-color: #26231B; border: 1px solid #1A1812; }",
        "#headerRow { backgronud-color: #332f24; color: #DFCF99; }",
        "#headerRow th { cursor: pointer; font-size: 14px; padding: 4px; text-align: center; }",
 
        "table.stash tr > td, #stash tr > th { background-color: #211F18; border: 1px solid #1A1812; color: #DFCF99; }",
        "table.stash .oddRow { background-color: #26231B; }",
        "table.stash td { color: #A38D6D; font-size: 12; padding: 4px; text-align: center; }",
 
        "table.stash .title { color: #F2C462; }",
        "table.stash img { height: 40px; }",
        "table.stash .mods { color: #A38D6D; }",
        "table.stash .unidentified { color: #833; margin: 4px; }",
        "table.stash .unparsed {font-style: italic}",
 
        "table.stash .sockets .D { color: #719e13; }",
        "table.stash .sockets .I { color: #114181; }",
        "table.stash .sockets .S { color: #9e1328; }",
 
        "table.stash .unique { color: #af6025; }",
        "table.stash .rare { color: #f4f371; }",
        "table.stash .magic { color: #6b6bc8; }",
        "table.stash .normal { color: #b8b8b8; }",
 
        "table.stash .fire { color: #960000; }",
        "table.stash .cold { color: #366492; }",
        "table.stash .lightning { color: #e1be00; }"
 
 
    ].join('\n\n');
 
    var style = window.document.createElement("style");
    $("head")[0].appendChild(style);
    style.innerHTML = text;
}
 
var existingItems = [];
 
function ready() {
    insertStylesheet();
 
    if ($("pre").length > 0) {
        existingItems = JSON.parse($("pre").html()).items;
    }
 
    $("body").html("<h2>Loading...</h2>");
 
//	requestCharacterData();
    requestStashData("Standard");
};

function prepareItems(items) {
	if (this.prepared)
		return;
	this.prepared = true;
	
	for (var i = 0; i < items.length; ++i) {
		var item = items[i];
		
		if (item.properties) {
			var temp = item.properties;
			item.properties = {};
			
			for (var p = 0; p < temp.length; ++p) {
				item.properties[temp[p].name] = temp[p];
			}
		}
		
        item.implicitMods = parseMods(item.implicitMods);
        item.explicitMods = parseMods(item.explicitMods);
	}
}
 
 
function buildPage(items) {
	prepareItems(items);
	
    $("body").html("");
    var title = document.createElement("h1");
 
    title.innerHTML = "Stash Inventory";
    $("body")[0].appendChild(title);
 
    var gems = [];
    var currency = [];
    var flasks = [];
    var rings = [];
    var amulets = [];
    var nonSocketGear = [];
    var gear = [];
    var weapons = [];
 
 
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemType = item.frameType;
 
        if (itemType == 5) {
            currency.push(item);
        } else if (itemType == 4) {
            gems.push(item);
        } else {
            var name = item.typeLine;
            if (isFlask(name)) {
                flasks.push(item);
            } else if (isRing(name)) {
                rings.push(item);
            } else if (isAmulet(name)) {
                amulets.push(item);
            } else if (!item.properties) {
                nonSocketGear.push(item);
            } else if (isArmour(item)) {
                gear.push(item);
            } else if (isWeapon(item)) {
				weapons.push(item);
            } else {
				console.log("Uncategorised Item", item);
                //weapons.push(item);
            }
        }
    }
 
    buildTable(gems, "Gems", "gems");
    buildTable(currency, "Currency", "currency");
    buildTable(flasks, "Flasks", "flasks");
    buildTable(amulets, "Amulets", "amulets");
    buildTable(rings, "Rings", "rings");
    buildTable(nonSocketGear, "Belts & Quivers", "nonSocketGear");
    buildTable(gear, "Gear", "gear");
    buildTable(weapons, "Weapons", "weapons");
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
 
 
function buildTable(items, titleText, idName) {
    if (items.length == 0) return;
 
    var box = document.createElement("div");
 
 
    var title = document.createElement("h2");
    title.innerHTML = titleText;
    box.appendChild(title);
 
 
    var table = document.createElement("table");
    table.id = idName;
    table.className = "stash";
 
    var headers = ["", "Name", "Level", "Mods"];
 
	if (idName == "nonSocketGear" || idName == "rings" || idName == "amulets") {
		headers = headers.concat(["tResist"]);
	} else if (idName == "gear" || idName == "weapons") {
        var gearHeaders = ["Sockets"];
        headers = headers.concat(gearHeaders);
        if (idName == "weapons") {
            var weaponHeaders = ["DPS", "pDPS", "eDPS", "CPS", "Inc"];
            headers = headers.concat(weaponHeaders);
        } else if (idName == "gear") {
			headers = headers.concat(["AR", "EV", "ES", "tResist"]);
		}
    }
 
    createHeaders(table, headers);
 
    var rows = [];
 
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
 
        var row = newRow();
        row.className = i % 2 == 0 ? 'evenRow' : 'oddRow';
 
        createImageCell(row, item);
        createTitleCell(row, item);
        createLevelCell(row, item);
        createModsCell(row, item);

		switch(idName) {
			case "nonSocketGear":
			case "amulets":
			case "rings":   addMiscDetails(row, item);    break;
			case "weapons": createSocketsCell(row, item); addWeaponsDetails(row, item); break;
			case "gear":    createSocketsCell(row, item); addArmourDetails(row, item);  break;
		}
 
        rows.push({
            "item": item,
            "row": row
        });
        //table.appendChild(row);
    }
 
    rows.sort(function (a, b) {
        //    return a.item.typeLine.localeCompare(b.item.typeLine);
        return parseInt(getRequirement(a.item, "Level")) - parseInt(getRequirement(b.item, "Level"));
    });
 
    for (var i = 0; i < rows.length; i++) {
        table.appendChild(rows[i].row);
    }
 
 
    box.appendChild(table);
    $("body")[0].appendChild(box);
 
 
    attachHandlers();
}

function calcTotalResistances(item) {
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

function addMiscDetails(row, item) {
	var tResist = calcTotalResistances(item);
	appendNewCellWithTextAndClass(row, tResist, "tresist", tResist);
}
 
 function addArmourDetails(row, item) {
	var ar  = item.properties["Armour"       ] ? parseInt(item.properties["Armour"        ].values[0]) : 0;
	appendNewCellWithTextAndClass(row, ar, "ar", ar);
	
	var ev = item.properties["Evasion Rating"] ? parseInt(item.properties["Evasion Rating"].values[0]) : 0;
	appendNewCellWithTextAndClass(row, ev, "ev", ev);
	
	var es = item.properties["Energy Shield" ] ? parseInt(item.properties["Energy Shield"  ].values[0]) : 0;
	appendNewCellWithTextAndClass(row, es, "es", es);
	
	var tResist = calcTotalResistances(item);
	appendNewCellWithTextAndClass(row, tResist, "tresist", tResist);
 }
 
function addWeaponsDetails(row, item) {
    // weapon details if applicable
 
    var weaponInfo = getWeaponInfo(item);
    if (weaponInfo) {
        var dps = weaponInfo.dps.toFixed(1);
        appendNewCellWithTextAndClass(row, dps, "dps", dps);
		
		var pdps = weaponInfo.pdps.toFixed(1);
        appendNewCellWithTextAndClass(row, pdps, "pdps", pdps);
		
		var edps = weaponInfo.edps.toFixed(1);
        appendNewCellWithTextAndClass(row, edps, "edps", edps);
		
		var cps = weaponInfo.cps.toFixed(1);
        appendNewCellWithTextAndClass(row, cps, "cps", cps);
       
		var pIncreaseDps = weaponInfo.pIncreaseDps.toFixed(1);
        appendNewCellWithTextAndClass(row, pIncreaseDps + " %", "inc", pIncreaseDps);
  /*     
        var physical = weaponInfo.physical;
        appendNewCellWithTextAndClass(row, physical.label, "physical", physical.avg);
       
        var fire = weaponInfo.fire;
        appendNewCellWithTextAndClass(row, fire ? fire.label : "", "fire", fire ? fire.avg : 0);
       
        var cold = weaponInfo.cold;
        appendNewCellWithTextAndClass(row, cold ? cold.label : "", "cold", cold ? cold.avg : 0);
 
        var light = weaponInfo.lightning;
        appendNewCellWithTextAndClass(row, light ? light.label : "", "lightning", light ? light.avg : 0);
 */
    } else {
        var td = newCell();
        td.colSpan = 6;
        row.appendChild(td);
    }
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
   
    var text = implicit;
    if (implicit.length > 0 && explicit.length > 0) {
        text += "<br /><br />";
    }
    text += explicit;
 
    if (!item.identified) {
        text += "<span class='unidentified'>UNIDENTIFIED</span>";
    }
 
    td.innerHTML = text;
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
    var td = newCell();
    td.className = "sockets";
 
    if (item.sockets) {
        var groups = new Array();
        for (var i = 0; i < item.sockets.length; i++) {
            var socket = item.sockets[i];
            var text = "<span class='" + socket.attr + "'>" + socket.attr + "</span>";
 
            if (groups[socket.group]) {
                text = groups[socket.group] + "-" + text;
            }
            groups[socket.group] = text;
        }
 
        var text = "";
 
        for (var i = 0; i < groups.length; i++) {
            text += groups[i] + "<br />";
        }
        td.innerHTML = text;
    }
    row.appendChild(td);
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
       
        table.find("td." + col).parents("tr").addClass("unsorted");
        header.removeClass("unsorted");
       
        var n = table.find("tr").length;
       
        var top = header;
        for (var i = 1; i < n; i++) {
            var list = table.find("tr.unsorted");
            var lowest = getLowest(list, col);
            lowest.insertAfter(top);
            lowest.removeClass("unsorted");
        }
    });
}
 
function getLowest(items, col) {
    var lowest = items[0];
 
    for (var i = 0; i < items.length; i++) {
        var current = items[i];
        if (getValue(current, col) < getValue(lowest, col)) {
            lowest = current;
        }
    }
	
    return $(lowest);
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