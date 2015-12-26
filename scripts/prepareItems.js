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
		if (modTypesComboConversion[modName]) {
			flattenComboModForItem(item, modName, values);
		} else {
			addValuesForMods(item, modName, values);
		}
	}
	sumResistanceStats(item);
	handleDefenseStats(item);
}

function flattenComboModForItem(item, comboModName, comboModValue) {
	var comboModList = modTypesComboConversion[comboModName];

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

function sumResistanceStats(item) {
	var total = 0;
	for (var i = 0; i < resistances.length; i++) {
		var resistance = resistances[i];
		if (item.stats[resistance]) {
			total += parseInt(item.stats[resistance][0]);
		}
	}
	item.stats[totalResistance] = total;
}

function handleDefenseStats(item) {
	for (var i = 0; i < defenseProperties.length; i++) {
		var propertyName = defenseProperties[i];
		var property = item.properties[propertyName];
		if (property) {
			// if the item has the property then any mods are local and will already be computed into it
			// this copy the property value into stats and remove the local stats that modify it
			item.stats[propertyName] = property.values[0][0];
			removeStatsFromItem(item, defenseStats);
		}
	}
}

function removeStatsFromItem(item, statsToRemove) {
	for (var i = 0; i < statsToRemove.length; i++) {
		var statName = statsToRemove[i];
		if (item.stats[statName]) {
			delete item.stats[statName];
		}
	}
}

// ----------------------------------------------------------------- DAMAGE STATS
var addsPhysicalDamage =	"Adds #-# Physical Damage";
var addsColdDamage = 		"Adds #-# Cold Damage";
var addsLightningDamage =   "Adds #-# Lightning Damage";
var addsFireDamage =		"Adds #-# Fire Damage";
var addsChaosDamage = 		"Adds #-# Chaos Damage";

var damageTypes = [
    addsPhysicalDamage,
    addsColdDamage,
    addsLightningDamage,
    addsFireDamage,
    addsChaosDamage
];

// ----------------------------------------------------------------- DEFENSE STATS
var increasedArmour =		"#% increased Armour";
var increasedEvasion =		"#% increased Evasion Rating";
var increasedEnergyShield =	"#% increased Energy Shield";

var addedArmour = 			"+# to Armour";
var addedEvasion = 			"+# to Evasion Rating";
var addedEnergyShield = 	"+# to Energy Shield";

var defenseProperties = [
    "Armour",
    "Evasion Rating",
    "Energy Shielf"
];

var defenseStats = [
	increasedArmour,
	increasedEvasion,
	increasedEnergyShield,
	addedArmour,
	addedEvasion,
	addedEnergyShield
];

// ----------------------------------------------------------------- ATTRIBUTE STATS
var intelligence =			"+# to Intelligence";
var strength =				"+# to Strength";
var dexterity = 			"+# to Dexterity";

var attributes = [
	intelligence,
	strength,
	dexterity
];

// ----------------------------------------------------------------- RESISTANCE STATS
var coldResistance = 		"+#% to Cold Resistance";
var lightningResistance = 	"+#% to Lightning Resistance";
var fireResistance = 		"+#% to Fire Resistance";
var chaosResistance = 		"+#% to Chaos Resistance";

var totalResistance = 		"Total Resistance";

var resistances = [
	coldResistance,
	lightningResistance,
	fireResistance,
	chaosResistance
];

var modTypesComboConversion = {
		"+#% to all Elemental Resistances" : [coldResistance, lightningResistance, fireResistance],
		"+#% to Cold and Lightning Resistances" : [coldResistance, lightningResistance],
		"+#% to Fire and Cold Resistances" : [fireResistance, coldResistance],
		"+#% to Fire and Lightning Resistances" : [fireResistance, lightningResistance],

		"+# to Strength and Dexterity" : [strength, dexterity],
		"+# to Strength and Intelligence" : [strength, intelligence],
		"+# to Dexterity and Intelligence" : [dexterity, intelligence],
		"+# to all Attributes" : [strength, dexterity, intelligence],

		"#% increased Armour and Evasion" : [increasedArmour, increasedEvasion],
		"#% increased Armour and Energy Shield" : [increasedArmour, increasedEnergyShield],
		"#% increased Evasion and Energy Shield" : [increasedEvasion, increasedEnergyShield]
};
