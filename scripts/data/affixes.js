/*
"+# to maximum Energy Shield" : {
	"affix" : "Prefix",
	"level" : 35,
	"name"  : "Pulsing",
	"properties" : [
		{
			"name"  : "+# to maximum Energy Shield",
			"range" : [
				{ "min" : 20, "max" : 22 }
			]
		}
	]
},
...
"+# to Accuracy Rating" : {
	"affix" : "Suffix",
	"level" : 8,
	"name"  : "of Shining",
	"properties" : [
		{
			"name"  : "+# to Accuracy Rating",
			"range" : [
				{ "min" : 5, "max" : 5 }
			]
		},
		{
			"name"  : "#% increased Light Radius",
			"range" : [
				{ "min" : 10, "max" : 20 }
			]
		}
	]
},
...
"Adds #-# Physical Damage" : {
	"affix" : "Prefix",
	"level" : 19,
	"name"  : "Polished",
	"properties" : [
		{
			"name"  : "Adds #-# Physical Damage",
			"range" : [
				{ "min" : 3, "max" : 4 },
				{ "min" : 6, "max" : 7 }
			]
		}
	]
}
*/

var flatten = function(array) {
    return Array.prototype.concat.apply([], array);
};

function combinations(array) {
    return array.reduce(function(prv, cur) {
        return flatten(prv.map(function(x) {
            return cur.concat(null).map(function(y) {
                return y == null ? x : x.concat([y]);
            });
        }));
    }, [[]]);
}

function getAffixCombinations(item, mods) {
    var simple = [];
    var complex = [];

    Object.forEach(mods, function (mod) {
        var type = (!mod.Compound && Object.keys(mod.Affixes).length == 1 && mod.Affixes[Object.keys(mod.Affixes)[0]].length == 1) ? simple : complex;

        Object.forEach(mod.Affixes, function (group) {
            type.push(group);
        });
    });

    var potentialCombinations = combinations(complex);

    simple = flatten(simple);
    // Add our simple affixes into each combination
    potentialCombinations = potentialCombinations.map(function(cmb) {
        return cmb.concat(simple);
    });

    potentialCombinations = getCombosWithValidPrefixAndSuffixCounts(potentialCombinations);
    potentialCombinations = getCombosWithValidStats(item, potentialCombinations);

    return potentialCombinations;
}

function getCombosWithValidStats(item, potentialCombinations) {
    return potentialCombinations.filter(function(combo) {
        return Object.every(item.explicitMods, function (mod) {
            var loLo = 0, loHi = 0;
            var hiLo = 0, hiHi = 0;

            combo.forEach(function(affix) {
                affix.properties.forEach(function(property) {
                    if (property.name == mod.name) {
                        loLo += property.range[0].min;
                        loHi += property.range[0].max;

                        if (property.range.length > 1) {
                            hiLo += property.range[1].min;
                            hiHi += property.range[1].max;
                        }
                    }
                });
            });

            var isInLowRange = mod.values[0] >= loLo && mod.values[0] <= loHi;
            var isInHighRange = mod.values.length == 1 || mod.values[1] >= hiLo && mod.values[1] <= hiHi;

            return isInHighRange && isInLowRange;
        });
    });
}

function getCombosWithValidPrefixAndSuffixCounts(potentialSolutions){
    return potentialSolutions.filter(function(combo) {
        var counts = { "Prefix" : 0, "Suffix" : 0 };
        combo.forEach(function(affix) {
            counts[affix.affix]++;
        });
        return counts["Prefix"] <= 3
            && counts["Suffix"] <= 3;
    });
}

function getAffixesFor(item, baseItem) {
    var mods = {};

    for (var m in item.explicitMods) {
        var mod = item.explicitMods[m];

        if (!mods[mod.name])
            mods[mod.name] = {
                "Prefix"   : false,// Prefix/Suffix probably no longer needed.
                "Suffix"   : false,
                "Compound" : false,
                "Affixes"  : {}
            };

        mods[mod.name].Affixes = Object.map(Affixes[mod.name], function(group) {
            if (group.properties.length == 2) {
                if (!mods[group.properties[1]]) {
                    mods[group.properties[1]] = {
                        "Prefix"   : false,
                        "Suffix"   : false,
                        "Compound" : false,
                        "Affixes"  : {}
                    };
                }
            }

            return group.affixes.filter(function(affix) {
                if (!affix.canAppearOnBaseItem(baseItem))
                    return false;

                if (!affix.itemHasMods(item))
                    return false;

                if (affix.minGtItem(item))
                    return false;

                if (affix.properties.length == 2) {
                    mods[mod.name].Compound = true;
                    mods[affix.properties[1].name].Compound = true;
                }

                mods[mod.name][affix.affix] = true;

                return true;
            });
        });
    }

    Object.forEach(mods, function(mod) {
        if (!mod.Compound && Object.keys(mod.Affixes).length == 1) {
            //	simple mod.
            mod.Affixes = Object.map(mod.Affixes, function(group) {
                return group.filter(function(affix) {
                    return !affix.maxLtItem(item);
                });
            });
        }

        mod.Affixes = Object.filter(mod.Affixes, function(group) {
            return group.length > 0;
        });
    });

    var combinations = getAffixCombinations(item, mods);

    return combinations;
}

var Affixes = (function() {
	
	var mods = {};

	function Affix(level, affix, gid, name, properties, ranges, typemask) {
		this.level      = level;
		this.affix      = affix;
		this.group      = gid;
		this.name       = name;
		this.properties = [];
		this.typemask   = typemask;

		if (properties.length == 2) {
			this.properties[0] = { "name" : properties[0], "range" : [ { "min" : ranges[0][0], "max" : ranges[0][1] } ] };
			this.properties[1] = { "name" : properties[1], "range" : [ { "min" : ranges[1][0], "max" : ranges[1][1] } ] };
		} else if (ranges.length == 2) {
			this.properties[0] = { "name" : properties[0], "range" : [ { "min" : ranges[0][0], "max" : ranges[0][1] },
			                                                           { "min" : ranges[1][0], "max" : ranges[1][1] } ] };
		} else {
			this.properties[0] = { "name" : properties[0], "range" : [ { "min" : ranges[0][0], "max" : ranges[0][1] } ] };
		}

		this.canAppearOnBaseItem = function(baseItem) {
			return this.typemask[baseItem.type] == 0xff || (this.typemask[baseItem.type] & baseItem.subtype);
		};

		this.itemHasMods = function(item) {
			if (!item.explicitMods[this.properties[0].name])
				return false;
			if (this.properties.length == 2)
				if (!item.explicitMods[this.properties[1].name])
					return false;
			return true;
		}

		// returns true iif all mods appear on the item and no mod's minimum roll is higher than appears on item.
		this.minGtItem = function(item) {
			var mod =  item.explicitMods[this.properties[0].name];
			if (this.properties[0].range[0].min > mod.values[0])
				return true;
			if (this.properties.length == 2) {
				if (this.properties[1].range[0].min > item.explicitMods[this.properties[1].name].values[0])
					return true;
			} else if (this.properties[0].range.length == 2) {
				if (this.properties[0].range[1].min > mod.values[1])
					return true;
			}
			return false;
		};

		this.maxLtItem = function(item) {
			var mod =  item.explicitMods[this.properties[0].name];
			if (this.properties[0].range[0].max < mod.values[0])
				return true;
			if (this.properties.length == 2) {
				if (this.properties[1].range[0].max < item.explicitMods[this.properties[1].name].values[0])
					return true;
			} else if (this.properties[0].range.length == 2) {
				if (this.properties[0].range[1].max < mod.values[1])
					return true;
			}
			return false;
		};
	}	
	
	function add(level, affix, gid, name, properties, ranges, typemask) {
		// hack to seperate prefixes and suffixes with the same mods into different groups.
		if (affix == "Prefix")
			gid += 100;

		if (!mods[properties[0]])
			mods[properties[0]] = {};

		if (!mods[properties[0]][gid]) {
			mods[properties[0]][gid] = {
				"affix"      : affix,
				"group"      : gid,
				"properties" : properties,
			//	"typemask"   : typemask,
				"affixes"    : []
			};
		}

		mods[properties[0]][gid].affixes.push(new Affix(level, affix, gid, name, properties, ranges, typemask));
	}
	
	var Prefix = "Prefix";
	var Suffix = "Suffix";

// ALSO IN baseEquipment.js
// ANY CHANGES MUST BE MIRRORED IN BOTH DOCUMENTS
	var	NONE    = 0x00,
		ANY     = 0xFF,
		STR     = 0x01,
		DEX     = 0x02,
		INT     = 0x04,
		STR_DEX = 0x08,
		STR_INT = 0x10,
		DEX_INT = 0x20;

	add(1,Prefix,2,"Beetle's",["#% increased Armour","#% increased Block and Stun Recovery"],[[6,14],[6,7]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Prefix,6,"Runner's",["#% increased Movement Speed"],[[10,10]],[NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Prefix,7,"Heavy",["#% increased Physical Damage"],[[20,49]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(1,Prefix,8,"Squire's",["#% increased Physical Damage","+# to Accuracy Rating"],[[10,24],[3,7]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(1,Prefix,13,"Lacquered",["+# to Armour"],[[3,10]],[NONE,NONE,NONE,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Prefix,13,"Lacquered",["+# to Armour"],[[3,10]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Prefix,15,"Agile",["+# to Evasion Rating"],[[3,10]],[ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Prefix,15,"Agile",["+# to Evasion Rating"],[[3,10]],[NONE,NONE,NONE,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Prefix,17,"Healthy",["+# to maximum Life"],[[10,19]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Prefix,18,"Beryl",["+# to maximum Mana"],[[15,19]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(1,Prefix,23,"Heated",["Adds #-# Fire Damage"],[[1,2],[3,4]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(1,Prefix,23,"Heated",["Adds #-# Fire Damage"],[[1,1],[2,2]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Prefix,23,"Heated",["Adds #-# Fire Damage"],[[2,3],[5,6]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(1,Prefix,24,"Thorny",["Reflects # Physical Damage to Melee Attackers"],[[1,4]],[NONE,NONE,ANY,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Suffix,1,"of the Newt",["# Life Regenerated per second"],[[0.7,1.1]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Suffix,3,"of Skill",["#% increased Attack Speed"],[[5,7]],[ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(1,Suffix,3,"of Skill",["#% increased Attack Speed"],[[6,9]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(1,Suffix,4,"of Thick Skin",["#% increased Block and Stun Recovery"],[[11,13]],[NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Suffix,5,"of Needling",["#% increased Critical Strike Chance"],[[10,14]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(1,Suffix,9,"of Success",["+# Life gained on Kill"],[[2,4]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(1,Suffix,10,"of Absorption",["+# Mana gained on Kill"],[[1,1]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(1,Suffix,11,"of Calm",["+# to Accuracy Rating"],[[5,15]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(1,Suffix,11,"of Calm",["+# to Accuracy Rating"],[[5,15]],[ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(1,Suffix,12,"of the Clouds",["+# to all Attributes"],[[1,4]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(1,Suffix,14,"of the Mongoose",["+# to Dexterity"],[[8,12]],[ANY,ANY,NONE,DEX|STR_DEX|DEX_INT,ANY,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,ANY,NONE,ANY,ANY,NONE,NONE,ANY,ANY,ANY,NONE,NONE]);
	add(1,Suffix,16,"of the Pupil",["+# to Intelligence"],[[8,12]],[ANY,ANY,NONE,ANY,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(1,Suffix,19,"of the Brute",["+# to Strength"],[[8,12]],[ANY,ANY,ANY,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(1,Suffix,20,"of the Inuit",["+#% to Cold Resistance"],[[6,11]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(1,Suffix,21,"of the Whelpling",["+#% to Fire Resistance"],[[6,11]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(1,Suffix,22,"of the Cloud",["+#% to Lightning Resistance"],[[6,11]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(2,Prefix,2,"Beetle's",["#% increased Armour","#% increased Block and Stun Recovery"],[[6,14],[6,7]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,25,"Reinforced",["#% increased Armour"],[[2,4]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,26,"Pixie's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[6,14],[6,7]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,28,"Agile",["#% increased Evasion Rating"],[[2,4]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,29,"Mosquito's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[6,14],[6,7]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,29,"Mosquito's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[6,14],[6,7]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,33,"Apprentice's",["#% increased Spell Damage"],[[10,19]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,33,"Apprentice's",["#% increased Spell Damage"],[[15,29]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,34,"Caster's",["#% increased Spell Damage","+# to maximum Mana"],[[5,9],[8,10]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,34,"Caster's",["#% increased Spell Damage","+# to maximum Mana"],[[8,14],[8,10]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,35,"Frost Weaver's",["+# to Level of Cold Gems in this item"],[[1,1]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,36,"Flame Spinner's",["+# to Level of Fire Gems in this item"],[[1,1]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,37,"Thunder Lord's",["+# to Level of Lightning Gems in this item"],[[1,1]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(2,Prefix,38,"Frosted",["Adds #-# Cold Damage"],[[2,4]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(2,Prefix,38,"Frosted",["Adds #-# Cold Damage"],[[1,1],[2,2]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(2,Prefix,38,"Frosted",["Adds #-# Cold Damage"],[[2,4],[6,7]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(2,Prefix,39,"Glinting",["Adds #-# Physical Damage"],[[1,1],[2,3]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,NONE,ANY,NONE,ANY,NONE]);
	add(2,Prefix,39,"Glinting",["Adds #-# Physical Damage"],[[2,2],[4,5]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,ANY]);
	add(2,Suffix,27,"of Talent",["#% increased Cast Speed"],[[5,7]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(2,Suffix,30,"of Refilling",["#% increased Flask Charges gained"],[[10,20]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(2,Suffix,31,"of Excitement",["#% increased Mana Regeneration Rate"],[[10,19]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(2,Suffix,32,"of Collecting",["#% increased Quantity of Items found"],[[4,8]],[ANY,ANY,NONE,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(3,Prefix,25,"Reinforced",["#% increased Armour"],[[11,28]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(3,Prefix,26,"Pixie's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[6,14],[6,7]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(3,Prefix,28,"Shade's",["#% increased Evasion Rating"],[[11,28]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(3,Prefix,40,"Infixed",["#% increased Armour and Energy Shield"],[[11,28]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(3,Prefix,41,"Scrapper's",["#% increased Armour and Evasion"],[[11,28]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(3,Prefix,42,"Protective",["#% increased Energy Shield"],[[11,28]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(3,Prefix,42,"Protective",["#% increased Energy Shield"],[[2,4]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(3,Prefix,43,"Shadowy",["#% increased Evasion and Energy Shield"],[[11,28]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(3,Prefix,46,"Shining",["+# to maximum Energy Shield"],[[1,3]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(3,Prefix,46,"Shining",["+# to maximum Energy Shield"],[[3,5]],[NONE,NONE,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(3,Prefix,47,"Humming",["Adds #-# Lightning Damage"],[[1,1],[9,10]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(3,Prefix,47,"Humming",["Adds #-# Lightning Damage"],[[1,1],[5,5]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(3,Prefix,47,"Humming",["Adds #-# Lightning Damage"],[[1,1],[14,15]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,ANY]);
	add(3,Suffix,44,"of Plunder",["#% increased Rarity of Items found"],[[6,10]],[ANY,ANY,NONE,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(3,Suffix,45,"of Sipping",["#% reduced Flask Charges used"],[[-20,-10]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(4,Prefix,48,"Catalyzing",["#% increased Elemental Damage with Weapons"],[[5,10]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(5,Prefix,33,"Chanter's",["#% increased Spell Damage"],[[3,7]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(5,Prefix,39,"Glinting",["Adds #-# Physical Damage"],[[1,1],[2,2]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(5,Prefix,49,"Recovering",["#% increased Flask Life Recovery rate"],[[10,20]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(5,Prefix,50,"Inspiring",["#% increased Flask Mana Recovery rate"],[[10,20]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(5,Suffix,51,"of Needling",["#% increased Global Critical Strike Chance"],[[10,14]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(5,Suffix,52,"of Impact",["#% increased Stun Duration on enemies"],[[11,15]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(5,Suffix,53,"of the Pugilist",["#% reduced Enemy Stun Threshold"],[[5,7]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,ANY]);
	add(7,Suffix,54,"of Savouring",["#% increased Flask effect duration"],[[10,20]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(8,Prefix,59,"Combatant's",["+# to Level of Melee Gems in this item"],[[1,1]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,STR|DEX|STR_DEX,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(8,Suffix,55,"of Embers",["#% increased Fire Damage"],[[3,7]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(8,Suffix,56,"of Ire",["#% increased Global Critical Strike Multiplier"],[[7,12]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(8,Suffix,56,"of Ire",["#% increased Global Critical Strike Multiplier"],[[7,12]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(8,Suffix,57,"of Rejuvenation",["+# Life gained for each enemy hit by your Attacks"],[[2,2]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(8,Suffix,58,"of Shining",["+# to Accuracy Rating","#% increased Light Radius"],[[5,5],[10,20]],[ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(9,Prefix,60,"Remora's",["#% of Physical Attack Damage Leeched as Life"],[[1,2]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(9,Prefix,61,"Thirsty",["#% of Physical Attack Damage Leeched as Mana"],[[1,2]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(9,Prefix,62,"Fletcher's",["+# to Level of Bow Gems in this item"],[[1,1]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE]);
	add(10,Prefix,24,"Spiny",["Reflects # Physical Damage to Melee Attackers"],[[5,10]],[NONE,NONE,ANY,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(10,Suffix,63,"of Intercepting",["#% additional Block Chance"],[[1,3]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(10,Suffix,64,"of Sparks",["#% increased Lightning Damage"],[[3,7]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(11,Prefix,7,"Serrated",["#% increased Physical Damage"],[[50,69]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(11,Prefix,8,"Journeyman's",["#% increased Physical Damage","+# to Accuracy Rating"],[[25,34],[8,30]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(11,Prefix,17,"Sanguine",["+# to maximum Life"],[[20,29]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(11,Prefix,18,"Cobalt",["+# to maximum Mana"],[[20,24]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(11,Prefix,33,"Adept's",["#% increased Spell Damage"],[[20,29]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(11,Prefix,33,"Adept's",["#% increased Spell Damage"],[[30,44]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(11,Prefix,34,"Magician's",["#% increased Spell Damage","+# to maximum Mana"],[[10,14],[11,13]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(11,Prefix,34,"Magician's",["#% increased Spell Damage","+# to maximum Mana"],[[15,22],[11,13]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(11,Prefix,46,"Glimmering",["+# to maximum Energy Shield"],[[4,8]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(11,Prefix,46,"Glimmering",["+# to maximum Energy Shield"],[[6,8]],[NONE,NONE,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(11,Suffix,3,"of Ease",["#% increased Attack Speed"],[[8,10]],[NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(11,Suffix,3,"of Ease",["#% increased Attack Speed"],[[5,10]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(11,Suffix,12,"of the Sky",["+# to all Attributes"],[[5,8]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(11,Suffix,14,"of the Lynx",["+# to Dexterity"],[[13,17]],[ANY,ANY,NONE,DEX|STR_DEX|DEX_INT,ANY,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,ANY,NONE,ANY,ANY,NONE,NONE,ANY,ANY,ANY,NONE,NONE]);
	add(11,Suffix,16,"of the Student",["+# to Intelligence"],[[13,17]],[ANY,ANY,NONE,ANY,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(11,Suffix,19,"of the Wrestler",["+# to Strength"],[[13,17]],[ANY,ANY,ANY,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(11,Suffix,65,"of Menace",["#% increased Critical Strike Chance for Spells"],[[11,20]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(12,Prefix,23,"Smoldering",["Adds #-# Fire Damage"],[[6,8],[12,14]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,ANY]);
	add(12,Prefix,23,"Smoldering",["Adds #-# Fire Damage"],[[3,5],[7,8]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(12,Prefix,23,"Smoldering",["Adds #-# Fire Damage"],[[8,11],[17,20]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(12,Suffix,11,"of Steadiness",["+# to Accuracy Rating"],[[16,60]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(12,Suffix,11,"of Steadiness",["+# to Accuracy Rating"],[[16,60]],[ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(12,Suffix,21,"of the Salamander",["+#% to Fire Resistance"],[[12,17]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(12,Suffix,66,"of Snow",["#% increased Cold Damage"],[[3,7]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(12,Suffix,67,"of the Crystal",["+#% to all Elemental Resistances"],[[3,5]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(13,Prefix,38,"Chilled",["Adds #-# Cold Damage"],[[5,7],[11,13]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(13,Prefix,38,"Chilled",["Adds #-# Cold Damage"],[[3,4],[7,8]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(13,Prefix,38,"Chilled",["Adds #-# Cold Damage"],[[8,10],[16,19]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(13,Prefix,39,"Burnished",["Adds #-# Physical Damage"],[[4,5],[8,10]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,NONE,ANY,NONE,ANY,ANY]);
	add(13,Prefix,39,"Burnished",["Adds #-# Physical Damage"],[[2,3],[4,5]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(13,Prefix,39,"Burnished",["Adds #-# Physical Damage"],[[6,8],[12,14]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,ANY]);
	add(13,Prefix,47,"Buzzing",["Adds #-# Lightning Damage"],[[1,2],[23,25]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(13,Prefix,47,"Buzzing",["Adds #-# Lightning Damage"],[[1,1],[14,15]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(13,Prefix,47,"Buzzing",["Adds #-# Lightning Damage"],[[1,3],[35,37]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,ANY]);
	add(13,Suffix,22,"of the Squall",["+#% to Lightning Resistance"],[[12,17]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(14,Prefix,69,"Reanimator's",["+# to Level of Minion Gems in this item"],[[1,1]],[NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(14,Suffix,20,"of the Seal",["+#% to Cold Resistance"],[[12,17]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(14,Suffix,68,"of Darting",["#% increased Projectile Speed"],[[10,17]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE]);
	add(15,Prefix,6,"Sprinter's",["#% increased Movement Speed"],[[15,15]],[NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(15,Prefix,48,"Infusing",["#% increased Elemental Damage with Weapons"],[[11,20]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(15,Suffix,27,"of Nimbleness",["#% increased Cast Speed"],[[8,10]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(15,Suffix,58,"of Light",["+# to Accuracy Rating","#% increased Light Radius"],[[10,10],[21,40]],[ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(16,Suffix,70,"of the Lost",["+#% to Chaos Resistance"],[[5,10]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(17,Prefix,2,"Crab's",["#% increased Armour","#% increased Block and Stun Recovery"],[[15,23],[8,9]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(17,Prefix,18,"Azure",["+# to maximum Mana"],[[25,29]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(17,Prefix,25,"Layered",["#% increased Armour"],[[29,46]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(17,Prefix,46,"Glittering",["+# to maximum Energy Shield"],[[9,12]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(17,Prefix,46,"Glittering",["+# to maximum Energy Shield"],[[9,12]],[NONE,NONE,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(17,Suffix,4,"of Stone Skin",["#% increased Block and Stun Recovery"],[[14,16]],[NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(18,Prefix,13,"Studded",["+# to Armour"],[[11,35]],[NONE,NONE,NONE,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(18,Prefix,13,"Studded",["+# to Armour"],[[11,35]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(18,Prefix,15,"Dancer's",["+# to Evasion Rating"],[[11,35]],[ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(18,Prefix,15,"Dancer's",["+# to Evasion Rating"],[[11,35]],[NONE,NONE,NONE,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(18,Prefix,17,"Stalwart",["+# to maximum Life"],[[30,39]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(18,Prefix,25,"Layered",["#% increased Armour"],[[5,7]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(18,Prefix,26,"Gremlin's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[15,23],[8,9]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(18,Prefix,42,"Strong-Willed",["#% increased Energy Shield"],[[29,46]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(18,Prefix,42,"Strong-Willed",["#% increased Energy Shield"],[[5,7]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(18,Suffix,1,"of the Lizard",["# Life Regenerated per second"],[[1.6,2.4]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(18,Suffix,31,"of Joy",["#% increased Mana Regeneration Rate"],[[20,29]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(18,Suffix,52,"of Dazing",["#% increased Stun Duration on enemies"],[[16,20]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(19,Prefix,2,"Crab's",["#% increased Armour","#% increased Block and Stun Recovery"],[[15,23],[8,9]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(19,Prefix,26,"Gremlin's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[15,23],[8,9]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(19,Prefix,28,"Dancer's",["#% increased Evasion Rating"],[[5,7]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(19,Prefix,28,"Ghost's",["#% increased Evasion Rating"],[[29,46]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(19,Prefix,29,"Moth's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[15,23],[8,9]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(19,Prefix,29,"Moth's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[15,23],[8,9]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(19,Prefix,39,"Polished",["Adds #-# Physical Damage"],[[3,4],[6,7]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(19,Prefix,40,"Ingrained",["#% increased Armour and Energy Shield"],[[29,46]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(19,Prefix,41,"Brawler's",["#% increased Armour and Evasion"],[[29,46]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(19,Prefix,43,"Ethereal",["#% increased Evasion and Energy Shield"],[[29,46]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(20,Prefix,23,"Smoking",["Adds #-# Fire Damage"],[[9,12],[19,22]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(20,Prefix,23,"Smoking",["Adds #-# Fire Damage"],[[5,7],[11,13]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(20,Prefix,23,"Smoking",["Adds #-# Fire Damage"],[[12,17],[26,30]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(20,Prefix,24,"Barbed",["Reflects # Physical Damage to Melee Attackers"],[[11,24]],[NONE,NONE,ANY,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(20,Prefix,33,"Mage's",["#% increased Spell Damage"],[[8,12]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(20,Prefix,44,"Magpie's",["#% increased Rarity of Items found"],[[8,12]],[ANY,ANY,NONE,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(20,Suffix,5,"of Stinging",["#% increased Critical Strike Chance"],[[15,19]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(20,Suffix,11,"of Accuracy",["+# to Accuracy Rating"],[[61,100]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(20,Suffix,11,"of Accuracy",["+# to Accuracy Rating"],[[61,100]],[ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(20,Suffix,51,"of Stinging",["#% increased Global Critical Strike Chance"],[[15,19]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(20,Suffix,53,"of the Brawler",["#% reduced Enemy Stun Threshold"],[[8,9]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,ANY]);
	add(20,Suffix,57,"of Restoration",["+# Life gained for each enemy hit by your Attacks"],[[3,3]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(21,Prefix,38,"Icy",["Adds #-# Cold Damage"],[[8,11],[17,20]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(21,Prefix,38,"Icy",["Adds #-# Cold Damage"],[[5,7],[10,12]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(21,Prefix,38,"Icy",["Adds #-# Cold Damage"],[[11,15],[23,27]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(21,Prefix,39,"Polished",["Adds #-# Physical Damage"],[[6,8],[12,14]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,NONE,ANY,NONE,ANY,NONE]);
	add(21,Prefix,39,"Polished",["Adds #-# Physical Damage"],[[9,12],[18,21]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,ANY]);
	add(21,Suffix,56,"of Anger",["#% increased Global Critical Strike Multiplier"],[[13,26]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(21,Suffix,56,"of Anger",["#% increased Global Critical Strike Multiplier"],[[15,19]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(21,Suffix,65,"of Havoc",["#% increased Critical Strike Chance for Spells"],[[20,39]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(22,Prefix,47,"Snapping",["Adds #-# Lightning Damage"],[[1,3],[36,38]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(22,Prefix,47,"Snapping",["Adds #-# Lightning Damage"],[[1,2],[22,23]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(22,Prefix,47,"Snapping",["Adds #-# Lightning Damage"],[[2,5],[47,50]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(22,Suffix,3,"of Mastery",["#% increased Attack Speed"],[[11,13]],[NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(22,Suffix,3,"of Mastery",["#% increased Attack Speed"],[[11,13]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(22,Suffix,12,"of the Meteor",["+# to all Attributes"],[[9,12]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(22,Suffix,14,"of the Fox",["+# to Dexterity"],[[18,22]],[ANY,ANY,NONE,DEX|STR_DEX|DEX_INT,ANY,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,ANY,NONE,ANY,ANY,NONE,NONE,ANY,ANY,ANY,NONE,NONE]);
	add(22,Suffix,16,"of the Prodigy",["+# to Intelligence"],[[18,22]],[ANY,ANY,NONE,ANY,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(22,Suffix,19,"of the Bear",["+# to Strength"],[[18,22]],[ANY,ANY,ANY,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(22,Suffix,55,"of Coals",["#% increased Fire Damage"],[[8,12]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(23,Prefix,7,"Wicked",["#% increased Physical Damage"],[[70,89]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(23,Prefix,8,"Reaver's",["#% increased Physical Damage","+# to Accuracy Rating"],[[35,44],[31,50]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(23,Prefix,18,"Sapphire",["+# to maximum Mana"],[[30,34]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(23,Prefix,33,"Scholar's",["#% increased Spell Damage"],[[30,39]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(23,Prefix,33,"Scholar's",["#% increased Spell Damage"],[[45,59]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(23,Prefix,34,"Wizard's",["#% increased Spell Damage","+# to maximum Mana"],[[15,19],[14,16]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(23,Prefix,34,"Wizard's",["#% increased Spell Damage","+# to maximum Mana"],[[23,29],[14,16]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(23,Prefix,46,"Glowing",["+# to maximum Energy Shield"],[[13,15]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(23,Prefix,46,"Glowing",["+# to maximum Energy Shield"],[[13,15]],[NONE,NONE,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(23,Suffix,9,"of Victory",["+# Life gained on Kill"],[[5,7]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(23,Suffix,64,"of Static",["#% increased Lightning Damage"],[[8,12]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(24,Prefix,17,"Stout",["+# to maximum Life"],[[40,49]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(24,Suffix,10,"of Osmosis",["+# Mana gained on Kill"],[[2,3]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(24,Suffix,21,"of the Drake",["+#% to Fire Resistance"],[[18,23]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(24,Suffix,66,"of Sleet",["#% increased Cold Damage"],[[8,12]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(24,Suffix,67,"of the Prism",["+#% to all Elemental Resistances"],[[6,8]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(25,Prefix,60,"Lamprey's",["#% of Physical Attack Damage Leeched as Life"],[[3,5]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(25,Suffix,22,"of the Storm",["+#% to Lightning Resistance"],[[18,23]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(26,Suffix,11,"of Precision",["+# to Accuracy Rating"],[[101,130]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(26,Suffix,11,"of Precision",["+# to Accuracy Rating"],[[101,130]],[ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(26,Suffix,20,"of the Penguin",["+#% to Cold Resistance"],[[18,23]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(27,Suffix,68,"of Flight",["#% increased Projectile Speed"],[[18,25]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE]);
	add(28,Prefix,23,"Burning",["Adds #-# Fire Damage"],[[12,16],[25,29]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(28,Prefix,23,"Burning",["Adds #-# Fire Damage"],[[7,10],[15,18]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(28,Prefix,23,"Burning",["Adds #-# Fire Damage"],[[17,23],[35,41]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(28,Prefix,39,"Honed",["Adds #-# Physical Damage"],[[4,6],[9,10]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(28,Suffix,4,"of Iron Skin",["#% increased Block and Stun Recovery"],[[17,19]],[NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(28,Suffix,65,"of Disaster",["#% increased Critical Strike Chance for Spells"],[[40,59]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(29,Prefix,2,"Armadillo's",["#% increased Armour","#% increased Block and Stun Recovery"],[[24,32],[10,11]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(29,Prefix,15,"Acrobat's",["+# to Evasion Rating"],[[36,60]],[ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(29,Prefix,15,"Acrobat's",["+# to Evasion Rating"],[[36,60]],[NONE,NONE,NONE,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(29,Prefix,18,"Cerulean",["+# to maximum Mana"],[[35,39]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(29,Prefix,25,"Lobstered",["#% increased Armour"],[[47,64]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(29,Prefix,38,"Frigid",["Adds #-# Cold Damage"],[[11,15],[22,26]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(29,Prefix,38,"Frigid",["Adds #-# Cold Damage"],[[6,9],[13,16]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(29,Prefix,38,"Frigid",["Adds #-# Cold Damage"],[[16,21],[32,37]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(29,Prefix,39,"Honed",["Adds #-# Physical Damage"],[[7,10],[15,18]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,NONE,ANY,NONE,ANY,NONE]);
	add(29,Prefix,39,"Honed",["Adds #-# Physical Damage"],[[11,15],[23,27]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,ANY]);
	add(29,Prefix,46,"Radiating",["+# to maximum Energy Shield"],[[16,19]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(29,Prefix,46,"Radiating",["+# to maximum Energy Shield"],[[16,19]],[NONE,NONE,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(29,Suffix,31,"of Elation",["#% increased Mana Regeneration Rate"],[[30,39]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,2,"Armadillo's",["#% increased Armour","#% increased Block and Stun Recovery"],[[24,32],[10,11]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,6,"Stallion's",["#% increased Movement Speed"],[[20,20]],[NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,13,"Ribbed",["+# to Armour"],[[36,60]],[NONE,NONE,NONE,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,13,"Ribbed",["+# to Armour"],[[36,60]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,17,"Robust",["+# to maximum Life"],[[50,59]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(30,Prefix,25,"Lobstered",["#% increased Armour"],[[8,10]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,26,"Boggart's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[24,32],[10,11]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,26,"Boggart's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[24,32],[10,11]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,28,"Acrobat's",["#% increased Evasion Rating"],[[8,10]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,28,"Spectre's",["#% increased Evasion Rating"],[[47,64]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,29,"Butterfly's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[24,32],[10,11]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,29,"Butterfly's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[24,32],[10,11]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,40,"Instilled",["#% increased Armour and Energy Shield"],[[47,64]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,41,"Fencer's",["#% increased Armour and Evasion"],[[47,64]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(30,Prefix,42,"Resolute",["#% increased Energy Shield"],[[47,64]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,42,"Resolute",["#% increased Energy Shield"],[[8,10]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,43,"Unworldly",["#% increased Evasion and Energy Shield"],[[47,64]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,47,"Crackling",["Adds #-# Lightning Damage"],[[2,5],[47,50]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,ANY]);
	add(30,Prefix,47,"Crackling",["Adds #-# Lightning Damage"],[[1,2],[27,28]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Prefix,47,"Crackling",["Adds #-# Lightning Damage"],[[3,7],[73,77]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(30,Prefix,48,"Empowering",["#% increased Elemental Damage with Weapons"],[[21,30]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(30,Suffix,1,"of the Starfish",["# Life Regenerated per second"],[[2.2,3.3]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Suffix,3,"of Renown",["#% increased Attack Speed"],[[14,16]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(30,Suffix,5,"of Piercing",["#% increased Critical Strike Chance"],[[20,24]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(30,Suffix,27,"of Expertise",["#% increased Cast Speed"],[[11,13]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(30,Suffix,44,"of Raiding",["#% increased Rarity of Items found"],[[11,14]],[ANY,ANY,NONE,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Suffix,51,"of Piercing",["#% increased Global Critical Strike Chance"],[[20,24]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(30,Suffix,52,"of Stunning",["#% increased Stun Duration on enemies"],[[21,25]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(30,Suffix,53,"of the Boxer",["#% reduced Enemy Stun Threshold"],[[10,11]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,ANY]);
	add(30,Suffix,56,"of Rage",["#% increased Global Critical Strike Multiplier"],[[20,24]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(30,Suffix,57,"of Regrowth",["+# Life gained for each enemy hit by your Attacks"],[[4,4]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(30,Suffix,58,"of Radiance",["+# to Accuracy Rating","#% increased Light Radius"],[[15,15],[5,10]],[ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(30,Suffix,70,"of Banishment",["+#% to Chaos Resistance"],[[11,15]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(31,Suffix,56,"of Rage",["#% increased Global Critical Strike Multiplier"],[[27,39]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(32,Suffix,32,"of Gathering",["#% increased Quantity of Items found"],[[9,12]],[ANY,ANY,NONE,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(33,Suffix,11,"of the Sniper",["+# to Accuracy Rating"],[[131,165]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(33,Suffix,11,"of the Sniper",["+# to Accuracy Rating"],[[131,165]],[ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(33,Suffix,12,"of the Comet",["+# to all Attributes"],[[13,16]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(33,Suffix,14,"of the Falcon",["+# to Dexterity"],[[23,27]],[ANY,ANY,NONE,DEX|STR_DEX|DEX_INT,ANY,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,ANY,NONE,ANY,ANY,NONE,NONE,ANY,ANY,ANY,NONE,NONE]);
	add(33,Suffix,16,"of the Augur",["+# to Intelligence"],[[23,27]],[ANY,ANY,NONE,ANY,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(33,Suffix,19,"of the Lion",["+# to Strength"],[[23,27]],[ANY,ANY,ANY,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(35,Prefix,7,"Vicious",["#% increased Physical Damage"],[[90,109]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(35,Prefix,8,"Mercenary's",["#% increased Physical Damage","+# to Accuracy Rating"],[[45,54],[51,64]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(35,Prefix,18,"Aqua",["+# to maximum Mana"],[[40,44]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(35,Prefix,24,"Jagged",["Reflects # Physical Damage to Melee Attackers"],[[25,50]],[NONE,NONE,ANY,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(35,Prefix,33,"Professor's",["#% increased Spell Damage"],[[60,74]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(35,Prefix,33,"Professor's",["#% increased Spell Damage"],[[40,49]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(35,Prefix,34,"Warlock's",["#% increased Spell Damage","+# to maximum Mana"],[[30,37],[17,19]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(35,Prefix,34,"Warlock's",["#% increased Spell Damage","+# to maximum Mana"],[[20,24],[17,19]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(35,Prefix,39,"Gleaming",["Adds #-# Physical Damage"],[[5,7],[11,12]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(35,Prefix,46,"Pulsing",["+# to maximum Energy Shield"],[[20,22]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(35,Prefix,46,"Pulsing",["+# to maximum Energy Shield"],[[20,29]],[NONE,NONE,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(36,Prefix,17,"Rotund",["+# to maximum Life"],[[60,69]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(36,Prefix,23,"Flaming",["Adds #-# Fire Damage"],[[9,12],[19,22]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(36,Prefix,39,"Gleaming",["Adds #-# Physical Damage"],[[9,12],[19,22]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,NONE,ANY,NONE,ANY,NONE]);
	add(36,Prefix,39,"Gleaming",["Adds #-# Physical Damage"],[[14,19],[28,33]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,ANY]);
	add(36,Suffix,21,"of the Kiln",["+#% to Fire Resistance"],[[24,29]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(36,Suffix,55,"of Cinders",["#% increased Fire Damage"],[[13,17]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(36,Suffix,64,"of Electricity",["#% increased Lightning Damage"],[[13,17]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(36,Suffix,66,"of Ice",["#% increased Cold Damage"],[[13,17]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(36,Suffix,67,"of the Kaleidoscope",["+#% to all Elemental Resistances"],[[9,11]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(36,Suffix,71,"of the Worthy",["#% reduced Attribute Requirements"],[[-18,-18]],[NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(37,Prefix,38,"Freezing",["Adds #-# Cold Damage"],[[8,11],[16,19]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(37,Suffix,3,"of Acclaim",["#% increased Attack Speed"],[[17,19]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,ANY,ANY]);
	add(37,Suffix,22,"of the Thunderhead",["+#% to Lightning Resistance"],[[24,29]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(38,Prefix,23,"Flaming",["Adds #-# Fire Damage"],[[16,22],[33,39]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(38,Prefix,23,"Flaming",["Adds #-# Fire Damage"],[[21,29],[44,51]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(38,Prefix,33,"Sorcerer's",["#% increased Spell Damage"],[[13,17]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(38,Prefix,38,"Freezing",["Adds #-# Cold Damage"],[[14,19],[29,34]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(38,Prefix,38,"Freezing",["Adds #-# Cold Damage"],[[19,26],[39,46]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,ANY]);
	add(38,Prefix,47,"Sparking",["Adds #-# Lightning Damage"],[[2,6],[58,61]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(38,Prefix,47,"Sparking",["Adds #-# Lightning Damage"],[[1,3],[33,34]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(38,Prefix,47,"Sparking",["Adds #-# Lightning Damage"],[[3,8],[75,79]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(38,Suffix,20,"of the Yeti",["+#% to Cold Resistance"],[[24,29]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(39,Prefix,44,"Pirate's",["#% increased Rarity of Items found"],[[13,18]],[ANY,ANY,NONE,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(40,Prefix,6,"Gazelle's",["#% increased Movement Speed"],[[25,25]],[NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(40,Suffix,9,"of Triumph",["+# Life gained on Kill"],[[8,11]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(40,Suffix,10,"of Consumption",["+# Mana gained on Kill"],[[4,6]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(40,Suffix,27,"of Legerdemain",["#% increased Cast Speed"],[[14,16]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(40,Suffix,57,"of Nourishment",["+# Life gained for each enemy hit by your Attacks"],[[5,5]],[ANY,ANY,NONE,NONE,ANY,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(41,Suffix,11,"of the Marksman",["+# to Accuracy Rating"],[[166,200]],[ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(41,Suffix,11,"of the Marksman",["+# to Accuracy Rating"],[[166,200]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(41,Suffix,65,"of Calamity",["#% increased Critical Strike Chance for Spells"],[[60,79]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(41,Suffix,68,"of Propulsion",["#% increased Projectile Speed"],[[26,33]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE]);
	add(42,Prefix,2,"Rhino's",["#% increased Armour","#% increased Block and Stun Recovery"],[[33,41],[12,13]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(42,Prefix,15,"Fleet",["+# to Evasion Rating"],[[61,80]],[ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(42,Prefix,15,"Fleet",["+# to Evasion Rating"],[[61,138]],[NONE,NONE,NONE,DEX|STR_DEX|DEX_INT,NONE,NONE,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(42,Prefix,18,"Opalescent",["+# to maximum Mana"],[[45,49]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(42,Prefix,25,"Buttressed",["#% increased Armour"],[[65,82]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(42,Prefix,25,"Buttressed",["#% increased Armour"],[[11,13]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(42,Prefix,28,"Fleet",["#% increased Evasion Rating"],[[11,13]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(42,Prefix,42,"Fearless",["#% increased Energy Shield"],[[11,13]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(42,Prefix,46,"Seething",["+# to maximum Energy Shield"],[[23,26]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(42,Suffix,4,"of Steel Skin",["#% increased Block and Stun Recovery"],[[20,22]],[NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(42,Suffix,31,"of Bliss",["#% increased Mana Regeneration Rate"],[[40,49]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(43,Prefix,46,"Seething",["+# to maximum Energy Shield"],[[30,48]],[NONE,NONE,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Prefix,2,"Rhino's",["#% increased Armour","#% increased Block and Stun Recovery"],[[33,41],[12,13]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Prefix,13,"Fortified",["+# to Armour"],[[61,138]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Prefix,17,"Virile",["+# to maximum Life"],[[70,79]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(44,Prefix,26,"Naga's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[33,41],[12,13]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(44,Prefix,26,"Naga's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[33,41],[12,13]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(44,Prefix,28,"Wraith's",["#% increased Evasion Rating"],[[65,82]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Prefix,29,"Wasp's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[33,41],[12,13]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Prefix,29,"Wasp's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[33,41],[12,13]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Prefix,39,"Annealed",["Adds #-# Physical Damage"],[[6,9],[13,15]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(44,Prefix,40,"Infused",["#% increased Armour and Energy Shield"],[[65,82]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Prefix,41,"Gladiator's",["#% increased Armour and Evasion"],[[65,82]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(44,Prefix,42,"Fearless",["#% increased Energy Shield"],[[65,82]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Prefix,43,"Ephemeral",["#% increased Evasion and Energy Shield"],[[65,82]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Suffix,1,"of the Hydra",["# Life Regenerated per second"],[[2.9,4.3]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Suffix,5,"of Puncturing",["#% increased Critical Strike Chance"],[[25,29]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(44,Suffix,12,"of the Heavens",["+# to all Attributes"],[[17,20]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Suffix,14,"of the Panther",["+# to Dexterity"],[[28,32]],[ANY,ANY,NONE,DEX|STR_DEX|DEX_INT,ANY,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,ANY,NONE,ANY,ANY,NONE,NONE,ANY,ANY,ANY,NONE,NONE]);
	add(44,Suffix,16,"of the Philosopher",["+# to Intelligence"],[[28,32]],[ANY,ANY,NONE,ANY,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(44,Suffix,19,"of the Gorilla",["+# to Strength"],[[28,32]],[ANY,ANY,ANY,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(44,Suffix,51,"of Puncturing",["#% increased Global Critical Strike Chance"],[[25,29]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(44,Suffix,52,"of Slamming",["#% increased Stun Duration on enemies"],[[26,30]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(44,Suffix,53,"of the Combatant",["#% reduced Enemy Stun Threshold"],[[12,13]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,ANY]);
	add(44,Suffix,56,"of Fury",["#% increased Global Critical Strike Multiplier"],[[25,29]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(44,Suffix,70,"of Eviction",["+#% to Chaos Resistance"],[[16,20]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(45,Suffix,3,"of Fame",["#% increased Attack Speed"],[[20,22]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,ANY,ANY]);
	add(45,Suffix,56,"of Fury",["#% increased Global Critical Strike Multiplier"],[[40,53]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(46,Prefix,7,"Bloodthirsty",["#% increased Physical Damage"],[[110,129]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(46,Prefix,8,"Champion's",["#% increased Physical Damage","+# to Accuracy Rating"],[[55,64],[65,82]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(46,Prefix,13,"Fortified",["+# to Armour"],[[61,138]],[NONE,NONE,NONE,STR|STR_DEX|STR_INT,NONE,NONE,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(46,Prefix,33,"Occultist's",["#% increased Spell Damage"],[[75,89]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(46,Prefix,33,"Occultist's",["#% increased Spell Damage"],[[50,59]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(46,Prefix,34,"Mage's",["#% increased Spell Damage","+# to maximum Mana"],[[38,44],[20,22]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(46,Prefix,34,"Mage's",["#% increased Spell Damage","+# to maximum Mana"],[[25,29],[20,22]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(46,Prefix,39,"Annealed",["Adds #-# Physical Damage"],[[12,16],[24,28]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,NONE,ANY,NONE,ANY,NONE]);
	add(46,Prefix,39,"Annealed",["Adds #-# Physical Damage"],[[18,24],[36,42]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,ANY]);
	add(48,Prefix,23,"Scorching",["Adds #-# Fire Damage"],[[11,15],[23,27]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(48,Suffix,21,"of the Furnace",["+#% to Fire Resistance"],[[30,35]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(48,Suffix,67,"of Variegation",["+#% to all Elemental Resistances"],[[12,14]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(49,Suffix,22,"of the Tempest",["+#% to Lightning Resistance"],[[30,35]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(50,Prefix,23,"Scorching",["Adds #-# Fire Damage"],[[21,28],[42,50]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(50,Prefix,23,"Scorching",["Adds #-# Fire Damage"],[[27,36],[54,64]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(50,Prefix,38,"Frozen",["Adds #-# Cold Damage"],[[18,25],[37,43]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(50,Prefix,38,"Frozen",["Adds #-# Cold Damage"],[[10,13],[20,24]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(50,Prefix,38,"Frozen",["Adds #-# Cold Damage"],[[24,32],[49,57]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(50,Prefix,46,"Blazing",["+# to maximum Energy Shield"],[[27,31]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(50,Prefix,47,"Arcing",["Adds #-# Lightning Damage"],[[3,8],[75,79]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(50,Prefix,47,"Arcing",["Adds #-# Lightning Damage"],[[1,4],[40,43]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(50,Prefix,47,"Arcing",["Adds #-# Lightning Damage"],[[5,10],[96,101]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,ANY]);
	add(50,Suffix,11,"of the Deadeye",["+# to Accuracy Rating"],[[201,250]],[ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(50,Suffix,11,"of the Deadeye",["+# to Accuracy Rating"],[[201,250]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(50,Suffix,20,"of the Walrus",["+#% to Cold Resistance"],[[30,35]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(50,Suffix,55,"of Flames",["#% increased Fire Damage"],[[18,22]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(50,Suffix,64,"of Voltage",["#% increased Lightning Damage"],[[18,22]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(50,Suffix,66,"of Rime",["#% increased Cold Damage"],[[18,22]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(51,Prefix,18,"Gentian",["+# to maximum Mana"],[[50,54]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(51,Prefix,46,"Blazing",["+# to maximum Energy Shield"],[[49,72]],[NONE,NONE,NONE,INT|STR_INT|DEX_INT,NONE,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(52,Prefix,39,"Razor Sharp",["Adds #-# Physical Damage"],[[7,10],[15,18]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(53,Suffix,44,"of Archaeology",["#% increased Rarity of Items found"],[[15,20]],[ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(54,Prefix,17,"Athlete's",["+# to maximum Life"],[[80,89]],[NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(54,Prefix,39,"Razor Sharp",["Adds #-# Physical Damage"],[[13,18],[27,32]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,NONE,ANY,NONE,ANY,NONE]);
	add(54,Prefix,39,"Razor Sharp",["Adds #-# Physical Damage"],[[20,27],[41,48]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,ANY]);
	add(55,Prefix,6,"Cheetah's",["#% increased Movement Speed"],[[30,30]],[NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(55,Prefix,35,"Winterbringer's",["+# to Level of Cold Gems in this item"],[[2,2]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(55,Prefix,36,"Lava Caller's",["+# to Level of Fire Gems in this item"],[[2,2]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(55,Prefix,37,"Tempest King's",["+# to Level of Lightning Gems in this item"],[[2,2]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(55,Prefix,72,"Paragon's",["+1 to Level of Gems in this item"],[[1,1]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(55,Suffix,12,"of the Galaxy",["+# to all Attributes"],[[21,24]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(55,Suffix,14,"of the Leopard",["+# to Dexterity"],[[33,37]],[ANY,ANY,NONE,DEX|STR_DEX|DEX_INT,ANY,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,ANY,NONE,ANY,ANY,NONE,NONE,ANY,ANY,ANY,NONE,NONE]);
	add(55,Suffix,16,"of the Sage",["+# to Intelligence"],[[33,37]],[ANY,ANY,NONE,ANY,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(55,Suffix,19,"of the Goliath",["+# to Strength"],[[33,37]],[ANY,ANY,ANY,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(55,Suffix,27,"of Prestidigitation",["#% increased Cast Speed"],[[17,19]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(55,Suffix,31,"of Euphoria",["#% increased Mana Regeneration Rate"],[[50,59]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(55,Suffix,32,"of Hoarding",["#% increased Quantity of Items found"],[[13,16]],[ANY,ANY,NONE,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(55,Suffix,68,"of the Zephyr",["#% increased Projectile Speed"],[[34,41]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE]);
	add(56,Prefix,15,"Blurred",["+# to Evasion Rating"],[[139,322]],[NONE,NONE,NONE,NONE,NONE,NONE,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(56,Prefix,25,"Thickened",["#% increased Armour"],[[14,16]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(56,Prefix,28,"Blurred",["#% increased Evasion Rating"],[[14,16]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(56,Prefix,33,"Thaumaturgist's",["#% increased Spell Damage"],[[18,22]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(56,Prefix,42,"Dauntless",["#% increased Energy Shield"],[[14,16]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(56,Suffix,4,"of Adamantite Skin",["#% increased Block and Stun Recovery"],[[23,25]],[NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(56,Suffix,70,"of Expulsion",["+#% to Chaos Resistance"],[[21,25]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(57,Prefix,13,"Plated",["+# to Armour"],[[139,322]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(58,Prefix,15,"Blurred",["+# to Evasion Rating"],[[81,120]],[ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(58,Prefix,23,"Incinerating",["Adds #-# Fire Damage"],[[24,32],[49,57]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(58,Prefix,23,"Incinerating",["Adds #-# Fire Damage"],[[32,43],[65,76]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(58,Prefix,33,"Incanter's",["#% increased Spell Damage"],[[90,104]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(58,Prefix,33,"Incanter's",["#% increased Spell Damage"],[[60,69]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(58,Prefix,34,"Archmage's",["#% increased Spell Damage","+# to maximum Mana"],[[45,50],[23,25]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(58,Prefix,34,"Archmage's",["#% increased Spell Damage","+# to maximum Mana"],[[30,34],[23,25]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(58,Prefix,38,"Glaciated",["Adds #-# Cold Damage"],[[21,28],[43,50]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(58,Prefix,38,"Glaciated",["Adds #-# Cold Damage"],[[29,39],[58,68]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(58,Prefix,47,"Shocking",["Adds #-# Lightning Damage"],[[4,9],[86,91]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,ANY]);
	add(58,Prefix,47,"Shocking",["Adds #-# Lightning Damage"],[[2,5],[47,50]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(58,Prefix,47,"Shocking",["Adds #-# Lightning Damage"],[[6,12],[115,121]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,ANY]);
	add(58,Suffix,51,"of Penetrating",["#% increased Global Critical Strike Chance"],[[30,34]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(58,Suffix,52,"of Staggering",["#% increased Stun Duration on enemies"],[[31,35]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(58,Suffix,53,"of the Gladiator",["#% reduced Enemy Stun Threshold"],[[14,15]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,ANY]);
	add(58,Suffix,63,"of Walling",["#% additional Block Chance"],[[4,6]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(59,Prefix,13,"Plated",["+# to Armour"],[[139,322]],[NONE,NONE,NONE,NONE,NONE,NONE,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(59,Prefix,23,"Incinerating",["Adds #-# Fire Damage"],[[13,18],[27,31]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(59,Prefix,46,"Scintillating",["+# to maximum Energy Shield"],[[32,37]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(59,Suffix,1,"of the Troll",["# Life Regenerated per second"],[[3.6,5.5]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(59,Suffix,5,"of Penetrating",["#% increased Critical Strike Chance"],[[30,34]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(59,Suffix,56,"of Ferocity",["#% increased Global Critical Strike Multiplier"],[[54,66]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(59,Suffix,56,"of Ferocity",["#% increased Global Critical Strike Multiplier"],[[30,34]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(59,Suffix,65,"of Ruin",["#% increased Critical Strike Chance for Spells"],[[80,99]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(60,Prefix,2,"Elephant's",["#% increased Armour","#% increased Block and Stun Recovery"],[[42,50],[14,15]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Prefix,2,"Elephant's",["#% increased Armour","#% increased Block and Stun Recovery"],[[42,50],[14,15]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Prefix,7,"Cruel",["#% increased Physical Damage"],[[130,149]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(60,Prefix,8,"Conqueror's",["#% increased Physical Damage","+# to Accuracy Rating"],[[65,74],[83,99]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(60,Prefix,18,"Chalybeous",["+# to maximum Mana"],[[55,59]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(60,Prefix,25,"Thickened",["#% increased Armour"],[[83,100]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Prefix,26,"Djinn's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[42,50],[14,15]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(60,Prefix,26,"Djinn's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[42,50],[14,15]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(60,Prefix,28,"Phantasm's",["#% increased Evasion Rating"],[[83,100]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Prefix,29,"Dragonfly's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[42,50],[14,15]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Prefix,29,"Dragonfly's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[42,50],[14,15]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Prefix,38,"Glaciated",["Adds #-# Cold Damage"],[[12,16],[24,28]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Prefix,40,"Inculcated",["#% increased Armour and Energy Shield"],[[83,100]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Prefix,41,"Duelist's",["#% increased Armour and Evasion"],[[83,100]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(60,Prefix,42,"Dauntless",["#% increased Energy Shield"],[[83,100]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Prefix,43,"Evanescent",["#% increased Evasion and Energy Shield"],[[83,100]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Prefix,46,"Scintillating",["+# to maximum Energy Shield"],[[73,106]],[NONE,NONE,NONE,NONE,NONE,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Suffix,3,"of Infamy",["#% increased Attack Speed"],[[23,25]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,ANY,ANY]);
	add(60,Suffix,20,"of the Polar Bear",["+#% to Cold Resistance"],[[36,41]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(60,Suffix,21,"of the Volcano",["+#% to Fire Resistance"],[[36,41]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(60,Suffix,22,"of the Maelstrom",["+#% to Lightning Resistance"],[[36,41]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(60,Suffix,67,"of the Rainbow",["+#% to all Elemental Resistances"],[[15,16]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(60,Suffix,71,"of the Apt",["#% reduced Attribute Requirements"],[[-32,-32]],[NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(62,Prefix,44,"Dragon's",["#% increased Rarity of Items found"],[[19,24]],[ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(63,Prefix,59,"Weaponmaster's",["+# to Level of Melee Gems in this item"],[[2,2]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,STR|DEX|STR_DEX,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(63,Suffix,11,"of the Ranger",["+# to Accuracy Rating"],[[251,320]],[ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(63,Suffix,11,"of the Ranger",["+# to Accuracy Rating"],[[251,320]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(64,Prefix,17,"Fecund",["+# to maximum Life"],[[90,99]],[NONE,NONE,ANY,ANY,NONE,NONE,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(64,Prefix,39,"Tempered",["Adds #-# Physical Damage"],[[9,12],[19,22]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(64,Prefix,62,"Sharpshooter's",["+# to Level of Bow Gems in this item"],[[2,2]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE]);
	add(64,Suffix,55,"of Immolation",["#% increased Fire Damage"],[[23,26]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(64,Suffix,64,"of Discharge",["#% increased Lightning Damage"],[[23,26]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(64,Suffix,66,"of Floe",["#% increased Cold Damage"],[[23,26]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(65,Prefix,39,"Tempered",["Adds #-# Physical Damage"],[[16,22],[33,38]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,NONE,ANY,NONE,ANY,NONE]);
	add(65,Prefix,39,"Tempered",["Adds #-# Physical Damage"],[[24,33],[49,57]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,ANY]);
	add(65,Prefix,69,"Summoner's",["+# to Level of Minion Gems in this item"],[[2,2]],[NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(65,Suffix,70,"of Exile",["+#% to Chaos Resistance"],[[26,30]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(66,Suffix,12,"of the Universe",["+# to all Attributes"],[[25,28]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(66,Suffix,14,"of the Jaguar",["+# to Dexterity"],[[38,42]],[ANY,ANY,NONE,DEX|STR_DEX|DEX_INT,ANY,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,ANY,NONE,ANY,ANY,NONE,NONE,ANY,ANY,ANY,NONE,ANY]);
	add(66,Suffix,16,"of the Savant",["+# to Intelligence"],[[38,42]],[ANY,ANY,NONE,ANY,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(66,Suffix,19,"of the Leviathan",["+# to Strength"],[[38,42]],[ANY,ANY,ANY,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(68,Prefix,23,"Blasting",["Adds #-# Fire Damage"],[[28,38],[57,67]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(68,Prefix,23,"Blasting",["Adds #-# Fire Damage"],[[39,52],[79,92]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,ANY]);
	add(68,Prefix,46,"Incandescent",["+# to maximum Energy Shield"],[[38,43]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(68,Prefix,47,"Discharging",["Adds #-# Lightning Damage"],[[5,11],[100,106]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(68,Prefix,47,"Discharging",["Adds #-# Lightning Damage"],[[6,15],[140,148]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,ANY]);
	add(69,Prefix,18,"Mazarine",["+# to maximum Mana"],[[60,64]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(69,Prefix,38,"Polar",["Adds #-# Cold Damage"],[[35,46],[70,81]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(69,Prefix,38,"Polar",["Adds #-# Cold Damage"],[[25,33],[50,59]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,NONE]);
	add(69,Prefix,46,"Incandescent",["+# to maximum Energy Shield"],[[107,135]],[NONE,NONE,NONE,NONE,NONE,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(69,Prefix,47,"Discharging",["Adds #-# Lightning Damage"],[[3,6],[57,61]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(70,Prefix,15,"Vaporous",["+# to Evasion Rating"],[[323,400]],[NONE,NONE,NONE,NONE,NONE,NONE,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(70,Prefix,23,"Blasting",["Adds #-# Fire Damage"],[[16,22],[32,38]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(70,Prefix,25,"Solid",["#% increased Armour"],[[17,19]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(70,Prefix,28,"Phased",["#% increased Evasion Rating"],[[17,19]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(70,Prefix,42,"Indomitable",["#% increased Energy Shield"],[[17,19]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(71,Prefix,13,"Carapaced",["+# to Armour"],[[323,400]],[NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(71,Prefix,38,"Polar",["Adds #-# Cold Damage"],[[14,19],[29,34]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(72,Prefix,15,"Phased",["+# to Evasion Rating"],[[121,150]],[ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(72,Prefix,25,"Girded",["#% increased Armour"],[[101,120]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(72,Prefix,28,"Nightmare's",["#% increased Evasion Rating"],[[101,120]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(72,Prefix,40,"Interpolated",["#% increased Armour and Energy Shield"],[[100,120]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(72,Prefix,41,"Hero's",["#% increased Armour and Evasion"],[[100,120]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(72,Prefix,42,"Unconquerable",["#% increased Energy Shield"],[[101,120]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(72,Prefix,43,"Unreal",["#% increased Evasion and Energy Shield"],[[100,120]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(72,Prefix,60,"Vampire's",["#% of Physical Attack Damage Leeched as Life"],[[5,6]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(72,Suffix,20,"of the Ice",["+#% to Cold Resistance"],[[42,45]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(72,Suffix,21,"of the Magma",["+#% to Fire Resistance"],[[42,45]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(72,Suffix,22,"of the Lightning",["+#% to Lightning Resistance"],[[42,45]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(72,Suffix,27,"of Sortilege",["#% increased Cast Speed"],[[20,22]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(72,Suffix,51,"of Incision",["#% increased Global Critical Strike Chance"],[[35,38]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(73,Prefix,7,"Tyrannical",["#% increased Physical Damage"],[[150,169]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(73,Prefix,8,"Emperor's",["#% increased Physical Damage","+# to Accuracy Rating"],[[75,80],[100,135]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(73,Prefix,13,"Carapaced",["+# to Armour"],[[323,400]],[NONE,NONE,NONE,NONE,NONE,NONE,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(73,Prefix,17,"Vigorous",["+# to maximum Life"],[[100,109]],[NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(73,Suffix,5,"of Incision",["#% increased Critical Strike Chance"],[[35,38]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(73,Suffix,56,"of Destruction",["#% increased Global Critical Strike Multiplier"],[[35,38]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE]);
	add(74,Prefix,23,"Cremating",["Adds #-# Fire Damage"],[[46,62],[93,109]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,ANY]);
	add(74,Prefix,23,"Cremating",["Adds #-# Fire Damage"],[[30,41],[62,72]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,ANY]);
	add(74,Prefix,46,"Resplendent",["+# to maximum Energy Shield"],[[44,47]],[NONE,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(74,Prefix,47,"Electrocuting",["Adds #-# Lightning Damage"],[[5,11],[108,115]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,ANY]);
	add(74,Prefix,47,"Electrocuting",["Adds #-# Lightning Damage"],[[8,17],[163,172]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,ANY]);
	add(74,Prefix,61,"Parched",["#% of Physical Attack Damage Leeched as Mana"],[[3,4]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(74,Suffix,14,"of the Phantasm",["+# to Dexterity"],[[43,50]],[ANY,ANY,NONE,DEX|STR_DEX|DEX_INT,ANY,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,DEX|STR_DEX|DEX_INT,ANY,NONE,ANY,ANY,NONE,NONE,ANY,ANY,ANY,NONE,ANY]);
	add(74,Suffix,16,"of the Virtuoso",["+# to Intelligence"],[[43,50]],[ANY,ANY,NONE,ANY,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(74,Suffix,19,"of the Titan",["+# to Strength"],[[43,50]],[ANY,ANY,ANY,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,STR|STR_DEX|STR_INT,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(74,Suffix,56,"of Destruction",["#% increased Global Critical Strike Multiplier"],[[67,70]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(75,Prefix,18,"Blue",["+# to maximum Mana"],[[65,68]],[ANY,ANY,NONE,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,INT|STR_INT|DEX_INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(75,Prefix,38,"Entombing",["Adds #-# Cold Damage"],[[41,55],[82,96]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,NONE,NONE]);
	add(75,Prefix,38,"Entombing",["Adds #-# Cold Damage"],[[27,36],[55,64]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,NONE,ANY,ANY]);
	add(75,Prefix,46,"Resplendent",["+# to maximum Energy Shield"],[[136,145]],[NONE,NONE,NONE,NONE,NONE,NONE,INT|STR_INT|DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(75,Prefix,48,"Unleashed",["#% increased Elemental Damage with Weapons"],[[31,36]],[ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY]);
	add(75,Suffix,44,"of Excavation",["#% increased Rarity of Items found"],[[21,26]],[ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(76,Prefix,23,"Cremating",["Adds #-# Fire Damage"],[[19,25],[39,45]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(76,Prefix,33,"Wizard's",["#% increased Spell Damage"],[[23,26]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(76,Prefix,39,"Flaring",["Adds #-# Physical Damage"],[[11,15],[22,26]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(76,Prefix,47,"Electrocuting",["Adds #-# Lightning Damage"],[[3,7],[68,72]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(76,Suffix,3,"of Grandmastery",["#% increased Attack Speed"],[[14,16]],[NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(76,Suffix,11,"of the Assassin",["+# to Accuracy Rating"],[[321,400]],[ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(76,Suffix,55,"of Ashes",["#% increased Fire Damage"],[[27,30]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(76,Suffix,64,"of Arcing",["#% increased Lightning Damage"],[[27,30]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(76,Suffix,65,"of Unmaking",["#% increased Critical Strike Chance for Spells"],[[100,109]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(76,Suffix,66,"of Glaciation",["#% increased Cold Damage"],[[27,30]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	add(77,Prefix,25,"Impregnable",["#% increased Armour"],[[20,22]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(77,Prefix,28,"Vaporous",["#% increased Evasion Rating"],[[20,22]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(77,Prefix,38,"Entombing",["Adds #-# Cold Damage"],[[17,22],[34,40]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(77,Prefix,39,"Flaring",["Adds #-# Physical Damage"],[[19,25],[38,45]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,NONE,ANY,NONE,ANY,ANY]);
	add(77,Prefix,39,"Flaring",["Adds #-# Physical Damage"],[[29,38],[58,68]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,NONE,ANY,NONE,NONE]);
	add(77,Prefix,42,"Unassailable",["#% increased Energy Shield"],[[20,22]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(77,Suffix,3,"of Celebration",["#% increased Attack Speed"],[[26,27]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,ANY,ANY,ANY,NONE,ANY,ANY,ANY,NONE]);
	add(77,Suffix,12,"of the Infinite",["+# to all Attributes"],[[29,32]],[NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(77,Suffix,32,"of Amassment",["#% increased Quantity of Items found"],[[17,20]],[ANY,ANY,NONE,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(78,Prefix,2,"Mammoth's",["#% increased Armour","#% increased Block and Stun Recovery"],[[51,56],[16,17]],[NONE,NONE,NONE,STR,STR,STR,STR,STR,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(78,Prefix,2,"Mammoth's",["#% increased Armour","#% increased Block and Stun Recovery"],[[51,56],[16,17]],[NONE,NONE,NONE,STR_DEX,STR_DEX,STR_DEX,STR_DEX,STR_DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(78,Prefix,26,"Seraphim's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[51,56],[16,17]],[NONE,NONE,NONE,STR_INT,STR_INT,STR_INT,STR_INT,STR_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(78,Prefix,26,"Seraphin's",["#% increased Armour and Energy Shield","#% increased Block and Stun Recovery"],[[51,56],[16,17]],[NONE,NONE,NONE,INT,INT,INT,INT,INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY]);
	add(78,Prefix,29,"Hummingbird's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[51,56],[16,17]],[NONE,NONE,NONE,DEX,DEX,DEX,DEX,DEX,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(78,Prefix,29,"Hummingbird's",["#% increased Evasion Rating","#% increased Block and Stun Recovery"],[[51,56],[16,17]],[NONE,NONE,NONE,DEX_INT,DEX_INT,DEX_INT,DEX_INT,DEX_INT,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(78,Suffix,1,"of the Phoenix",["# Life Regenerated per second"],[[6,7]],[ANY,ANY,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(79,Prefix,33,"Glyphic's",["#% increased Spell Damage"],[[105,110]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,ANY,NONE,NONE,NONE,NONE,NONE]);
	add(79,Prefix,33,"Glyphic's",["#% increased Spell Damage"],[[70,74]],[NONE,NONE,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,NONE,ANY,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(79,Suffix,4,"of Corundum Skin",["#% increased Block and Stun Recovery"],[[26,28]],[NONE,NONE,ANY,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE]);
	add(79,Suffix,31,"of Nirvana",["#% increased Mana Regeneration Rate"],[[60,69]],[ANY,ANY,NONE,NONE,NONE,NONE,NONE,INT,NONE,ANY,ANY,ANY,ANY,ANY,NONE,NONE,NONE,NONE,ANY]);
	
	return mods;
})();