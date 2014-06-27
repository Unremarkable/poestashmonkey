/*
"+# to Energy Shield" : {
	"affix" : "Prefix",
	"level" : 35,
	"name"  : "Pulsing",
	"properties" : [
		{
			"name"  : "+# to Energy Shield",
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

var Affixes = (function() {;
	var types = [
		"Ring", "Amulet", "Belt", "Helmet", "Glove", "Boot", "Chest", "Shield", "Quiver", "Wand", "Dagger", "Claw", "Sceptre", "Staff", "Bow", "SlashingOneHanded", "SlashingTwoHanded", "BludgeoningOneHanded", "BludgeoningTwoHanded"
	];
	
	var mods = {};
	
	for (var i = 0; i < types.length; ++i) {
		mods[types[i]] = {};
	}
	
	function add(level, affix, name, properties, typemask) {
		var o = {
			"level"      : level,
			"affix"      : affix,
			"name"       : name,
			"properties" : properties.map(function(p) { return { "name" : p[0], "range" : p[1].map(function(r) { return { "min" : r[0], "max" : r[1] }; }) }; })
		};
		
		for (var i = 0; i < types.length; ++i) {
			if (typemask[i] == 0)
				continue;
			
			if (!mods[types[i]][properties[0][0]])
				mods[types[i]][properties[0][0]] = [];
				
			mods[types[i]][properties[0][0]].push(o);
		}
	}
	
	var Prefix = "Prefix";
	var Suffix = "Suffix";

	add( 1,Prefix,"Beetle's",[["#% increased Armour",[[6,14]]],["#% increased Block and Stun Recovery",[[6,7]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Prefix,"Heavy",[["#% increased Physical Damage",[[20,49]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add( 1,Prefix,"Squire's",[["#% increased Physical Damage",[[10,24]]],["+# to Accuracy Rating",[[3,7]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add( 1,Prefix,"Beryl",[["+# to maximum Mana",[[15,19]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add( 1,Prefix,"Heated",[["Adds #-# Fire Damage",[[1,2],[3,4]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add( 1,Prefix,"Runner's",[["#% increased Movement Speed",[[10,10]]]],[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Prefix,"Lacquered",[["+# to Armour",[[3,10]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Prefix,"Lacquered",[["+# to Armour",[[3,10]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Prefix,"Agile",[["+# to Evasion Rating",[[3,10]]]],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Prefix,"Agile",[["+# to Evasion Rating",[[3,10]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Prefix,"Healthy",[["+# to maximum Life",[[10,19]]]],[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Prefix,"Heated",[["Adds #-# Fire Damage",[[1,1],[2,2]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Prefix,"Heated",[["Adds #-# Fire Damage",[[2,3],[5,6]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add( 1,Prefix,"Thorny",[["Reflects # Physical Damage to Melee Attackers",[[1,4]]]],[0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Suffix,"of the Newt",[["# Life Regenerated per second",[[0.7,1.1]]]],[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Suffix,"of Skill",[["#% increased Attack Speed",[[5,7]]]],[1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add( 1,Suffix,"of Skill",[["#% increased Attack Speed",[[6,9]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add( 1,Suffix,"of Needling",[["#% increased Critical Strike Chance",[[10,14]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add( 1,Suffix,"of Thick Skin",[["#% increased Block and Stun Recovery",[[11,13]]]],[0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Suffix,"of Success",[["+# Life gained on Kill",[[2,4]]]],[1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add( 1,Suffix,"of Absorption",[["+# Mana gained on Kill",[[1,1]]]],[1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add( 1,Suffix,"of Calm",[["+# to Accuracy Rating",[[5,15]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add( 1,Suffix,"of the Pupil",[["+# to Intelligence",[[8,12]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add( 1,Suffix,"of the Inuit",[["+#% to Cold Resistance",[[6,11]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add( 1,Suffix,"of the Whelpling",[["+#% to Fire Resistance",[[6,11]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add( 1,Suffix,"of the Cloud",[["+#% to Lightning Resistance",[[6,11]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add( 1,Suffix,"of Calm",[["+# to Accuracy Rating",[[5,15]]]],[1,1,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add( 1,Suffix,"of the Clouds",[["+# to all Attributes",[[1,4]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 1,Suffix,"of the Mongoose",[["+# to Dexterity",[[8,12]]]],[1,1,0,1,1,1,1,1,1,0,1,1,0,0,1,1,1,0,0]);
	add( 1,Suffix,"of the Brute",[["+# to Strength",[[8,12]]]],[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]);
	add( 2,Prefix,"Reinforced",[["#% increased Armour",[[2,4]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 2,Prefix,"Beetle's",[["#% increased Armour",[[6,14]]],["#% increased Block and Stun Recovery",[[6,7]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 2,Prefix,"Pixie's",[["#% increased Armour and Energy Shield",[[6,14]]],["#% increased Block and Stun Recovery",[[6,7]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 2,Prefix,"Apprentice's",[["#% increased Spell Damage",[[10,19]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0]);
	add( 2,Prefix,"Caster's",[["#% increased Spell Damage",[[5,9]]],["+# to maximum Mana",[[8,10]]]],[0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0]);
	add( 2,Prefix,"Frost Weaver's",[["+# to Level of Cold Gems in this item",[[1,1]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0]);
	add( 2,Prefix,"Flame Spinner's",[["+# to Level of Fire Gems in this item",[[1,1]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0]);
	add( 2,Prefix,"Thunder Lord's",[["+# to Level of Lightning Gems in this item",[[1,1]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0]);
	add( 2,Prefix,"Frosted",[["Adds #-# Cold Damage",[[2,4]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add( 2,Prefix,"Glinting",[["Adds #-# Physical Damage",[[1,1],[2,3]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,1,0]);
	add( 2,Prefix,"Agile",[["#% increased Evasion Rating",[[2,4]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 2,Prefix,"Mosquito's",[["#% increased Evasion Rating",[[6,14]]],["#% increased Block and Stun Recovery",[[6,7]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 2,Prefix,"Mosquito's",[["#% increased Evasion Rating",[[6,14]]],["#% increased Block and Stun Recovery",[[6,7]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 2,Prefix,"Apprentice's",[["#% increased Spell Damage",[[15,29]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add( 2,Prefix,"Caster's",[["#% increased Spell Damage",[[8,14]]],["+# to maximum Mana",[[8,10]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add( 2,Prefix,"Frosted",[["Adds #-# Cold Damage",[[1,1],[2,2]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add( 2,Prefix,"Frosted",[["Adds #-# Cold Damage",[[2,4],[6,7]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add( 2,Prefix,"Glinting",[["Adds #-# Physical Damage",[[2,2],[4,5]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1]);
	add( 2,Suffix,"of Talent",[["#% increased Cast Speed",[[5,7]]]],[1,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add( 2,Suffix,"of Excitement",[["#% increased Mana Regeneration Rate",[[10,19]]]],[1,1,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,0,0]);
	add( 2,Suffix,"of Refilling",[["#% increased Flask Charges gained",[[10,20]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 2,Suffix,"of Collecting",[["#% increased Quantity of Items found",[[4,8]]]],[1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 3,Prefix,"Reinforced",[["#% increased Armour",[[11,28]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 3,Prefix,"Infixed",[["#% increased Armour and Energy Shield",[[11,28]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 3,Prefix,"Pixie's",[["#% increased Armour and Energy Shield",[[6,14]]],["#% increased Block and Stun Recovery",[[6,7]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 3,Prefix,"Scrapper's",[["#% increased Armour and Evasion",[[11,28]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add( 3,Prefix,"Humming",[["Adds #-# Lightning Damage",[[1,1],[9,10]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add( 3,Prefix,"Shadowy",[["#% increased Evasion and Energy Shield",[[11,28]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 3,Prefix,"Shade's",[["#% increased Evasion Rating",[[11,28]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 3,Prefix,"Protective",[["#% increased maximum Energy Shield",[[11,28]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 3,Prefix,"Protective",[["#% increased maximum Energy Shield",[[2,4]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 3,Prefix,"Shining",[["+# to Energy Shield",[[1,3]]]],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add( 3,Prefix,"Shining",[["+# to maximum Energy Shield",[[3,5]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add( 3,Prefix,"Humming",[["Adds #-# Lightning Damage",[[1,1],[5,5]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add( 3,Prefix,"Humming",[["Adds #-# Lightning Damage",[[1,1],[14,15]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1]);
	add( 3,Suffix,"of Plunder",[["#% increased Rarity of Items found",[[6,10]]]],[1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 3,Suffix,"of Sipping",[["#% reduced Flask Charges used",[[-20,-10]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add( 4,Prefix,"Catalyzing",[["#% increased Elemental Damage with Weapons",[[5,10]]]],[1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add( 5,Prefix,"Recovering",[["#% increased Flask Life Recovery rate",[[10,20]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 5,Prefix,"Inspiring",[["#% increased Flask Mana Recovery rate",[[10,20]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 5,Prefix,"Chanter's",[["#% increased Spell Damage",[[3,7]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 5,Prefix,"Glinting",[["Adds #-# Physical Damage",[[1,1],[2,2]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add( 5,Suffix,"of Impact",[["#% increased Stun Duration on enemies",[[11,15]]]],[0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add( 5,Suffix,"of Needling",[["#% increased Global Critical Strike Chance",[[10,14]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add( 5,Suffix,"of the Pugilist",[["#% reduced Enemy Stun Threshold",[[5,7]]]],[0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1]);
	add( 7,Suffix,"of Savouring",[["#% increased Flask effect duration",[[10,20]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add( 8,Prefix,"Combatant's",[["+# to Level of Melee Gems in this item",[[1,1]]]],[0,0,0,0,0,0,0,1,0,0,1,1,1,1,0,1,1,1,0]);
	add( 8,Suffix,"of Embers",[["#% increased Fire Damage",[[3,7]]]],[1,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add( 8,Suffix,"of Ire",[["#% increased Global Critical Strike Multiplier",[[7,12]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add( 8,Suffix,"of Rejuvenation",[["+# Life gained for each enemy hit by your Attacks",[[2,2]]]],[1,1,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add( 8,Suffix,"of Shining",[["+# to Accuracy Rating",[[5,5]]],["#% increased Light Radius",[[10,20]]]],[1,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add( 8,Suffix,"of Ire",[["#% increased Global Critical Strike Multiplier",[[7,12]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add( 9,Prefix,"Remora's",[["#% of Physical Attack Damage Leeched as Life",[[1,2]]]],[1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add( 9,Prefix,"Thirsty",[["#% of Physical Attack Damage Leeched as Mana",[[1,2]]]],[1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add( 9,Prefix,"Fletcher's",[["+# to Level of Bow Gems in this item",[[1,1]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0]);
	add(10,Prefix,"Spiny",[["Reflects # Physical Damage to Melee Attackers",[[5,10]]]],[0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(10,Suffix,"of Intercepting",[["#% additional Block Chance",[[1,3]]]],[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(10,Suffix,"of Sparks",[["#% increased Lightning Damage",[[3,7]]]],[1,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(11,Prefix,"Serrated",[["#% increased Physical Damage",[[50,69]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(11,Prefix,"Journeyman's",[["#% increased Physical Damage",[[25,34]]],["+# to Accuracy Rating",[[8,30]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(11,Prefix,"Adept's",[["#% increased Spell Damage",[[20,29]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0]);
	add(11,Prefix,"Magician's",[["#% increased Spell Damage",[[10,14]]],["+# to maximum Mana",[[11,13]]]],[0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0]);
	add(11,Prefix,"Cobalt",[["+# to maximum Mana",[[20,24]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(11,Prefix,"Adept's",[["#% increased Spell Damage",[[30,44]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(11,Prefix,"Magician's",[["#% increased Spell Damage",[[15,22]]],["+# to maximum Mana",[[11,13]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(11,Prefix,"Glimmering",[["+# to Energy Shield",[[4,8]]]],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(11,Prefix,"Glimmering",[["+# to maximum Energy Shield",[[6,8]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(11,Prefix,"Sanguine",[["+# to maximum Life",[[20,29]]]],[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0]);
	add(11,Suffix,"of Ease",[["#% increased Attack Speed",[[8,10]]]],[0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add(11,Suffix,"of Ease",[["#% increased Attack Speed",[[5,10]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(11,Suffix,"of Menace",[["#% increased Critical Strike Chance for Spells",[[11,20]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0]);
	add(11,Suffix,"of the Student",[["+# to Intelligence",[[13,17]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(11,Suffix,"of the Sky",[["+# to all Attributes",[[5,8]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(11,Suffix,"of the Lynx",[["+# to Dexterity",[[13,17]]]],[1,1,0,1,1,1,1,1,1,0,1,1,0,0,1,1,1,0,0]);
	add(11,Suffix,"of the Wrestler",[["+# to Strength",[[13,17]]]],[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]);
	add(12,Prefix,"Smoldering",[["Adds #-# Fire Damage",[[6,8],[12,14]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,1]);
	add(12,Prefix,"Smoldering",[["Adds #-# Fire Damage",[[3,5],[7,8]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(12,Prefix,"Smoldering",[["Adds #-# Fire Damage",[[8,11],[17,20]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(12,Suffix,"of Snow",[["#% increased Cold Damage",[[3,7]]]],[1,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(12,Suffix,"of Steadiness",[["+# to Accuracy Rating",[[16,60]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(12,Suffix,"of the Salamander",[["+#% to Fire Resistance",[[12,17]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(12,Suffix,"of Steadiness",[["+# to Accuracy Rating",[[16,60]]]],[1,1,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add(12,Suffix,"of the Crystal",[["+#% to all Elemental Resistances",[[3,5]]]],[1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(13,Prefix,"Chilled",[["Adds #-# Cold Damage",[[5,7],[11,13]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(13,Prefix,"Buzzing",[["Adds #-# Lightning Damage",[[1,2],[23,25]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(13,Prefix,"Burnished",[["Adds #-# Physical Damage",[[4,5],[8,10]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,1,1]);
	add(13,Prefix,"Chilled",[["Adds #-# Cold Damage",[[3,4],[7,8]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(13,Prefix,"Chilled",[["Adds #-# Cold Damage",[[8,10],[16,19]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(13,Prefix,"Buzzing",[["Adds #-# Lightning Damage",[[1,1],[14,15]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add(13,Prefix,"Buzzing",[["Adds #-# Lightning Damage",[[1,3],[35,37]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1]);
	add(13,Prefix,"Burnished",[["Adds #-# Physical Damage",[[2,3],[4,5]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add(13,Prefix,"Burnished",[["Adds #-# Physical Damage",[[6,8],[12,14]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1]);
	add(13,Suffix,"of the Squall",[["+#% to Lightning Resistance",[[12,17]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	add(14,Prefix,"Reanimator's",[["+# to Level of Minion Gems in this item",[[1,1]]]],[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(14,Suffix,"of Darting",[["#% increased Projectile Speed",[[10,17]]]],[0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0]);
	add(14,Suffix,"of the Seal",[["+#% to Cold Resistance",[[12,17]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(15,Prefix,"Infusing",[["#% increased Elemental Damage with Weapons",[[11,20]]]],[1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add(15,Prefix,"Sprinter's",[["#% increased Movement Speed",[[15,15]]]],[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(15,Suffix,"of Nimbleness",[["#% increased Cast Speed",[[8,10]]]],[0,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(15,Suffix,"of Light",[["+# to Accuracy Rating",[[10,10]]],["#% increased Light Radius",[[21,40]]]],[1,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(16,Suffix,"of the Lost",[["+#% to Chaos Resistance",[[5,10]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(17,Prefix,"Layered",[["#% increased Armour",[[29,46]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(17,Prefix,"Crab's",[["#% increased Armour",[[15,23]]],["#% increased Block and Stun Recovery",[[8,9]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(17,Prefix,"Azure",[["+# to maximum Mana",[[25,29]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(17,Prefix,"Glittering",[["+# to Energy Shield",[[9,12]]]],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(17,Prefix,"Glittering",[["+# to maximum Energy Shield",[[9,12]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(17,Suffix,"of Stone Skin",[["#% increased Block and Stun Recovery",[[14,16]]]],[0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(18,Prefix,"Layered",[["#% increased Armour",[[5,7]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(18,Prefix,"Gremlin's",[["#% increased Armour and Energy Shield",[[15,23]]],["#% increased Block and Stun Recovery",[[8,9]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(18,Prefix,"Strong-Willed",[["#% increased maximum Energy Shield",[[29,46]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(18,Prefix,"Strong-Willed",[["#% increased maximum Energy Shield",[[5,7]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(18,Prefix,"Studded",[["+# to Armour",[[11,35]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(18,Prefix,"Studded",[["+# to Armour",[[11,35]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(18,Prefix,"Dancer's",[["+# to Evasion Rating",[[11,35]]]],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(18,Prefix,"Dancer's",[["+# to Evasion Rating",[[11,35]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(18,Prefix,"Stalwart",[["+# to maximum Life",[[30,39]]]],[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0]);
	add(18,Suffix,"of the Lizard",[["# Life Regenerated per second",[[1.6,2.4]]]],[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(18,Suffix,"of Joy",[["#% increased Mana Regeneration Rate",[[20,29]]]],[1,1,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(18,Suffix,"of Dazing",[["#% increased Stun Duration on enemies",[[16,20]]]],[0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add(19,Prefix,"Crab's",[["#% increased Armour",[[15,23]]],["#% increased Block and Stun Recovery",[[8,9]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(19,Prefix,"Ingrained",[["#% increased Armour and Energy Shield",[[29,46]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(19,Prefix,"Gremlin's",[["#% increased Armour and Energy Shield",[[15,23]]],["#% increased Block and Stun Recovery",[[8,9]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(19,Prefix,"Brawler's",[["#% increased Armour and Evasion",[[29,46]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(19,Prefix,"Ethereal",[["#% increased Evasion and Energy Shield",[[29,46]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(19,Prefix,"Dancer's",[["#% increased Evasion Rating",[[5,7]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(19,Prefix,"Ghost's",[["#% increased Evasion Rating",[[29,46]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(19,Prefix,"Moth's",[["#% increased Evasion Rating",[[15,23]]],["#% increased Block and Stun Recovery",[[8,9]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(19,Prefix,"Moth's",[["#% increased Evasion Rating",[[15,23]]],["#% increased Block and Stun Recovery",[[8,9]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(19,Prefix,"Polished",[["Adds #-# Physical Damage",[[3,4],[6,7]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add(20,Prefix,"Smoking",[["Adds #-# Fire Damage",[[9,12],[19,22]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(20,Prefix,"Magpie's",[["#% increased Rarity of Items found",[[8,12]]]],[1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(20,Prefix,"Mage's",[["#% increased Spell Damage",[[8,12]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(20,Prefix,"Smoking",[["Adds #-# Fire Damage",[[5,7],[11,13]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(20,Prefix,"Smoking",[["Adds #-# Fire Damage",[[12,17],[26,30]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(20,Prefix,"Barbed",[["Reflects # Physical Damage to Melee Attackers",[[11,24]]]],[0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(20,Suffix,"of Stinging",[["#% increased Global Critical Strike Chance",[[15,19]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(20,Suffix,"of Stinging",[["#% increased Critical Strike Chance",[[15,19]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(20,Suffix,"of Restoration",[["+# Life gained for each enemy hit by your Attacks",[[3,3]]]],[1,1,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(20,Suffix,"of Accuracy",[["+# to Accuracy Rating",[[61,100]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(20,Suffix,"of the Brawler",[["#% reduced Enemy Stun Threshold",[[8,9]]]],[0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1]);
	add(20,Suffix,"of Accuracy",[["+# to Accuracy Rating",[[61,100]]]],[1,1,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add(21,Prefix,"Icy",[["Adds #-# Cold Damage",[[8,11],[17,20]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(21,Prefix,"Polished",[["Adds #-# Physical Damage",[[6,8],[12,14]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,1,0]);
	add(21,Prefix,"Icy",[["Adds #-# Cold Damage",[[5,7],[10,12]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(21,Prefix,"Icy",[["Adds #-# Cold Damage",[[11,15],[23,27]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(21,Prefix,"Polished",[["Adds #-# Physical Damage",[[9,12],[18,21]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1]);
	add(21,Suffix,"of Anger",[["#% increased Global Critical Strike Multiplier",[[13,26]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(21,Suffix,"of Havoc",[["#% increased Critical Strike Chance for Spells",[[20,39]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0]);
	add(21,Suffix,"of Anger",[["#% increased Global Critical Strike Multiplier",[[15,19]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(22,Prefix,"Snapping",[["Adds #-# Lightning Damage",[[1,3],[36,38]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(22,Prefix,"Snapping",[["Adds #-# Lightning Damage",[[1,2],[22,23]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add(22,Prefix,"Snapping",[["Adds #-# Lightning Damage",[[2,5],[47,50]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(22,Suffix,"of Mastery",[["#% increased Attack Speed",[[11,13]]]],[0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add(22,Suffix,"of Mastery",[["#% increased Attack Speed",[[11,13]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(22,Suffix,"of Coals",[["#% increased Fire Damage",[[8,12]]]],[1,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(22,Suffix,"of the Prodigy",[["+# to Intelligence",[[18,22]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(22,Suffix,"of the Meteor",[["+# to all Attributes",[[9,12]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(22,Suffix,"of the Fox",[["+# to Dexterity",[[18,22]]]],[1,1,0,1,1,1,1,1,1,0,1,1,0,0,1,1,1,0,0]);
	add(22,Suffix,"of the Bear",[["+# to Strength",[[18,22]]]],[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]);
	add(23,Prefix,"Wicked",[["#% increased Physical Damage",[[70,89]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(23,Prefix,"Reaver's",[["#% increased Physical Damage",[[35,44]]],["+# to Accuracy Rating",[[31,50]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(23,Prefix,"Scholar's",[["#% increased Spell Damage",[[30,39]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,1]);
	add(23,Prefix,"Wizard's",[["#% increased Spell Damage",[[15,19]]],["+# to maximum Mana",[[14,16]]]],[0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,1]);
	add(23,Prefix,"Sapphire",[["+# to maximum Mana",[[30,34]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(23,Prefix,"Scholar's",[["#% increased Spell Damage",[[45,59]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(23,Prefix,"Wizard's",[["#% increased Spell Damage",[[23,29]]],["+# to maximum Mana",[[14,16]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(23,Prefix,"Glowing",[["+# to Energy Shield",[[13,15]]]],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(23,Prefix,"Glowing",[["+# to maximum Energy Shield",[[13,15]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(23,Suffix,"of Static",[["#% increased Lightning Damage",[[8,12]]]],[1,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(23,Suffix,"of Victory",[["+# Life gained on Kill",[[5,7]]]],[1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add(24,Prefix,"Stout",[["+# to maximum Life",[[40,49]]]],[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1]);
	add(24,Suffix,"of Sleet",[["#% increased Cold Damage",[[8,12]]]],[1,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(24,Suffix,"of Osmosis",[["+# Mana gained on Kill",[[2,3]]]],[1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add(24,Suffix,"of the Drake",[["+#% to Fire Resistance",[[18,23]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(24,Suffix,"of the Prism",[["+#% to all Elemental Resistances",[[6,8]]]],[1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(25,Prefix,"Lamprey's",[["#% of Physical Attack Damage Leeched as Life",[[3,5]]]],[0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(25,Suffix,"of the Storm",[["+#% to Lightning Resistance",[[18,23]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(26,Suffix,"of Precision",[["+# to Accuracy Rating",[[101,130]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(26,Suffix,"of the Penguin",[["+#% to Cold Resistance",[[18,23]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(26,Suffix,"of Precision",[["+# to Accuracy Rating",[[101,130]]]],[1,1,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add(27,Suffix,"of Flight",[["#% increased Projectile Speed",[[18,25]]]],[0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0]);
	add(28,Prefix,"Burning",[["Adds #-# Fire Damage",[[12,16],[25,29]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(28,Prefix,"Burning",[["Adds #-# Fire Damage",[[7,10],[15,18]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(28,Prefix,"Burning",[["Adds #-# Fire Damage",[[17,23],[35,41]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(28,Prefix,"Honed",[["Adds #-# Physical Damage",[[4,6],[9,10]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1]);
	add(28,Suffix,"of Iron Skin",[["#% increased Block and Stun Recovery",[[17,19]]]],[0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(28,Suffix,"of Disaster",[["#% increased Critical Strike Chance for Spells",[[40,59]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0]);
	add(29,Prefix,"Lobstered",[["#% increased Armour",[[47,64]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(29,Prefix,"Armadillo's",[["#% increased Armour",[[24,32]]],["#% increased Block and Stun Recovery",[[10,11]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(29,Prefix,"Cerulean",[["+# to maximum Mana",[[35,39]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(29,Prefix,"Frigid",[["Adds #-# Cold Damage",[[11,15],[22,26]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(29,Prefix,"Honed",[["Adds #-# Physical Damage",[[7,10],[15,18]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,1,0]);
	add(29,Prefix,"Radiating",[["+# to Energy Shield",[[16,19]]]],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(29,Prefix,"Acrobat's",[["+# to Evasion Rating",[[36,60]]]],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(29,Prefix,"Acrobat's",[["+# to Evasion Rating",[[36,60]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(29,Prefix,"Radiating",[["+# to maximum Energy Shield",[[16,19]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(29,Prefix,"Frigid",[["Adds #-# Cold Damage",[[6,9],[13,16]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(29,Prefix,"Frigid",[["Adds #-# Cold Damage",[[16,21],[32,37]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(29,Prefix,"Honed",[["Adds #-# Physical Damage",[[11,15],[23,27]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1]);
	add(29,Suffix,"of Elation",[["#% increased Mana Regeneration Rate",[[30,39]]]],[1,1,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(30,Prefix,"Lobstered",[["#% increased Armour",[[8,10]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Armadillo's",[["#% increased Armour",[[24,32]]],["#% increased Block and Stun Recovery",[[10,11]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Instilled",[["#% increased Armour and Energy Shield",[[47,64]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Boggart's",[["#% increased Armour and Energy Shield",[[24,32]]],["#% increased Block and Stun Recovery",[[10,11]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Boggart's",[["#% increased Armour and Energy Shield",[[24,32]]],["#% increased Block and Stun Recovery",[[10,11]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Fencer's",[["#% increased Armour and Evasion",[[47,64]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(30,Prefix,"Unworldly",[["#% increased Evasion and Energy Shield",[[47,64]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Acrobat's",[["#% increased Evasion Rating",[[8,10]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Spectre's",[["#% increased Evasion Rating",[[47,64]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Butterfly's",[["#% increased Evasion Rating",[[24,32]]],["#% increased Block and Stun Recovery",[[10,11]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Butterfly's",[["#% increased Evasion Rating",[[24,32]]],["#% increased Block and Stun Recovery",[[10,11]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Resolute",[["#% increased maximum Energy Shield",[[47,64]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Resolute",[["#% increased maximum Energy Shield",[[8,10]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Stallion's",[["#% increased Movement Speed",[[20,20]]]],[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Empowering",[["#% increased Elemental Damage with Weapons",[[21,30]]]],[1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add(30,Prefix,"Crackling",[["Adds #-# Lightning Damage",[[2,5],[47,50]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,1]);
	add(30,Prefix,"Ribbed",[["+# to Armour",[[36,60]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Ribbed",[["+# to Armour",[[36,60]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Robust",[["+# to maximum Life",[[50,59]]]],[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1]);
	add(30,Prefix,"Crackling",[["Adds #-# Lightning Damage",[[1,2],[27,28]]]],[1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(30,Prefix,"Crackling",[["Adds #-# Lightning Damage",[[3,7],[73,77]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(30,Suffix,"of the Starfish",[["# Life Regenerated per second",[[2.2,3.3]]]],[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Suffix,"of Renown",[["#% increased Attack Speed",[[14,16]]]],[0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1]);
	add(30,Suffix,"of Piercing",[["#% increased Global Critical Strike Chance",[[20,24]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(30,Suffix,"of Raiding",[["#% increased Rarity of Items found",[[11,14]]]],[1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(30,Suffix,"of Expertise",[["#% increased Cast Speed",[[11,13]]]],[0,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(30,Suffix,"of Piercing",[["#% increased Critical Strike Chance",[[20,24]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(30,Suffix,"of Rage",[["#% increased Global Critical Strike Multiplier",[[20,24]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(30,Suffix,"of Stunning",[["#% increased Stun Duration on enemies",[[21,25]]]],[0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1]);
	add(30,Suffix,"of Regrowth",[["+# Life gained for each enemy hit by your Attacks",[[4,4]]]],[1,1,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(30,Suffix,"of Radiance",[["+# to Accuracy Rating",[[15,15]]],["#% increased Light Radius",[[5,10]]]],[1,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(30,Suffix,"of the Boxer",[["#% reduced Enemy Stun Threshold",[[10,11]]]],[0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1]);
	add(30,Suffix,"of Banishment",[["+#% to Chaos Resistance",[[11,15]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	add(31,Suffix,"of Rage",[["#% increased Global Critical Strike Multiplier",[[27,39]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(32,Suffix,"of Gathering",[["#% increased Quantity of Items found",[[9,12]]]],[1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(33,Suffix,"of the Sniper",[["+# to Accuracy Rating",[[131,165]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(33,Suffix,"of the Augur",[["+# to Intelligence",[[23,27]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,1]);
	add(33,Suffix,"of the Sniper",[["+# to Accuracy Rating",[[131,165]]]],[1,1,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(33,Suffix,"of the Comet",[["+# to all Attributes",[[13,16]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(33,Suffix,"of the Falcon",[["+# to Dexterity",[[23,27]]]],[1,1,0,1,1,1,1,1,1,0,1,1,0,0,1,1,1,0,0]);
	add(33,Suffix,"of the Lion",[["+# to Strength",[[23,27]]]],[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]);
	add(35,Prefix,"Professor's",[["#% increased Spell Damage",[[60,74]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(35,Prefix,"Warlock's",[["#% increased Spell Damage",[[30,37]]],["+# to maximum Mana",[[17,19]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(35,Prefix,"Vicious",[["#% increased Physical Damage",[[90,109]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(35,Prefix,"Mercenary's",[["#% increased Physical Damage",[[45,54]]],["+# to Accuracy Rating",[[51,64]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(35,Prefix,"Professor's",[["#% increased Spell Damage",[[40,49]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,1]);
	add(35,Prefix,"Warlock's",[["#% increased Spell Damage",[[20,24]]],["+# to maximum Mana",[[17,19]]]],[0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,1]);
	add(35,Prefix,"Aqua",[["+# to maximum Mana",[[40,44]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,1]);
	add(35,Prefix,"Pulsing",[["+# to Energy Shield",[[20,22]]]],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(35,Prefix,"Pulsing",[["+# to maximum Energy Shield",[[20,29]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(35,Prefix,"Gleaming",[["Adds #-# Physical Damage",[[5,7],[11,12]]]],[1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(35,Prefix,"Jagged",[["Reflects # Physical Damage to Melee Attackers",[[25,50]]]],[0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(36,Prefix,"Gleaming",[["Adds #-# Physical Damage",[[9,12],[19,22]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,1,0]);
	add(36,Prefix,"Rotund",[["+# to maximum Life",[[60,69]]]],[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1]);
	add(36,Prefix,"Flaming",[["Adds #-# Fire Damage",[[9,12],[19,22]]]],[1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(36,Prefix,"Gleaming",[["Adds #-# Physical Damage",[[14,19],[28,33]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1]);
	add(36,Suffix,"of Ice",[["#% increased Cold Damage",[[13,17]]]],[0,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1]);
	add(36,Suffix,"of Cinders",[["#% increased Fire Damage",[[13,17]]]],[0,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1]);
	add(36,Suffix,"of Electricity",[["#% increased Lightning Damage",[[13,17]]]],[0,1,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1]);
	add(36,Suffix,"of the Worthy",[["#% reduced Attribute Requirements",[[-18,-18]]]],[0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	add(36,Suffix,"of the Kiln",[["+#% to Fire Resistance",[[24,29]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(36,Suffix,"of the Kaleidoscope",[["+#% to all Elemental Resistances",[[9,11]]]],[1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(37,Prefix,"Freezing",[["Adds #-# Cold Damage",[[8,11],[16,19]]]],[1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(37,Suffix,"of Acclaim",[["#% increased Attack Speed",[[17,19]]]],[0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1]);
	add(37,Suffix,"of the Thunderhead",[["+#% to Lightning Resistance",[[24,29]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(38,Prefix,"Sorcerer's",[["#% increased Spell Damage",[[13,17]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(38,Prefix,"Freezing",[["Adds #-# Cold Damage",[[14,19],[29,34]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(38,Prefix,"Flaming",[["Adds #-# Fire Damage",[[16,22],[33,39]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(38,Prefix,"Sparking",[["Adds #-# Lightning Damage",[[2,6],[58,61]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(38,Prefix,"Freezing",[["Adds #-# Cold Damage",[[19,26],[39,46]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1]);
	add(38,Prefix,"Flaming",[["Adds #-# Fire Damage",[[21,29],[44,51]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(38,Prefix,"Sparking",[["Adds #-# Lightning Damage",[[1,3],[33,34]]]],[1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(38,Prefix,"Sparking",[["Adds #-# Lightning Damage",[[3,8],[75,79]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(38,Suffix,"of the Yeti",[["+#% to Cold Resistance",[[24,29]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(39,Prefix,"Pirate's",[["#% increased Rarity of Items found",[[13,18]]]],[1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(40,Prefix,"Gazelle's",[["#% increased Movement Speed",[[25,25]]]],[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(40,Suffix,"of Legerdemain",[["#% increased Cast Speed",[[14,16]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(40,Suffix,"of Nourishment",[["+# Life gained for each enemy hit by your Attacks",[[5,5]]]],[1,1,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(40,Suffix,"of Triumph",[["+# Life gained on Kill",[[8,11]]]],[1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add(40,Suffix,"of Consumption",[["+# Mana gained on Kill",[[4,6]]]],[1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add(41,Suffix,"of the Marksman",[["+# to Accuracy Rating",[[166,200]]]],[1,1,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(41,Suffix,"of Calamity",[["#% increased Critical Strike Chance for Spells",[[60,79]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0]);
	add(41,Suffix,"of Propulsion",[["#% increased Projectile Speed",[[26,33]]]],[0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0]);
	add(41,Suffix,"of the Marksman",[["+# to Accuracy Rating",[[166,200]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(42,Prefix,"Buttressed",[["#% increased Armour",[[65,82]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(42,Prefix,"Buttressed",[["#% increased Armour",[[11,13]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(42,Prefix,"Rhino's",[["#% increased Armour",[[33,41]]],["#% increased Block and Stun Recovery",[[12,13]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(42,Prefix,"Fleet",[["#% increased Evasion Rating",[[11,13]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(42,Prefix,"Fearless",[["#% increased maximum Energy Shield",[[11,13]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(42,Prefix,"Seething",[["+# to Energy Shield",[[23,26]]]],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(42,Prefix,"Fleet",[["+# to Evasion Rating",[[61,80]]]],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(42,Prefix,"Fleet",[["+# to Evasion Rating",[[61,138]]]],[0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(42,Prefix,"Opalescent",[["+# to maximum Mana",[[45,49]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(42,Suffix,"of Steel Skin",[["#% increased Block and Stun Recovery",[[20,22]]]],[0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(42,Suffix,"of Bliss",[["#% increased Mana Regeneration Rate",[[40,49]]]],[1,1,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(43,Prefix,"Seething",[["+# to maximum Energy Shield",[[30,48]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Prefix,"Rhino's",[["#% increased Armour",[[33,41]]],["#% increased Block and Stun Recovery",[[12,13]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Prefix,"Infused",[["#% increased Armour and Energy Shield",[[65,82]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Prefix,"Naga's",[["#% increased Armour and Energy Shield",[[33,41]]],["#% increased Block and Stun Recovery",[[12,13]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(44,Prefix,"Naga's",[["#% increased Armour and Energy Shield",[[33,41]]],["#% increased Block and Stun Recovery",[[12,13]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(44,Prefix,"Gladiator's",[["#% increased Armour and Evasion",[[65,82]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(44,Prefix,"Ephemeral",[["#% increased Evasion and Energy Shield",[[65,82]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Prefix,"Wraith's",[["#% increased Evasion Rating",[[65,82]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Prefix,"Wasp's",[["#% increased Evasion Rating",[[33,41]]],["#% increased Block and Stun Recovery",[[12,13]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Prefix,"Wasp's",[["#% increased Evasion Rating",[[33,41]]],["#% increased Block and Stun Recovery",[[12,13]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Prefix,"Fearless",[["#% increased maximum Energy Shield",[[65,82]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Prefix,"Fortified",[["+# to Armour",[[61,138]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Prefix,"Virile",[["+# to maximum Life",[[70,79]]]],[1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1]);
	add(44,Prefix,"Annealed",[["Adds #-# Physical Damage",[[6,9],[13,15]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(44,Suffix,"of the Hydra",[["# Life Regenerated per second",[[2.9,4.3]]]],[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Suffix,"of Puncturing",[["#% increased Global Critical Strike Chance",[[25,29]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(44,Suffix,"of the Combatant",[["#% reduced Enemy Stun Threshold",[[12,13]]]],[0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1]);
	add(44,Suffix,"of the Heavens",[["+# to all Attributes",[[17,20]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(44,Suffix,"of the Panther",[["+# to Dexterity",[[28,32]]]],[1,1,0,1,1,1,1,1,1,0,1,1,0,0,1,1,1,0,0]);
	add(44,Suffix,"of Puncturing",[["#% increased Critical Strike Chance",[[25,29]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(44,Suffix,"of Fury",[["#% increased Global Critical Strike Multiplier",[[25,29]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(44,Suffix,"of Slamming",[["#% increased Stun Duration on enemies",[[26,30]]]],[0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add(44,Suffix,"of the Philosopher",[["+# to Intelligence",[[28,32]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(44,Suffix,"of Eviction",[["+#% to Chaos Resistance",[[16,20]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(44,Suffix,"of the Gorilla",[["+# to Strength",[[28,32]]]],[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]);
	add(45,Suffix,"of Fame",[["#% increased Attack Speed",[[20,22]]]],[0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1]);
	add(45,Suffix,"of Fury",[["#% increased Global Critical Strike Multiplier",[[40,53]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(46,Prefix,"Occultist's",[["#% increased Spell Damage",[[75,89]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(46,Prefix,"Mage's",[["#% increased Spell Damage",[[38,44]]],["+# to maximum Mana",[[20,22]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(46,Prefix,"Fortified",[["+# to Armour",[[61,138]]]],[0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(46,Prefix,"Bloodthirsty",[["#% increased Physical Damage",[[110,129]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(46,Prefix,"Champion's",[["#% increased Physical Damage",[[55,64]]],["+# to Accuracy Rating",[[65,82]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(46,Prefix,"Occultist's",[["#% increased Spell Damage",[[50,59]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0]);
	add(46,Prefix,"Mage's",[["#% increased Spell Damage",[[25,29]]],["+# to maximum Mana",[[20,22]]]],[0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0]);
	add(46,Prefix,"Annealed",[["Adds #-# Physical Damage",[[12,16],[24,28]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,1,0]);
	add(46,Prefix,"Annealed",[["Adds #-# Physical Damage",[[18,24],[36,42]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1]);
	add(48,Prefix,"Scorching",[["Adds #-# Fire Damage",[[11,15],[23,27]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(48,Suffix,"of the Furnace",[["+#% to Fire Resistance",[[30,35]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(48,Suffix,"of Variegation",[["+#% to all Elemental Resistances",[[12,14]]]],[1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(49,Suffix,"of the Tempest",[["+#% to Lightning Resistance",[[30,35]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	add(50,Prefix,"Blazing",[["+# to Energy Shield",[[27,31]]]],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(50,Prefix,"Frozen",[["Adds #-# Cold Damage",[[18,25],[37,43]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(50,Prefix,"Scorching",[["Adds #-# Fire Damage",[[21,28],[42,50]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(50,Prefix,"Arcing",[["Adds #-# Lightning Damage",[[3,8],[75,79]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(50,Prefix,"Frozen",[["Adds #-# Cold Damage",[[10,13],[20,24]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(50,Prefix,"Frozen",[["Adds #-# Cold Damage",[[24,32],[49,57]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(50,Prefix,"Scorching",[["Adds #-# Fire Damage",[[27,36],[54,64]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(50,Prefix,"Arcing",[["Adds #-# Lightning Damage",[[1,4],[40,43]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(50,Prefix,"Arcing",[["Adds #-# Lightning Damage",[[5,10],[96,101]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1]);
	add(50,Suffix,"of the Deadeye",[["+# to Accuracy Rating",[[201,250]]]],[1,1,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(50,Suffix,"of Rime",[["#% increased Cold Damage",[[18,22]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1]);
	add(50,Suffix,"of Flames",[["#% increased Fire Damage",[[18,22]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1]);
	add(50,Suffix,"of Voltage",[["#% increased Lightning Damage",[[18,22]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1]);
	add(50,Suffix,"of the Deadeye",[["+# to Accuracy Rating",[[201,250]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(50,Suffix,"of the Walrus",[["+#% to Cold Resistance",[[30,35]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	add(51,Prefix,"Blazing",[["+# to maximum Energy Shield",[[49,72]]]],[0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(51,Prefix,"Gentian",[["+# to maximum Mana",[[50,54]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(52,Prefix,"Razor Sharp",[["Adds #-# Physical Damage",[[7,10],[15,18]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(53,Suffix,"of Archaeology",[["#% increased Rarity of Items found",[[15,20]]]],[1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(54,Prefix,"Athlete's",[["+# to maximum Life",[[80,89]]]],[0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1]);
	add(54,Prefix,"Razor Sharp",[["Adds #-# Physical Damage",[[13,18],[27,32]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,1,0]);
	add(54,Prefix,"Razor Sharp",[["Adds #-# Physical Damage",[[20,27],[41,48]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1]);
	add(55,Prefix,"Cheetah's",[["#% increased Movement Speed",[[30,30]]]],[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(55,Prefix,"Winterbringer's",[["+# to Level of Cold Gems in this item",[[2,2]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0]);
	add(55,Prefix,"Lava Caller's",[["+# to Level of Fire Gems in this item",[[2,2]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0]);
	add(55,Prefix,"Tempest King's",[["+# to Level of Lightning Gems in this item",[[2,2]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,0]);
	add(55,Prefix,"Paragon's",[["+1 to Level of Gems in this item",[[1,1]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(55,Suffix,"of Hoarding",[["#% increased Quantity of Items found",[[13,16]]]],[1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(55,Suffix,"of the Galaxy",[["+# to all Attributes",[[21,24]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(55,Suffix,"of the Leopard",[["+# to Dexterity",[[33,37]]]],[1,1,0,1,1,1,1,1,1,0,1,1,0,0,1,1,1,0,0]);
	add(55,Suffix,"of the Goliath",[["+# to Strength",[[33,37]]]],[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]);
	add(55,Suffix,"of Prestidigitation",[["#% increased Cast Speed",[[17,19]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(55,Suffix,"of Euphoria",[["#% increased Mana Regeneration Rate",[[50,59]]]],[1,1,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(55,Suffix,"of the Zephyr",[["#% increased Projectile Speed",[[34,41]]]],[0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0]);
	add(55,Suffix,"of the Sage",[["+# to Intelligence",[[33,37]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(56,Prefix,"Thickened",[["#% increased Armour",[[14,16]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(56,Prefix,"Blurred",[["#% increased Evasion Rating",[[14,16]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(56,Prefix,"Dauntless",[["#% increased maximum Energy Shield",[[14,16]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(56,Prefix,"Thaumaturgist's",[["#% increased Spell Damage",[[18,22]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(56,Prefix,"Blurred",[["+# to Evasion Rating",[[139,322]]]],[0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(56,Suffix,"of Adamantite Skin",[["#% increased Block and Stun Recovery",[[23,25]]]],[0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(56,Suffix,"of Expulsion",[["+#% to Chaos Resistance",[[21,25]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(57,Prefix,"Plated",[["+# to Armour",[[139,322]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(58,Prefix,"Incanter's",[["#% increased Spell Damage",[[90,104]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(58,Prefix,"Archmage's",[["#% increased Spell Damage",[[45,50]]],["+# to maximum Mana",[[23,25]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(58,Prefix,"Blurred",[["+# to Evasion Rating",[[81,120]]]],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(58,Prefix,"Incanter's",[["#% increased Spell Damage",[[60,69]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0]);
	add(58,Prefix,"Archmage's",[["#% increased Spell Damage",[[30,34]]],["+# to maximum Mana",[[23,25]]]],[0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0]);
	add(58,Prefix,"Glaciated",[["Adds #-# Cold Damage",[[21,28],[43,50]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(58,Prefix,"Incinerating",[["Adds #-# Fire Damage",[[24,32],[49,57]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(58,Prefix,"Shocking",[["Adds #-# Lightning Damage",[[4,9],[86,91]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,1]);
	add(58,Prefix,"Glaciated",[["Adds #-# Cold Damage",[[29,39],[58,68]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(58,Prefix,"Incinerating",[["Adds #-# Fire Damage",[[32,43],[65,76]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(58,Prefix,"Shocking",[["Adds #-# Lightning Damage",[[2,5],[47,50]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(58,Prefix,"Shocking",[["Adds #-# Lightning Damage",[[6,12],[115,121]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1]);
	add(58,Suffix,"of Walling",[["#% additional Block Chance",[[4,6]]]],[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(58,Suffix,"of Penetrating",[["#% increased Global Critical Strike Chance",[[30,34]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(58,Suffix,"of the Gladiator",[["#% reduced Enemy Stun Threshold",[[14,15]]]],[0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1]);
	add(58,Suffix,"of Staggering",[["#% increased Stun Duration on enemies",[[31,35]]]],[0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0]);
	add(59,Prefix,"Plated",[["+# to Armour",[[139,322]]]],[0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(59,Prefix,"Scintillating",[["+# to Energy Shield",[[32,37]]]],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(59,Prefix,"Incinerating",[["Adds #-# Fire Damage",[[13,18],[27,31]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(59,Suffix,"of the Troll",[["# Life Regenerated per second",[[3.6,5.5]]]],[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(59,Suffix,"of Ferocity",[["#% increased Global Critical Strike Multiplier",[[54,66]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(59,Suffix,"of Penetrating",[["#% increased Critical Strike Chance",[[30,34]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(59,Suffix,"of Ruin",[["#% increased Critical Strike Chance for Spells",[[80,99]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,1]);
	add(59,Suffix,"of Ferocity",[["#% increased Global Critical Strike Multiplier",[[30,34]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(60,Prefix,"Thickened",[["#% increased Armour",[[83,100]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Prefix,"Elephant's",[["#% increased Armour",[[42,50]]],["#% increased Block and Stun Recovery",[[14,15]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Prefix,"Elephant's",[["#% increased Armour",[[42,50]]],["#% increased Block and Stun Recovery",[[14,15]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Prefix,"Inculcated",[["#% increased Armour and Energy Shield",[[83,100]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Prefix,"Djinn's",[["#% increased Armour and Energy Shield",[[42,50]]],["#% increased Block and Stun Recovery",[[14,15]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(60,Prefix,"Djinn's",[["#% increased Armour and Energy Shield",[[42,50]]],["#% increased Block and Stun Recovery",[[14,15]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(60,Prefix,"Duelist's",[["#% increased Armour and Evasion",[[83,100]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(60,Prefix,"Evanescent",[["#% increased Evasion and Energy Shield",[[83,100]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Prefix,"Phantasm's",[["#% increased Evasion Rating",[[83,100]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Prefix,"Dragonfly's",[["#% increased Evasion Rating",[[42,50]]],["#% increased Block and Stun Recovery",[[14,15]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Prefix,"Dragonfly's",[["#% increased Evasion Rating",[[42,50]]],["#% increased Block and Stun Recovery",[[14,15]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Prefix,"Dauntless",[["#% increased maximum Energy Shield",[[83,100]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Prefix,"Scintillating",[["+# to maximum Energy Shield",[[73,106]]]],[0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Prefix,"Cruel",[["#% increased Physical Damage",[[130,149]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(60,Prefix,"Conqueror's",[["#% increased Physical Damage",[[65,74]]],["+# to Accuracy Rating",[[83,99]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(60,Prefix,"Chalybeous",[["+# to maximum Mana",[[55,59]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,1]);
	add(60,Prefix,"Glaciated",[["Adds #-# Cold Damage",[[12,16],[24,28]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Suffix,"of Infamy",[["#% increased Attack Speed",[[23,25]]]],[0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1]);
	add(60,Suffix,"of the Rainbow",[["+#% to all Elemental Resistances",[[15,16]]]],[1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(60,Suffix,"of the Apt",[["#% reduced Attribute Requirements",[[-32,-32]]]],[0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	add(60,Suffix,"of the Polar Bear",[["+#% to Cold Resistance",[[36,41]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	add(60,Suffix,"of the Volcano",[["+#% to Fire Resistance",[[36,41]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(60,Suffix,"of the Maelstrom",[["+#% to Lightning Resistance",[[36,41]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(62,Prefix,"Dragon's",[["#% increased Rarity of Items found",[[19,24]]]],[1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(63,Prefix,"Weaponmaster's",[["+# to Level of Melee Gems in this item",[[2,2]]]],[0,0,0,0,0,0,0,1,0,0,1,1,1,1,0,1,1,1,0]);
	add(63,Suffix,"of the Ranger",[["+# to Accuracy Rating",[[251,320]]]],[1,1,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(63,Suffix,"of the Ranger",[["+# to Accuracy Rating",[[251,320]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(64,Prefix,"Sharpshooter's",[["+# to Level of Bow Gems in this item",[[2,2]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0]);
	add(64,Prefix,"Fecund",[["+# to maximum Life",[[90,99]]]],[0,0,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1]);
	add(64,Prefix,"Tempered",[["Adds #-# Physical Damage",[[9,12],[19,22]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(64,Suffix,"of Floe",[["#% increased Cold Damage",[[23,26]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1]);
	add(64,Suffix,"of Immolation",[["#% increased Fire Damage",[[23,26]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(64,Suffix,"of Discharge",[["#% increased Lightning Damage",[[23,26]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(65,Prefix,"Summoner's",[["+# to Level of Minion Gems in this item",[[2,2]]]],[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(65,Prefix,"Tempered",[["Adds #-# Physical Damage",[[16,22],[33,38]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,1,0]);
	add(65,Prefix,"Tempered",[["Adds #-# Physical Damage",[[24,33],[49,57]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1]);
	add(65,Suffix,"of Exile",[["+#% to Chaos Resistance",[[26,30]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(66,Suffix,"of the Universe",[["+# to all Attributes",[[25,28]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(66,Suffix,"of the Jaguar",[["+# to Dexterity",[[38,42]]]],[1,1,0,1,1,1,1,1,1,0,1,1,0,0,1,1,1,0,1]);
	add(66,Suffix,"of the Leviathan",[["+# to Strength",[[38,42]]]],[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]);
	add(66,Suffix,"of the Savant",[["+# to Intelligence",[[38,42]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(68,Prefix,"Incandescent",[["+# to Energy Shield",[[38,43]]]],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(68,Prefix,"Blasting",[["Adds #-# Fire Damage",[[28,38],[57,67]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(68,Prefix,"Discharging",[["Adds #-# Lightning Damage",[[5,11],[100,106]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(68,Prefix,"Blasting",[["Adds #-# Fire Damage",[[39,52],[79,92]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1]);
	add(68,Prefix,"Discharging",[["Adds #-# Lightning Damage",[[6,15],[140,148]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1]);
	add(69,Prefix,"Incandescent",[["+# to maximum Energy Shield",[[107,135]]]],[0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(69,Prefix,"Polar",[["Adds #-# Cold Damage",[[35,46],[70,81]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(69,Prefix,"Mazarine",[["+# to maximum Mana",[[60,64]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0]);
	add(69,Prefix,"Polar",[["Adds #-# Cold Damage",[[25,33],[50,59]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,0]);
	add(69,Prefix,"Discharging",[["Adds #-# Lightning Damage",[[3,6],[57,61]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(70,Prefix,"Solid",[["#% increased Armour",[[17,19]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(70,Prefix,"Phased",[["#% increased Evasion Rating",[[17,19]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(70,Prefix,"Indomitable",[["#% increased maximum Energy Shield",[[17,19]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(70,Prefix,"Vaporous",[["+# to Evasion Rating",[[323,400]]]],[0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(70,Prefix,"Blasting",[["Adds #-# Fire Damage",[[16,22],[32,38]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(71,Prefix,"Carapaced",[["+# to Armour",[[323,400]]]],[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(71,Prefix,"Polar",[["Adds #-# Cold Damage",[[14,19],[29,34]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(72,Prefix,"Girded",[["#% increased Armour",[[101,120]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(72,Prefix,"Interpolated",[["#% increased Armour and Energy Shield",[[100,120]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(72,Prefix,"Hero's",[["#% increased Armour and Evasion",[[100,120]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(72,Prefix,"Unreal",[["#% increased Evasion and Energy Shield",[[100,120]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(72,Prefix,"Nightmare's",[["#% increased Evasion Rating",[[101,120]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(72,Prefix,"Unconquerable",[["#% increased maximum Energy Shield",[[101,120]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(72,Prefix,"Phased",[["+# to Evasion Rating",[[121,150]]]],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(72,Prefix,"Vampire's",[["#% of Physical Attack Damage Leeched as Life",[[5,6]]]],[0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(72,Suffix,"of Incision",[["#% increased Global Critical Strike Chance",[[35,38]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(72,Suffix,"of Sortilege",[["#% increased Cast Speed",[[20,22]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0]);
	add(72,Suffix,"of the Ice",[["+#% to Cold Resistance",[[42,45]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]);
	add(72,Suffix,"of the Magma",[["+#% to Fire Resistance",[[42,45]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	add(72,Suffix,"of the Lightning",[["+#% to Lightning Resistance",[[42,45]]]],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	add(73,Prefix,"Carapaced",[["+# to Armour",[[323,400]]]],[0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(73,Prefix,"Vigorous",[["+# to maximum Life",[[100,109]]]],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(73,Prefix,"Tyrannical",[["#% increased Physical Damage",[[150,169]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(73,Prefix,"Emperor's",[["#% increased Physical Damage",[[75,80]]],["+# to Accuracy Rating",[[100,135]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(73,Suffix,"of Incision",[["#% increased Critical Strike Chance",[[35,38]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1]);
	add(73,Suffix,"of Destruction",[["#% increased Global Critical Strike Multiplier",[[35,38]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]);
	add(74,Prefix,"Parched",[["#% of Physical Attack Damage Leeched as Mana",[[3,4]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(74,Prefix,"Resplendent",[["+# to Energy Shield",[[44,47]]]],[0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(74,Prefix,"Cremating",[["Adds #-# Fire Damage",[[46,62],[93,109]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1]);
	add(74,Prefix,"Cremating",[["Adds #-# Fire Damage",[[30,41],[62,72]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,1]);
	add(74,Prefix,"Electrocuting",[["Adds #-# Lightning Damage",[[5,11],[108,115]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,1]);
	add(74,Prefix,"Electrocuting",[["Adds #-# Lightning Damage",[[8,17],[163,172]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1]);
	add(74,Suffix,"of Destruction",[["#% increased Global Critical Strike Multiplier",[[67,70]]]],[0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(74,Suffix,"of the Phantasm",[["+# to Dexterity",[[43,50]]]],[1,1,0,1,1,1,1,1,1,0,1,1,0,0,1,1,1,0,1]);
	add(74,Suffix,"of the Titan",[["+# to Strength",[[43,50]]]],[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0]);
	add(74,Suffix,"of the Virtuoso",[["+# to Intelligence",[[43,50]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,1]);
	add(75,Prefix,"Resplendent",[["+# to maximum Energy Shield",[[136,145]]]],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(75,Prefix,"Entombing",[["Adds #-# Cold Damage",[[41,55],[82,96]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0]);
	add(75,Prefix,"Unleashed",[["#% increased Elemental Damage with Weapons",[[31,36]]]],[1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1]);
	add(75,Prefix,"Blue",[["+# to maximum Mana",[[65,68]]]],[1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,1]);
	add(75,Prefix,"Entombing",[["Adds #-# Cold Damage",[[27,36],[55,64]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,1,1]);
	add(75,Suffix,"of Excavation",[["#% increased Rarity of Items found",[[21,26]]]],[1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(76,Prefix,"Wizard's",[["#% increased Spell Damage",[[23,26]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(76,Prefix,"Cremating",[["Adds #-# Fire Damage",[[19,25],[39,45]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(76,Prefix,"Electrocuting",[["Adds #-# Lightning Damage",[[3,7],[68,72]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(76,Prefix,"Flaring",[["Adds #-# Physical Damage",[[11,15],[22,26]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(76,Suffix,"of Grandmastery",[["#% increased Attack Speed",[[14,16]]]],[0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
	add(76,Suffix,"of the Assassin",[["+# to Accuracy Rating",[[321,400]]]],[1,1,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0]);
	add(76,Suffix,"of Glaciation",[["#% increased Cold Damage",[[27,30]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1]);
	add(76,Suffix,"of Unmaking",[["#% increased Critical Strike Chance for Spells",[[100,109]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,0,0,0,1]);
	add(76,Suffix,"of Ashes",[["#% increased Fire Damage",[[27,30]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1]);
	add(76,Suffix,"of Arcing",[["#% increased Lightning Damage",[[27,30]]]],[0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1]);
	add(77,Prefix,"Impregnable",[["#% increased Armour",[[20,22]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(77,Prefix,"Vaporous",[["#% increased Evasion Rating",[[20,22]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(77,Prefix,"Unassailable",[["#% increased maximum Energy Shield",[[20,22]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(77,Prefix,"Entombing",[["Adds #-# Cold Damage",[[17,22],[34,40]]]],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(77,Prefix,"Flaring",[["Adds #-# Physical Damage",[[19,25],[38,45]]]],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,0,1,1]);
	add(77,Prefix,"Flaring",[["Adds #-# Physical Damage",[[29,38],[58,68]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0]);
	add(77,Suffix,"of Celebration",[["#% increased Attack Speed",[[26,27]]]],[0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,0]);
	add(77,Suffix,"of Amassment",[["#% increased Quantity of Items found",[[17,20]]]],[1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(77,Suffix,"of the Infinite",[["+# to all Attributes",[[29,32]]]],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	add(78,Prefix,"Mammoth's",[["#% increased Armour",[[51,56]]],["#% increased Block and Stun Recovery",[[16,17]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(78,Prefix,"Mammoth's",[["#% increased Armour",[[51,56]]],["#% increased Block and Stun Recovery",[[16,17]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(78,Prefix,"Seraphim's",[["#% increased Armour and Energy Shield",[[51,56]]],["#% increased Block and Stun Recovery",[[16,17]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(78,Prefix,"Seraphin's",[["#% increased Armour and Energy Shield",[[51,56]]],["#% increased Block and Stun Recovery",[[16,17]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1]);
	add(78,Prefix,"Hummingbird's",[["#% increased Evasion Rating",[[51,56]]],["#% increased Block and Stun Recovery",[[16,17]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(78,Prefix,"Hummingbird's",[["#% increased Evasion Rating",[[51,56]]],["#% increased Block and Stun Recovery",[[16,17]]]],[0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(78,Suffix,"of the Phoenix",[["# Life Regenerated per second",[[6,7]]]],[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(79,Prefix,"Glyphic's",[["#% increased Spell Damage",[[105,110]]]],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]);
	add(79,Prefix,"Glyphic's",[["#% increased Spell Damage",[[70,74]]]],[0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0]);
	add(79,Suffix,"of Corundum Skin",[["#% increased Block and Stun Recovery",[[26,28]]]],[0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0]);
	add(79,Suffix,"of Nirvana",[["#% increased Mana Regeneration Rate",[[60,69]]]],[1,1,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,0,1]);
	
	return mods;
})();