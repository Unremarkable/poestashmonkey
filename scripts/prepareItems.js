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

        if (isWeapon(item)) {
           item.weaponInfo = getWeaponInfo(item);
        }

        if (isSacrifice(item.typeLine)) {
            addStackSizeToProperties(item, 1, 50);
        }

        item.type = getItemType(item);

        item.stats = {};
        moveToStats(item, item.implicitMods);
        moveToStats(item, item.explicitMods);

        addToRankings(item);
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

/* ----------------- ITEM TYPE ----------------- */

//item type name corresponds to the table the item belongs in
function getItemType(item) {
	var itemType = item.frameType;
	var name = item.typeLine;

	if (itemType == 6 && item.properties["Stack Size"]) {
		// type 6 is also in game green items like "Sewer Keys", but those wouldn't have a stack size
		return "cards";
	} else if (itemType == 5) {
		return "currency";
	} else if (itemType == 4) {
		return "gems";
	} else {
		if (isFlask(name)) {
			return "flasks";
		} else if (isRing(name)) {
			return "rings";
		} else if (isAmulet(name)) {
			return "amulets";
		} else if (isTalisman(name)) {
			return "talismans";
		} else if (isMap(item)) {
			return "maps";
		} else if (isSacrifice(name)) {
			return "currency";
		} else if (isBelt(name)) {
			return "belts";
		} else if (isQuiver(name)) {
			return "quivers";
		} else if (isBoots(name)) {
			return "boots";
		} else if (isGloves(name)) {
			return "gloves";
		} else if (isHelmet(name)) {
			return "helmets";
		} else if (isShield(item)) {
			return "shields";
		} else if (isArmour(item)) {
			return "armour";
		} else if (isWeapon(item)) {
			return "weapons";
		} else if (isJewel(name)) {
			return "jewels";
		} else {
			return "uncategorized";
		}
	}
}

var rings = ["Iron Ring", "Coral Ring", "Paua Ring", "Gold Ring", "Ruby Ring", "Sapphire Ring", "Topaz Ring", "Diamond Ring", "Moonstone Ring", "Prismatic Ring", "Amethyst Ring", "Two-Stone Ring", "Unset Ring"];
var amulets = ["Paua Amulet", "Coral Amulet", "Amber Amulet", "Jade Amulet", "Lapis Amulet", "Gold Amulet", "Onyx Amulet", "Agate Amulet", "Turquoise Amulet", "Citrine Amulet"];

var weaponTypes = [
    "Bow",
    "Claw",
    "Dagger",
    "One Handed Axe",
    "One Handed Mace",
    "One Handed Sword",
    "Staff",
    "Two Handed Axe",
    "Two Handed Mace",
    "Two Handed Sword",
    "Wand"
];

function isFlask(name) { return name.match(/Flask/) != null; }

function isRing(name)   { return getItemBaseName(name, rings); }
function isAmulet(name) { return getItemBaseName(name, amulets); }

function isQuiver(name) { return name.match(/Quiver/) != null; }
function isBelt(name) { return name.match(/Belt|Sash/) != null; }

function isJewel(name) { return name.match(/Jewel/) != null; }
function isTalisman(name) { return name.match(/Talisman/) != null; }

function isGloves(name) { return name.match(/Mitts|Gloves|Gauntlets/) != null; }
function isBoots(name) { return name.match(/Boots|Slippers|Shoes|Greaves/) != null; }
function isHelmet(name) { return name.match(/Cage|Mask|Helmet|Sallet|Hood|Tricorne|Helm|Circlet|Cap|Pelt|Burgonet|Bascinet|Crown|Coif|Hat/) != null; }

function isArmour(item) { return (item.properties["Evasion Rating"] || item.properties["Armour"] || item.properties["Energy Shield"] || item.name === "Tabula Rasa"); }

function isWeapon(item) { return (item.properties["Physical Damage"] || item.properties["Elemental Damage"]); }

function isShield(item) { return (item.properties["Chance to Block"]); }

function isMap(item) { return (item.properties["Map Tier"]); }
function isSacrifice(name) { return name.match(/Sacrifice at/) != null; }

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
	if (values) {
		if (values.constructor === Array) {
			var parsedValues = [];
			for (var i = 0; i < values.length; i++) {
				parsedValues.push(parseInt(values[i]));
			}
			if (parsedValues.length == 1) {
				values = parsedValues[0];
			} else {
				values = parsedValues;
			}
		} else {
			values = parseInt(values);
		}
	}

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
			total += item.stats[resistance];
		}
	}
	item.stats[totalResistance] = total;
}

function handleDefenseStats(item) {
	var containedDefenseProperty = false;
	for (var i = 0; i < defenseProperties.length; i++) {
		var propertyName = defenseProperties[i];
		var property = item.properties[propertyName];
		if (property) {
			// if the item has the property then any mods are local and will already be computed into it
			// this copy the property value into stats and remove the local stats that modify it
			item.stats[propertyName] = parseInt(property.values[0][0]);
			containedDefenseProperty = true;
		}
	}
	if (containedDefenseProperty) {
		removeStatsFromItem(item, defenseStats);
	}

	var containedDefenseAddedStat = false;
	for (var i = 0; i < defenseAddedStats.length; i++) {
		var statName = defenseAddedStats[i];
		var stat = item.stats[statName];
		if (stat) {
			// moving base stats to be represented as computed stats for items that don't have that stat as property
			var statNameToAdd = defenseBaseStatToComputedStatConversion[statName];
			item.stats[statNameToAdd] = stat;
			containedDefenseAddedStat = true;
		}
	}
	if (containedDefenseAddedStat) {
		removeStatsFromItem(item, defenseAddedStats);
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
var addsPhysicalDamage =	"Adds #-# Physical Damage to Attacks";
var addsColdDamage = 		"Adds #-# Cold Damage to Attacks";
var addsLightningDamage =	"Adds #-# Lightning Damage to Attacks";
var addsFireDamage =		"Adds #-# Fire Damage to Attacks";
var addsChaosDamage = 		"Adds #-# Chaos Damage to Attacks";

var damageTypes = [
    addsPhysicalDamage,
    addsColdDamage,
    addsLightningDamage,
    addsFireDamage,
    addsChaosDamage
];

// ----------------------------------------------------------------- DEFENSE STATS
var addedArmour = 			"+# to Armour";
var addedEvasionRating =	"+# to Evasion Rating";
var addedEnergyShield = 	"+# to Energy Shield";

var defenseAddedStats = [
    addedArmour,
    addedEvasionRating,
    addedEnergyShield
];

var increasedArmour =		"#% increased Armour";
var increasedEvasion =		"#% increased Evasion Rating";
var increasedEnergyShield =	"#% increased Energy Shield";

var defenseStats = [
	increasedArmour,
	increasedEvasion,
	increasedEnergyShield,
	addedArmour,
	addedEvasionRating,
	addedEnergyShield
];

var computedArmour = 		"Armour";
var computedEvasionRating = "Evasion Rating";
var computedEnergyShield = 	"Energy Shield";

var defenseProperties = [
    computedArmour,
    computedEvasionRating,
    computedEnergyShield
];

var defenseBaseStatToComputedStatConversion = {};
defenseBaseStatToComputedStatConversion[addedArmour]  = computedArmour;
defenseBaseStatToComputedStatConversion[addedEvasionRating]  = computedEvasionRating;
defenseBaseStatToComputedStatConversion[addedEnergyShield]  = computedEnergyShield;

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

/* ----------------- STAT RANKINGS ----------------- */
var topStatRankings = {};

function addToRankings(item) {
	var topRankingsForType = {};
	if (topStatRankings[item.type]) {
		topRankingsForType = topStatRankings[item.type];
	}
	for (var statName in item.stats) {
		var topStat = 0;
		var itemStat = item.stats[statName];

		if (topRankingsForType[statName]) {
			topStat = topRankingsForType[statName];
			if (itemStat.constructor === Array) {
				if (itemStat[1] > topStat[1]) {
					topStat = itemStat;
				}
			} else {
				if (itemStat > topStat) {
					topStat = itemStat;
				}
			}
		} else {
			topStat = itemStat;
		}

		topRankingsForType[statName] = topStat;
	}
	topStatRankings[item.type] = topRankingsForType;
}