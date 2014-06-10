var baseEquipment = (function() {
	var items = {};
	
	function addItem(name, level, type, subtype) {
		if (items[name]) {
			console.log("ERROR: Duplicate item [" + name + "]");
		}
		
		items[name] = {
			"name" : name,
			"level" : level,
			"type" : type,
			"subtype" : subtype
		};
	}
	
	addItem("Rusted Hatchet",0,"WEAPON","ONE_HANDED_AXE"),
	addItem("Jade Hatchet",6,"WEAPON","ONE_HANDED_AXE"),
	addItem("Boarding Axe",11,"WEAPON","ONE_HANDED_AXE"),
	addItem("Cleaver",16,"WEAPON","ONE_HANDED_AXE"),
	addItem("Broad Axe",21,"WEAPON","ONE_HANDED_AXE"),
	addItem("Arming Axe",25,"WEAPON","ONE_HANDED_AXE"),
	addItem("Decorative Axe",29,"WEAPON","ONE_HANDED_AXE"),
	addItem("Spectral Axe",33,"WEAPON","ONE_HANDED_AXE"),
	addItem("Jasper Axe",36,"WEAPON","ONE_HANDED_AXE"),
	addItem("Tomahawk",39,"WEAPON","ONE_HANDED_AXE"),
	addItem("Wrist Chopper",42,"WEAPON","ONE_HANDED_AXE"),
	addItem("War Axe",45,"WEAPON","ONE_HANDED_AXE"),
	addItem("Chest Splitter",48,"WEAPON","ONE_HANDED_AXE"),
	addItem("Ceremonial Axe",51,"WEAPON","ONE_HANDED_AXE"),
	addItem("Wraith Axe",54,"WEAPON","ONE_HANDED_AXE"),
	addItem("Karui Axe",57,"WEAPON","ONE_HANDED_AXE"),
	addItem("Siege Axe",59,"WEAPON","ONE_HANDED_AXE"),
	addItem("Reaver Axe",61,"WEAPON","ONE_HANDED_AXE"),
	addItem("Butcher Axe",63,"WEAPON","ONE_HANDED_AXE"),
	addItem("Vaal Hatchet",65,"WEAPON","ONE_HANDED_AXE"),
	addItem("Royal Axe",67,"WEAPON","ONE_HANDED_AXE"),
	addItem("Infernal Axe",69,"WEAPON","ONE_HANDED_AXE"),
	addItem("Stone Axe",0,"WEAPON","ONE_HANDED_AXE"),
	addItem("Jade Chopper",9,"WEAPON","ONE_HANDED_AXE"),
	addItem("Woodsplitter",13,"WEAPON","ONE_HANDED_AXE"),
	addItem("Poleaxe",18,"WEAPON","ONE_HANDED_AXE"),
	addItem("Double Axe",23,"WEAPON","ONE_HANDED_AXE"),
	addItem("Gilded Axe",28,"WEAPON","ONE_HANDED_AXE"),
	addItem("Shadow Axe",33,"WEAPON","ONE_HANDED_AXE"),
	addItem("Jasper Chopper",37,"WEAPON","ONE_HANDED_AXE"),
	addItem("Timber Axe",41,"WEAPON","ONE_HANDED_AXE"),
	addItem("Headsman Axe",45,"WEAPON","ONE_HANDED_AXE"),
	addItem("Labrys",49,"WEAPON","ONE_HANDED_AXE"),
	addItem("Noble Axe",52,"WEAPON","ONE_HANDED_AXE"),
	addItem("Abyssal Axe",55,"WEAPON","ONE_HANDED_AXE"),
	addItem("Karui Chopper",58,"WEAPON","ONE_HANDED_AXE"),
	addItem("Sundering Axe",60,"WEAPON","ONE_HANDED_AXE"),
	addItem("Ezomyte Axe",62,"WEAPON","ONE_HANDED_AXE"),
	addItem("Vaal Axe",64,"WEAPON","ONE_HANDED_AXE"),
	addItem("Despot Axe",66,"WEAPON","ONE_HANDED_AXE"),
	addItem("Void Axe",68,"WEAPON","ONE_HANDED_AXE"),
	addItem("Crude Bow",0,"WEAPON","BOW"),
	addItem("Short Bow",5,"WEAPON","BOW"),
	addItem("Long Bow",10,"WEAPON","BOW"),
	addItem("Composite Bow",15,"WEAPON","BOW"),
	addItem("Recurve Bow",20,"WEAPON","BOW"),
	addItem("Bone Bow",24,"WEAPON","BOW"),
	addItem("Royal Bow",28,"WEAPON","BOW"),
	addItem("Death Bow",32,"WEAPON","BOW"),
	addItem("Grove Bow",35,"WEAPON","BOW"),
	addItem("Decurve Bow",38,"WEAPON","BOW"),
	addItem("Compound Bow",41,"WEAPON","BOW"),
	addItem("Sniper Bow",44,"WEAPON","BOW"),
	addItem("Ivory Bow",47,"WEAPON","BOW"),
	addItem("Highborn Bow",50,"WEAPON","BOW"),
	addItem("Decimation Bow",53,"WEAPON","BOW"),
	addItem("Thicket Bow",56,"WEAPON","BOW"),
	addItem("Citadel Bow",58,"WEAPON","BOW"),
	addItem("Ranger Bow",60,"WEAPON","BOW"),
	addItem("Maraketh Bow",62,"WEAPON","BOW"),
	addItem("Spine Bow",64,"WEAPON","BOW"),
	addItem("Imperial Bow",66,"WEAPON","BOW"),
	addItem("Harbinger Bow",68,"WEAPON","BOW"),
	addItem("Nailed Fist",0,"WEAPON","CLAW"),
	addItem("Sharktooth Claw",7,"WEAPON","CLAW"),
	addItem("Awl",12,"WEAPON","CLAW"),
	addItem("Cat's Paw",17,"WEAPON","CLAW"),
	addItem("Blinder",22,"WEAPON","CLAW"),
	addItem("Timeworn Claw",26,"WEAPON","CLAW"),
	addItem("Sparkling Claw",30,"WEAPON","CLAW"),
	addItem("Fright Claw",34,"WEAPON","CLAW"),
	addItem("Thresher Claw",37,"WEAPON","CLAW"),
	addItem("Gouger",40,"WEAPON","CLAW"),
	addItem("Tiger's Paw",43,"WEAPON","CLAW"),
	addItem("Gut Ripper",46,"WEAPON","CLAW"),
	addItem("Prehistoric Claw",49,"WEAPON","CLAW"),
	addItem("Noble Claw",52,"WEAPON","CLAW"),
	addItem("Eagle Claw",55,"WEAPON","CLAW"),
	addItem("Great White Claw",58,"WEAPON","CLAW"),
	addItem("Throat Stabber",60,"WEAPON","CLAW"),
	addItem("Hellion's Paw",62,"WEAPON","CLAW"),
	addItem("Eye Gouger",64,"WEAPON","CLAW"),
	addItem("Vaal Claw",66,"WEAPON","CLAW"),
	addItem("Imperial Claw",68,"WEAPON","CLAW"),
	addItem("Terror Claw",70,"WEAPON","CLAW"),
	addItem("Glass Shank",0,"WEAPON","DAGGER"),
	addItem("Skinning Knife",5,"WEAPON","DAGGER"),
	addItem("Carving Knife",10,"WEAPON","DAGGER"),
	addItem("Stiletto",15,"WEAPON","DAGGER"),
	addItem("Boot Knife",20,"WEAPON","DAGGER"),
	addItem("Copper Kris",24,"WEAPON","DAGGER"),
	addItem("Skean",28,"WEAPON","DAGGER"),
	addItem("Imp Dagger",32,"WEAPON","DAGGER"),
	addItem("Flaying Knife",35,"WEAPON","DAGGER"),
	addItem("Butcher Knife",38,"WEAPON","DAGGER"),
	addItem("Poignard",41,"WEAPON","DAGGER"),
	addItem("Boot Blade",44,"WEAPON","DAGGER"),
	addItem("Golden Kris",47,"WEAPON","DAGGER"),
	addItem("Royal Skean",50,"WEAPON","DAGGER"),
	addItem("Fiend Dagger",53,"WEAPON","DAGGER"),
	addItem("Gutting Knife",56,"WEAPON","DAGGER"),
	addItem("Slaughter Knife",58,"WEAPON","DAGGER"),
	addItem("Ambusher",60,"WEAPON","DAGGER"),
	addItem("Ezomyte Dagger",62,"WEAPON","DAGGER"),
	addItem("Platinum Kris",64,"WEAPON","DAGGER"),
	addItem("Imperial Skean",66,"WEAPON","DAGGER"),
	addItem("Demon Dagger",68,"WEAPON","DAGGER"),
	addItem("Driftwood Club",0,"WEAPON","ONE_HANDED_MACE"),
	addItem("Tribal Club",5,"WEAPON","ONE_HANDED_MACE"),
	addItem("Spiked Club",10,"WEAPON","ONE_HANDED_MACE"),
	addItem("Stone Hammer",15,"WEAPON","ONE_HANDED_MACE"),
	addItem("War Hammer",20,"WEAPON","ONE_HANDED_MACE"),
	addItem("Bladed Mace",24,"WEAPON","ONE_HANDED_MACE"),
	addItem("Ceremonial Mace",28,"WEAPON","ONE_HANDED_MACE"),
	addItem("Dream Mace",28,"WEAPON","ONE_HANDED_MACE"),
	addItem("Petrified Club",35,"WEAPON","ONE_HANDED_MACE"),
	addItem("Barbed Club",38,"WEAPON","ONE_HANDED_MACE"),
	addItem("Rock Breaker",41,"WEAPON","ONE_HANDED_MACE"),
	addItem("Battle Hammer",44,"WEAPON","ONE_HANDED_MACE"),
	addItem("Flanged Mace",47,"WEAPON","ONE_HANDED_MACE"),
	addItem("Ornate Mace",50,"WEAPON","ONE_HANDED_MACE"),
	addItem("Phantom Mace",53,"WEAPON","ONE_HANDED_MACE"),
	addItem("Ancestral Club",56,"WEAPON","ONE_HANDED_MACE"),
	addItem("Tenderizer",58,"WEAPON","ONE_HANDED_MACE"),
	addItem("Gavel",60,"WEAPON","ONE_HANDED_MACE"),
	addItem("Legion Hammer",62,"WEAPON","ONE_HANDED_MACE"),
	addItem("Pernarch",64,"WEAPON","ONE_HANDED_MACE"),
	addItem("Auric Mace",66,"WEAPON","ONE_HANDED_MACE"),
	addItem("Nightmare Mace",68,"WEAPON","ONE_HANDED_MACE"),
	addItem("Driftwood Sceptre",0,"WEAPON","SCEPTRE"),
	addItem("Darkwood Sceptre",5,"WEAPON","SCEPTRE"),
	addItem("Bronze Sceptre",10,"WEAPON","SCEPTRE"),
	addItem("Quartz Sceptre",15,"WEAPON","SCEPTRE"),
	addItem("Iron Sceptre",20,"WEAPON","SCEPTRE"),
	addItem("Ochre Sceptre",24,"WEAPON","SCEPTRE"),
	addItem("Ritual Sceptre",28,"WEAPON","SCEPTRE"),
	addItem("Shadow Sceptre",32,"WEAPON","SCEPTRE"),
	addItem("Grinning Fetish",35,"WEAPON","SCEPTRE"),
	addItem("Sekhem",38,"WEAPON","SCEPTRE"),
	addItem("Crystal Sceptre",41,"WEAPON","SCEPTRE"),
	addItem("Lead Sceptre",44,"WEAPON","SCEPTRE"),
	addItem("Blood Sceptre",47,"WEAPON","SCEPTRE"),
	addItem("Royal Sceptre",50,"WEAPON","SCEPTRE"),
	addItem("Abyssal Sceptre",53,"WEAPON","SCEPTRE"),
	addItem("Karui Sceptre",56,"WEAPON","SCEPTRE"),
	addItem("Tyrant's Sekhem",58,"WEAPON","SCEPTRE"),
	addItem("Opal Sceptre",60,"WEAPON","SCEPTRE"),
	addItem("Platinum Sceptre",62,"WEAPON","SCEPTRE"),
	addItem("Carnal Sceptre",64,"WEAPON","SCEPTRE"),
	addItem("Vaal Sceptre",66,"WEAPON","SCEPTRE"),
	addItem("Void Sceptre",68,"WEAPON","SCEPTRE"),
	addItem("Driftwood Maul",0,"WEAPON","TWO_HANDED_MACE"),
	addItem("Tribal Maul",8,"WEAPON","TWO_HANDED_MACE"),
	addItem("Mallet",12,"WEAPON","TWO_HANDED_MACE"),
	addItem("Sledgehammer",17,"WEAPON","TWO_HANDED_MACE"),
	addItem("Spiked Maul",22,"WEAPON","TWO_HANDED_MACE"),
	addItem("Brass Maul",27,"WEAPON","TWO_HANDED_MACE"),
	addItem("Fright Maul",32,"WEAPON","TWO_HANDED_MACE"),
	addItem("Totemic Maul",36,"WEAPON","TWO_HANDED_MACE"),
	addItem("Great Mallet",40,"WEAPON","TWO_HANDED_MACE"),
	addItem("Steelhead",44,"WEAPON","TWO_HANDED_MACE"),
	addItem("Spiny Maul",48,"WEAPON","TWO_HANDED_MACE"),
	addItem("Plated Maul",51,"WEAPON","TWO_HANDED_MACE"),
	addItem("Dread Maul",54,"WEAPON","TWO_HANDED_MACE"),
	addItem("Karui Maul",57,"WEAPON","TWO_HANDED_MACE"),
	addItem("Colossus Mallet",59,"WEAPON","TWO_HANDED_MACE"),
	addItem("Piledriver",61,"WEAPON","TWO_HANDED_MACE"),
	addItem("Meatgrinder",63,"WEAPON","TWO_HANDED_MACE"),
	addItem("Imperial Maul",65,"WEAPON","TWO_HANDED_MACE"),
	addItem("Terror Maul",67,"WEAPON","TWO_HANDED_MACE"),
	addItem("Gnarled Branch",0,"WEAPON","STAFF"),
	addItem("Primitive Staff",9,"WEAPON","STAFF"),
	addItem("Long Staff",13,"WEAPON","STAFF"),
	addItem("Iron Staff",18,"WEAPON","STAFF"),
	addItem("Coiled Staff",23,"WEAPON","STAFF"),
	addItem("Royal Staff",28,"WEAPON","STAFF"),
	addItem("Vile Staff",33,"WEAPON","STAFF"),
	addItem("Woodful Staff",37,"WEAPON","STAFF"),
	addItem("Quarterstaff",41,"WEAPON","STAFF"),
	addItem("Military Staff",45,"WEAPON","STAFF"),
	addItem("Serpentine Staff",49,"WEAPON","STAFF"),
	addItem("Highborn Staff",52,"WEAPON","STAFF"),
	addItem("Foul Staff",55,"WEAPON","STAFF"),
	addItem("Primordial Staff",58,"WEAPON","STAFF"),
	addItem("Lathi",60,"WEAPON","STAFF"),
	addItem("Ezomyte Staff",62,"WEAPON","STAFF"),
	addItem("Maelstr?m Staff",64,"WEAPON","STAFF"),
	addItem("Imperial Staff",66,"WEAPON","STAFF"),
	addItem("Judgement Staff",68,"WEAPON","STAFF"),
	addItem("Rusted Sword",0,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Copper Sword",5,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Sabre",10,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Broad Sword",15,"WEAPON","ONE_HANDED_SWORD"),
	addItem("War Sword",20,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Ancient Sword",24,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Elegant Sword",28,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Dusk Blade",32,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Variscite Blade",35,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Cutlass",38,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Baselard",41,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Battle Sword",44,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Elder Sword",47,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Graceful Sword",50,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Twilight Blade",53,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Gemstone Sword",56,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Corsair Sword",58,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Gladius",60,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Legion Sword",62,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Vaal Blade",64,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Eternal Sword",66,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Midnight Blade",68,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Rusted Spike",0,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Whalebone Rapier",7,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Battered Foil",12,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Basket Rapier",17,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Jagged Foil",22,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Antique Rapier",26,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Elegant Foil",30,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Thorn Rapier",34,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Wyrmbone Rapier",37,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Burnished Foil",40,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Estoc",43,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Serrated Foil",46,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Primeval Rapier",49,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Fancy Foil",52,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Apex Rapier",55,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Dragonbone Rapier",58,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Tempered Foil",60,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Pecoraro",62,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Spiraled Foil",64,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Vaal Rapier",66,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Jeweled Foil",68,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Harpy Rapier",70,"WEAPON","ONE_HANDED_SWORD"),
	addItem("Corroded Blade",0,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Longsword",8,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Bastard Sword",12,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Two-Handed Sword",17,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Etched Greatsword",22,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Ornate Sword",27,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Spectral Sword",32,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Butcher Sword",36,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Footman Sword",40,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Highland Blade",44,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Engraved Greatsword",48,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Tiger Sword",51,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Wraith Sword",54,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Headman's Sword",57,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Reaver Sword",59,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Ezomyte Blade",61,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Vaal Greatsword",63,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Lion Sword",65,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Infernal Sword",67,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Driftwood Wand",0,"WEAPON","TWO_HANDED_SWORD"),
	addItem("Goat's Horn",6,"WEAPON","WAND"),
	addItem("Carved Wand",12,"WEAPON","WAND"),
	addItem("Quartz Wand",18,"WEAPON","WAND"),
	addItem("Spiraled Wand",24,"WEAPON","WAND"),
	addItem("Sage Wand",30,"WEAPON","WAND"),
	addItem("Faun's Horn",35,"WEAPON","WAND"),
	addItem("Engraved Wand",40,"WEAPON","WAND"),
	addItem("Crystal Wand",45,"WEAPON","WAND"),
	addItem("Serpent Wand",49,"WEAPON","WAND"),
	addItem("Omen Wand",53,"WEAPON","WAND"),
	addItem("Demon's Horn",56,"WEAPON","WAND"),
	addItem("Imbued Wand",59,"WEAPON","WAND"),
	addItem("Opal Wand",62,"WEAPON","WAND"),
	addItem("Tornado Wand",65,"WEAPON","WAND"),
	addItem("Prophecy Wand",68,"WEAPON","WAND"),
	addItem("Plate Vest",0,"CHEST","AR"),
	addItem("Chestplate",6,"CHEST","AR"),
	addItem("Copper Plate",17,"CHEST","AR"),
	addItem("War Plate",21,"CHEST","AR"),
	addItem("Full Plate",28,"CHEST","AR"),
	addItem("Arena Plate",32,"CHEST","AR"),
	addItem("Lordly Plate",35,"CHEST","AR"),
	addItem("Bronze Plate",37,"CHEST","AR"),
	addItem("Battle Plate",41,"CHEST","AR"),
	addItem("Sun Plate",45,"CHEST","AR"),
	addItem("Colosseum Plate",49,"CHEST","AR"),
	addItem("Majestic Plate",53,"CHEST","AR"),
	addItem("Golden Plate",56,"CHEST","AR"),
	addItem("Crusader Plate",59,"CHEST","AR"),
	addItem("Astral Plate",62,"CHEST","AR"),
	addItem("Gladiator Plate",65,"CHEST","AR"),
	addItem("Glorious Plate",68,"CHEST","AR"),
	addItem("Shabby Jerkin",0,"CHEST","EV"),
	addItem("Strapped Leather",9,"CHEST","EV"),
	addItem("Buckskin Tunic",17,"CHEST","EV"),
	addItem("Wild Leather",25,"CHEST","EV"),
	addItem("Full Leather",28,"CHEST","EV"),
	addItem("Sun Leather",32,"CHEST","EV"),
	addItem("Thief's Garb",35,"CHEST","EV"),
	addItem("Eelskin Tunic",37,"CHEST","EV"),
	addItem("Frontier Leather",41,"CHEST","EV"),
	addItem("Glorious Leather",45,"CHEST","EV"),
	addItem("Coronal Leather",49,"CHEST","EV"),
	addItem("Cutthroat's Garb",53,"CHEST","EV"),
	addItem("Sharkskin Tunic",56,"CHEST","EV"),
	addItem("Destiny Leather",59,"CHEST","EV"),
	addItem("Exquisite Leather",62,"CHEST","EV"),
	addItem("Zodiac Leather",65,"CHEST","EV"),
	addItem("Assassin's Garb",68,"CHEST","EV"),
	addItem("Simple Robe",0,"CHEST","ES"),
	addItem("Silken Vest",11,"CHEST","ES"),
	addItem("Scholar's Robe",18,"CHEST","ES"),
	addItem("Silken Garb",25,"CHEST","ES"),
	addItem("Mage's Vestment",28,"CHEST","ES"),
	addItem("Silk Robe",32,"CHEST","ES"),
	addItem("Cabalist Regalia",35,"CHEST","ES"),
	addItem("Sage's Robe",37,"CHEST","ES"),
	addItem("Silken Wrap",41,"CHEST","ES"),
	addItem("Conjurer's Vestment",45,"CHEST","ES"),
	addItem("Spidersilk Robe",49,"CHEST","ES"),
	addItem("Destroyer Regalia",53,"CHEST","ES"),
	addItem("Savant's Robe",56,"CHEST","ES"),
	addItem("Necromancer Silks",59,"CHEST","ES"),
	addItem("Occultist's Vestment",62,"CHEST","ES"),
	addItem("Widowsilk Robe",65,"CHEST","ES"),
	addItem("Vaal Regalia",68,"CHEST","ES"),
	addItem("Scale Vest",0,"CHEST","AR_EV"),
	addItem("Light Brigandine",8,"CHEST","AR_EV"),
	addItem("Scale Doublet",17,"CHEST","AR_EV"),
	addItem("Infantry Brigandine",21,"CHEST","AR_EV"),
	addItem("Full Scale Armour",28,"CHEST","AR_EV"),
	addItem("Soldier's Brigandine",32,"CHEST","AR_EV"),
	addItem("Field Lamellar",35,"CHEST","AR_EV"),
	addItem("Wyrmscale Doublet",38,"CHEST","AR_EV"),
	addItem("Hussar Brigandine",42,"CHEST","AR_EV"),
	addItem("Full Wyrmscale",46,"CHEST","AR_EV"),
	addItem("Commander's Brigandine",50,"CHEST","AR_EV"),
	addItem("Battle Lamellar",54,"CHEST","AR_EV"),
	addItem("Dragonscale Doublet",57,"CHEST","AR_EV"),
	addItem("Desert Brigandine",60,"CHEST","AR_EV"),
	addItem("Full Dragonscale",63,"CHEST","AR_EV"),
	addItem("General's Brigandine",66,"CHEST","AR_EV"),
	addItem("Triumphant Lamellar",69,"CHEST","AR_EV"),
	addItem("Chainmail Vest",0,"CHEST","AR_ES"),
	addItem("Chainmail Tunic",8,"CHEST","AR_ES"),
	addItem("Ringmail Coat",17,"CHEST","AR_ES"),
	addItem("Chainmail Doublet",21,"CHEST","AR_ES"),
	addItem("Full Ringmail",28,"CHEST","AR_ES"),
	addItem("Full Chainmail",32,"CHEST","AR_ES"),
	addItem("Holy Chainmail",35,"CHEST","AR_ES"),
	addItem("Latticed Ringmail",39,"CHEST","AR_ES"),
	addItem("Crusader Chainmail",43,"CHEST","AR_ES"),
	addItem("Ornate Ringmail",47,"CHEST","AR_ES"),
	addItem("Chain Hauberk",51,"CHEST","AR_ES"),
	addItem("Devout Chainmail",55,"CHEST","AR_ES"),
	addItem("Loricated Ringmail",58,"CHEST","AR_ES"),
	addItem("Conquest Chainmail",61,"CHEST","AR_ES"),
	addItem("Elegant Ringmail",64,"CHEST","AR_ES"),
	addItem("Saint's Hauberk",67,"CHEST","AR_ES"),
	addItem("Saintly Chainmail",70,"CHEST","AR_ES"),
	addItem("Padded Vest",0,"CHEST","EV_ES"),
	addItem("Oiled Vest",9,"CHEST","EV_ES"),
	addItem("Padded Jacket",18,"CHEST","EV_ES"),
	addItem("Oiled Coat",22,"CHEST","EV_ES"),
	addItem("Scarlet Raiment",28,"CHEST","EV_ES"),
	addItem("Waxed Garb",32,"CHEST","EV_ES"),
	addItem("Bone Armour",35,"CHEST","EV_ES"),
	addItem("Quilted Jacket",40,"CHEST","EV_ES"),
	addItem("Sleek Coat",44,"CHEST","EV_ES"),
	addItem("Crimson Raiment",48,"CHEST","EV_ES"),
	addItem("Lacquered Garb",52,"CHEST","EV_ES"),
	addItem("Crypt Armour",56,"CHEST","EV_ES"),
	addItem("Sentinel Jacket",59,"CHEST","EV_ES"),
	addItem("Varnished Coat",62,"CHEST","EV_ES"),
	addItem("Blood Raiment",65,"CHEST","EV_ES"),
	addItem("Sadist Garb",68,"CHEST","EV_ES"),
	addItem("Carnal Armour",71,"CHEST","EV_ES"),
	addItem("Iron Greaves",0,"BOOT","AR"),
	addItem("Steel Greaves",9,"BOOT","AR"),
	addItem("Plated Greaves",23,"BOOT","AR"),
	addItem("Reinforced Greaves",33,"BOOT","AR"),
	addItem("Antique Greaves",37,"BOOT","AR"),
	addItem("Ancient Greaves",46,"BOOT","AR"),
	addItem("Goliath Greaves",54,"BOOT","AR"),
	addItem("Vaal Greaves",62,"BOOT","AR"),
	addItem("Titan Greaves",68,"BOOT","AR"),
	addItem("Rawhide Boots",0,"BOOT","EV"),
	addItem("Goathide Boots",12,"BOOT","EV"),
	addItem("Deerskin Boots",22,"BOOT","EV"),
	addItem("Nubuck Boots",34,"BOOT","EV"),
	addItem("Eelskin Boots",39,"BOOT","EV"),
	addItem("Sharkskin Boots",44,"BOOT","EV"),
	addItem("Shagreen Boots",55,"BOOT","EV"),
	addItem("Stealth Boots",62,"BOOT","EV"),
	addItem("Slink Boots",69,"BOOT","EV"),
	addItem("Wool Shoes",0,"BOOT","ES"),
	addItem("Velvet Slippers",9,"BOOT","ES"),
	addItem("Silk Slippers",22,"BOOT","ES"),
	addItem("Scholar Boots",32,"BOOT","ES"),
	addItem("Satin Slippers",38,"BOOT","ES"),
	addItem("Samite Slippers",44,"BOOT","ES"),
	addItem("Conjurer Boots",53,"BOOT","ES"),
	addItem("Arcanist Slippers",61,"BOOT","ES"),
	addItem("Sorcerer Boots",67,"BOOT","ES"),
	addItem("Leatherscale Boots",6,"BOOT","AR_EV"),
	addItem("Ironscale Boots",18,"BOOT","AR_EV"),
	addItem("Bronzescale Boots",30,"BOOT","AR_EV"),
	addItem("Steelscale Boots",36,"BOOT","AR_EV"),
	addItem("Serpentscale Boots",42,"BOOT","AR_EV"),
	addItem("Wyrmscale Boots",51,"BOOT","AR_EV"),
	addItem("Hydrascale Boots",59,"BOOT","AR_EV"),
	addItem("Dragonscale Boots",65,"BOOT","AR_EV"),
	addItem("Chain Boots",5,"BOOT","AR_ES"),
	addItem("Ringmail Boots",13,"BOOT","AR_ES"),
	addItem("Mesh Boots",28,"BOOT","AR_ES"),
	addItem("Riveted Boots",36,"BOOT","AR_ES"),
	addItem("Zealot Boots",40,"BOOT","AR_ES"),
	addItem("Soldier Boots",49,"BOOT","AR_ES"),
	addItem("Legion Boots",58,"BOOT","AR_ES"),
	addItem("Crusader Boots",64,"BOOT","AR_ES"),
	addItem("Wrapped Boots",6,"BOOT","EV_ES"),
	addItem("Strapped Boots",16,"BOOT","EV_ES"),
	addItem("Clasped Boots",27,"BOOT","EV_ES"),
	addItem("Shackled Boots",34,"BOOT","EV_ES"),
	addItem("Trapper Boots",41,"BOOT","EV_ES"),
	addItem("Ambush Boots",47,"BOOT","EV_ES"),
	addItem("Carnal Boots",55,"BOOT","EV_ES"),
	addItem("Assassin's Boots",63,"BOOT","EV_ES"),
	addItem("Murder Boots",69,"BOOT","EV_ES"),
	addItem("Iron Gauntlets",0,"GLOVE","AR"),
	addItem("Plated Gauntlets",11,"GLOVE","AR"),
	addItem("Bronze Gauntlets",23,"GLOVE","AR"),
	addItem("Steel Gauntlets",35,"GLOVE","AR"),
	addItem("Antique Gauntlets",39,"GLOVE","AR"),
	addItem("Ancient Gauntlets",47,"GLOVE","AR"),
	addItem("Goliath Gauntlets",53,"GLOVE","AR"),
	addItem("Vaal Gauntlets",63,"GLOVE","AR"),
	addItem("Titan Gauntlets",69,"GLOVE","AR"),
	addItem("Rawhide Gloves",0,"GLOVE","EV"),
	addItem("Goathide Gloves",9,"GLOVE","EV"),
	addItem("Deerskin Gloves",21,"GLOVE","EV"),
	addItem("Nubuck Gloves",33,"GLOVE","EV"),
	addItem("Eelskin Gloves",38,"GLOVE","EV"),
	addItem("Sharkskin Gloves",45,"GLOVE","EV"),
	addItem("Shagreen Gloves",54,"GLOVE","EV"),
	addItem("Stealth Gloves",62,"GLOVE","EV"),
	addItem("Slink Gloves",70,"GLOVE","EV"),
	addItem("Wool Gloves",0,"GLOVE","ES"),
	addItem("Velvet Gloves",12,"GLOVE","ES"),
	addItem("Silk Gloves",25,"GLOVE","ES"),
	addItem("Embroidered Gloves",36,"GLOVE","ES"),
	addItem("Satin Gloves",41,"GLOVE","ES"),
	addItem("Samite Gloves",47,"GLOVE","ES"),
	addItem("Conjurer Gloves",55,"GLOVE","ES"),
	addItem("Arcanist Gloves",60,"GLOVE","ES"),
	addItem("Sorcerer Gloves",69,"GLOVE","ES"),
	addItem("Fishscale Gauntlets",0,"GLOVE","AR_EV"),
	addItem("Ironscale Gauntlets",15,"GLOVE","AR_EV"),
	addItem("Bronzescale Gauntlets",27,"GLOVE","AR_EV"),
	addItem("Steelscale Gauntlets",36,"GLOVE","AR_EV"),
	addItem("Serpentscale Gauntlets",43,"GLOVE","AR_EV"),
	addItem("Wyrmscale Gauntlets",49,"GLOVE","AR_EV"),
	addItem("Hydrascale Gauntlets",59,"GLOVE","AR_EV"),
	addItem("Dragonscale Gauntlets",67,"GLOVE","AR_EV"),
	addItem("Chain Gloves",7,"GLOVE","AR_ES"),
	addItem("Ringmail Gloves",19,"GLOVE","AR_ES"),
	addItem("Mesh Gloves",32,"GLOVE","AR_ES"),
	addItem("Riveted Gloves",37,"GLOVE","AR_ES"),
	addItem("Zealot Gloves",43,"GLOVE","AR_ES"),
	addItem("Soldier Gloves",51,"GLOVE","AR_ES"),
	addItem("Legion Gloves",57,"GLOVE","AR_ES"),
	addItem("Crusader Gloves",66,"GLOVE","AR_ES"),
	addItem("Wrapped Mitts",5,"GLOVE","EV_ES"),
	addItem("Strapped Mitts",16,"GLOVE","EV_ES"),
	addItem("Clasped Mitts",31,"GLOVE","EV_ES"),
	addItem("Trapper Mitts",36,"GLOVE","EV_ES"),
	addItem("Ambush Mitts",45,"GLOVE","EV_ES"),
	addItem("Carnal Mitts",50,"GLOVE","EV_ES"),
	addItem("Assassin's Mitts",58,"GLOVE","EV_ES"),
	addItem("Murder Mitts",67,"GLOVE","EV_ES"),
	addItem("Iron Hat",0,"HELM","AR"),
	addItem("Cone Helmet",7,"HELM","AR"),
	addItem("Barbute Helmet",18,"HELM","AR"),
	addItem("Close Helmet",26,"HELM","AR"),
	addItem("Gladiator Helmet",35,"HELM","AR"),
	addItem("Reaver Helmet",40,"HELM","AR"),
	addItem("Siege Helmet",48,"HELM","AR"),
	addItem("Samite Helmet",55,"HELM","AR"),
	addItem("Ezomyte Burgonet",60,"HELM","AR"),
	addItem("Royal Burgonet",65,"HELM","AR"),
	addItem("Eternal Burgonet",69,"HELM","AR"),
	addItem("Leather Cap",0,"HELM","EV"),
	addItem("Tricorne",10,"HELM","EV"),
	addItem("Leather Hood",20,"HELM","EV"),
	addItem("Wolf Pelt",30,"HELM","EV"),
	addItem("Hunter Hood",41,"HELM","EV"),
	addItem("Noble Tricorne",47,"HELM","EV"),
	addItem("Ursine Pelt",55,"HELM","EV"),
	addItem("Silken Hood",60,"HELM","EV"),
	addItem("Sinner Tricorne",64,"HELM","EV"),
	addItem("Lion Pelt",70,"HELM","EV"),
	addItem("Vine Circlet",0,"HELM","ES"),
	addItem("Iron Circlet",8,"HELM","ES"),
	addItem("Torture Cage",17,"HELM","ES"),
	addItem("Tribal Circlet",26,"HELM","ES"),
	addItem("Bone Circlet",34,"HELM","ES"),
	addItem("Lunaris Circlet",39,"HELM","ES"),
	addItem("Steel Circlet",48,"HELM","ES"),
	addItem("Necromancer Circlet",54,"HELM","ES"),
	addItem("Solaris Circlet",59,"HELM","ES"),
	addItem("Mind Cage",65,"HELM","ES"),
	addItem("Hubris Circlet",69,"HELM","ES"),
	addItem("Battered Helm",0,"HELM","AR_EV"),
	addItem("Sallet",13,"HELM","AR_EV"),
	addItem("Visored Sallet",23,"HELM","AR_EV"),
	addItem("Gilded Sallet",33,"HELM","AR_EV"),
	addItem("Secutor Helm",36,"HELM","AR_EV"),
	addItem("Fencer Helm",43,"HELM","AR_EV"),
	addItem("Lacquered Helmet",51,"HELM","AR_EV"),
	addItem("Fluted Bascinet",58,"HELM","AR_EV"),
	addItem("Pig Faced Bascinet",63,"HELM","AR_EV"),
	addItem("Nightmare Bascinet",67,"HELM","AR_EV"),
	addItem("Rusted Coif",5,"HELM","AR_ES"),
	addItem("Soldier Helmet",12,"HELM","AR_ES"),
	addItem("Great Helmet",22,"HELM","AR_ES"),
	addItem("Crusader Helmet",31,"HELM","AR_ES"),
	addItem("Aventail Helmet",37,"HELM","AR_ES"),
	addItem("Zealot Helmet",44,"HELM","AR_ES"),
	addItem("Great Crown",53,"HELM","AR_ES"),
	addItem("Magistrate Crown",58,"HELM","AR_ES"),
	addItem("Prophet Crown",63,"HELM","AR_ES"),
	addItem("Praetor Crown",68,"HELM","AR_ES"),
	addItem("Scare Mask",0,"HELM","EV_ES"),
	addItem("Plague Mask",10,"HELM","EV_ES"),
	addItem("Iron Mask",17,"HELM","EV_ES"),
	addItem("Festival Mask",28,"HELM","EV_ES"),
	addItem("Golden Mask",35,"HELM","EV_ES"),
	addItem("Raven Mask",38,"HELM","EV_ES"),
	addItem("Callous Mask",45,"HELM","EV_ES"),
	addItem("Regicide Mask",52,"HELM","EV_ES"),
	addItem("Harlequin Mask",57,"HELM","EV_ES"),
	addItem("Vaal Mask",62,"HELM","EV_ES"),
	addItem("Deicide Mask",67,"HELM","EV_ES"),
	addItem("Splintered Tower Shield",0,"SHIELD","AR"),
	addItem("Corroded Tower Shield",5,"SHIELD","AR"),
	addItem("Rawhide Tower Shield",11,"SHIELD","AR"),
	addItem("Cedar Tower Shield",17,"SHIELD","AR"),
	addItem("Copper Tower Shield",24,"SHIELD","AR"),
	addItem("Reinforced Tower Shield",30,"SHIELD","AR"),
	addItem("Painted Tower Shield",35,"SHIELD","AR"),
	addItem("Buckskin Tower Shield",39,"SHIELD","AR"),
	addItem("Mahogany Tower Shield",43,"SHIELD","AR"),
	addItem("Bronze Tower Shield",47,"SHIELD","AR"),
	addItem("Girded Tower Shield",51,"SHIELD","AR"),
	addItem("Crested Tower Shield",55,"SHIELD","AR"),
	addItem("Shagreen Tower Shield",58,"SHIELD","AR"),
	addItem("Ebony Tower Shield",61,"SHIELD","AR"),
	addItem("Ezomyte Tower Shield",64,"SHIELD","AR"),
	addItem("Colossal Tower Shield",67,"SHIELD","AR"),
	addItem("Pinnacle Tower Shield",70,"SHIELD","AR"),
	addItem("Goathide Buckler",0,"SHIELD","EV"),
	addItem("Pine Buckler",8,"SHIELD","EV"),
	addItem("Painted Buckler",16,"SHIELD","EV"),
	addItem("Hammered Buckler",23,"SHIELD","EV"),
	addItem("War Buckler",29,"SHIELD","EV"),
	addItem("Gilded Buckler",34,"SHIELD","EV"),
	addItem("Oak Buckler",38,"SHIELD","EV"),
	addItem("Enameled Buckler",42,"SHIELD","EV"),
	addItem("Corrugated Buckler",46,"SHIELD","EV"),
	addItem("Battle Buckler",50,"SHIELD","EV"),
	addItem("Golden Buckler",54,"SHIELD","EV"),
	addItem("Ironwood Buckler",57,"SHIELD","EV"),
	addItem("Lacquered Buckler",60,"SHIELD","EV"),
	addItem("Vaal Buckler",63,"SHIELD","EV"),
	addItem("Crusader Buckler",66,"SHIELD","EV"),
	addItem("Imperial Buckler",69,"SHIELD","EV"),
	addItem("Twig Spirit Shield",0,"SHIELD","ES"),
	addItem("Yew Spirit Shield",9,"SHIELD","ES"),
	addItem("Bone Spirit Shield",15,"SHIELD","ES"),
	addItem("Tarnished Spirit Shield",23,"SHIELD","ES"),
	addItem("Jingling Spirit Shield",28,"SHIELD","ES"),
	addItem("Brass Spirit Shield",33,"SHIELD","ES"),
	addItem("Walnut Spirit Shield",37,"SHIELD","ES"),
	addItem("Ivory Spirit Shield",41,"SHIELD","ES"),
	addItem("Ancient Spirit Shield",45,"SHIELD","ES"),
	addItem("Chiming Spirit Shield",49,"SHIELD","ES"),
	addItem("Thorium Spirit Shield",53,"SHIELD","ES"),
	addItem("Lacewood Spirit Shield",56,"SHIELD","ES"),
	addItem("Fossilized Spirit Shield",59,"SHIELD","ES"),
	addItem("Vaal Spirit Shield",62,"SHIELD","ES"),
	addItem("Harmonic Spirit Shield",65,"SHIELD","ES"),
	addItem("Titanium Spirit Shield",68,"SHIELD","ES"),
	addItem("Rotted Round Shield",5,"SHIELD","AR_EV"),
	addItem("Fir Round Shield",12,"SHIELD","AR_EV"),
	addItem("Studded Round Shield",20,"SHIELD","AR_EV"),
	addItem("Scarlet Round Shield",27,"SHIELD","AR_EV"),
	addItem("Splendid Round Shield",33,"SHIELD","AR_EV"),
	addItem("Maple Round Shield",39,"SHIELD","AR_EV"),
	addItem("Spiked Round Shield",45,"SHIELD","AR_EV"),
	addItem("Crimson Round Shield",49,"SHIELD","AR_EV"),
	addItem("Baroque Round Shield",54,"SHIELD","AR_EV"),
	addItem("Teak Round Shield",58,"SHIELD","AR_EV"),
	addItem("Spiny Round Shield",62,"SHIELD","AR_EV"),
	addItem("Cardinal Round Shield",66,"SHIELD","AR_EV"),
	addItem("Elegant Round Shield",70,"SHIELD","AR_EV"),
	addItem("Plank Kite Shield",7,"SHIELD","AR_ES"),
	addItem("Linden Kite Shield",13,"SHIELD","AR_ES"),
	addItem("Reinforced Kite Shield",20,"SHIELD","AR_ES"),
	addItem("Layered Kite Shield",27,"SHIELD","AR_ES"),
	addItem("Ceremonial Kite Shield",34,"SHIELD","AR_ES"),
	addItem("Etched Shield",40,"SHIELD","AR_ES"),
	addItem("Steel Kite Shield",46,"SHIELD","AR_ES"),
	addItem("Laminated Kite Shield",50,"SHIELD","AR_ES"),
	addItem("Angelic Kite Shield",55,"SHIELD","AR_ES"),
	addItem("Branded Kite Shield",59,"SHIELD","AR_ES"),
	addItem("Champion Kite Shield",62,"SHIELD","AR_ES"),
	addItem("Mosaic Kite Shield",65,"SHIELD","AR_ES"),
	addItem("Archon Kite Shield",68,"SHIELD","AR_ES"),
	addItem("Spiked Bundle",5,"SHIELD","EV_ES"),
	addItem("Driftwood Spiked Shield",12,"SHIELD","EV_ES"),
	addItem("Alloyed Spike Shield",20,"SHIELD","EV_ES"),
	addItem("Burnished Spike Shield",27,"SHIELD","EV_ES"),
	addItem("Ornate Spiked Shield",33,"SHIELD","EV_ES"),
	addItem("Redwood Spiked Shield",39,"SHIELD","EV_ES"),
	addItem("Compound Spiked Shield",45,"SHIELD","EV_ES"),
	addItem("Polished Spiked Shield",49,"SHIELD","EV_ES"),
	addItem("Sovereign Spiked Shield",54,"SHIELD","EV_ES"),
	addItem("Alder Spike Shield",58,"SHIELD","EV_ES"),
	addItem("Ezomyte Spiked Shield",62,"SHIELD","EV_ES"),
	addItem("Mirrored Spiked Shield",66,"SHIELD","EV_ES"),
	addItem("Supreme Spiked Shield",70,"SHIELD","EV_ES")
	
	return items;
})();