// all of the code needed for pre-processing items before they go to be rendered
function prepareItems(items) {
    for (var i = 0; i < items.length; ++i) {
        var item = items[i];

        if (item.prepared) {
            return;
        }
        item.prepared = true;

        item.baseItem = getBaseItem(item);

        item.typeLine = removeStrangeCharacters(item.typeLine);
        item.name = removeStrangeCharacters(item.name);

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

        if (item.baseItem) {
            item.affixCombinations = getAffixesFor(item, item.baseItem);
            item.affixes = item.affixCombinations[Object.smallest(item.affixCombinations, function(combination) {
                return Object.max(combination, function(affix) {
                    return affix.level;
                });
            })];
        }

        if (typeof item["socketedItems"] !== "undefined") {
            for (var j = 0; j < item["socketedItems"].length; ++j) {
                var socketedItem = item["socketedItems"][j];
                socketedItem.inventoryId = item.inventoryId;
                socketedItem.x = item.x;
                socketedItem.y = item.y;
                items.push(socketedItem);
            }
        }
        
        item.stats = {};
        moveToStats(item, item.implicitMods);
        moveToStats(item, item.explicitMods);
    }
}

function removeStrangeCharacters(text) {
	if (!text) {
		return null;
	}
	var parts = text.split("<<set:MS>><<set:M>><<set:S>>");
	return parts[parts.length -1];
}

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

/* ----------------- STATS PRE-PROCESSING ----------------- */
function moveToStats(item, otherMods) {
	for (var modName in otherMods) {
		var values = otherMods[modName].values;
		if (resistTypesComboConversion[modName]) {
			flattenComboModForItem(item, modName, values);
		} else {
			addValuesForMods(item, modName, values);
		}
	}
}

function flattenComboModForItem(item, comboModName, comboModValue) {
	var comboModList = resistTypesComboConversion[comboModName];

	for (var i = 0; i < comboModList.length; i++) {
		var modName = comboModList[i];
		addValuesForMods(item, modName, comboModValue);
	}
}

function addValuesForMods(item, modName, values) {
	if (item.stats[modName]) {
		values = mergeValuesArrays(values, item.stats[modName]);
	}
	item.stats[modName] = values;
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

var damageTypes = [
  		"Adds #-# Cold Damage",
  		"Adds #-# Lightning Damage",
  		"Adds #-# Fire Damage"
  ];

var coldResistance = 		"+#% to Cold Resistance";
var lightningResistance = 	"+#% to Lightning Resistance";
var fireResistance = 		"+#% to Fire Resistance";
var chaosResistance = 		"+#% to Chaos Resistance";

var resistTypesComboConversion = {
		"+#% to all Elemental Resistances" : [coldResistance, lightningResistance, fireResistance],
		"+#% to Cold and Lightning Resistances" : [coldResistance, lightningResistance],
		"+#% to Fire and Cold Resistances" : [fireResistance, coldResistance],
		"+#% to Fire and Lightning Resistances" : [fireResistance, lightningResistance]
};

// remove once this is part of the precomputed item stats
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
