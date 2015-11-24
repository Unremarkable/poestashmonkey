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
	var timestamp = new Date().getTime();
	style.href=BASE_URL+"/css/main.css?_v=" + timestamp;
    $("head")[0].appendChild(style);
}

var existingItems = [];

function getParameterByName(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

//*****************************************************************************
// Manual Preloading
//*****************************************************************************
/*
var RequestPool = (function() {
	var self = this;
	
	self.pool = [];
	self.timeout = 0;
	self.nextAttempt = null;
	
	function Request(ajax) {
		this.ajax = ajax;
		this.deferred = $.Deferred();
	}
	
	function _send(request) {
		$.ajax(request.ajax)
			.done(function(result) {
				if (result.error) {
					request.deferred.notify("error", result.error);
				} else {
					request.deferred.resolve(result);
				}
			})
			.fail(function() {
				console.log("RequestPool._send:fail", request, arguments);
			});
	}
	
	function _error(request) {
		self.timeout = Math.min(2, Math.max(32, self.timeout * 2));
		_queue(request);
	}
	
	function _success(request) {
		self.timeout = 0;
	}
	
	function _queue(request) {
		
	}
	
	self.request = function(ajax) {
		var request = new RequestWrapper(ajax);
		
		if (self.timeout == 0) {
			_send(request);
		} else {
			_queue(request);
		}
		
		return request.deferred.promise();
	};
	
	return self;
})();
*/
var Ajaxable = function(text, ajax, callback) {
	var self = this;
	
	self.ajax     = ajax;
	self.callback = callback;
	
	self.setState = function(state) {
		switch (state) {
			case "pending": self.dom.css('color', 'yellow'); break;
			case "success": self.dom.css('color', 'green'); break;
			case "error":   self.dom.css('color', 'red'); break;
		}
		self.state = state;
	};
	
	self.dom = $("<span></span>");
	self.dom.text(text);
	self.state = "idle";
	self.timeout = 1000;
	
	self.request = function() {
		if (self.state == "idle" || self.state == "error") {
			self.setState("pending");
			$.ajax(ajax)
				.done(function(result) {
					if (result.error) {
						self.setState("error");
						self.retry();
					} else {
						self.setState("success");
						self.callback(result);
						self.timeout = 1000;
					}
				})
				/*.progress(function(status) {
					switch (status) {
					case "error": self.setStatus("error"); break;
					case "pending": self.setStatus("pending"); break;
					}
				})*/
				.fail(function() {
				//	Shouldn't fail.  Something messed up!
				});
		}
	};
	
	self.retry = function() {
		console.log("Will retry in " + self.timeout + "ms.");
		setTimeout(self.request, self.timeout);
		self.timeout = Math.min(self.timeout * 2, 32000);
	};
};

var PoEData = (function() {
	var data = {};
	
	data.finished = function() {
		if (data.ajax.character_metadata.state != "success")
			return false;
		if (data.ajax.stash_metadata.state != "success")
			return false;
		for (var i = 0; i < data.ajax.character_data.length; ++i)
			if (data.ajax.character_data[i].state != "success")
				return false;
		for (var i = 0; i < data.ajax.stash_data.length; ++i)
			if (!data.ajax.stash_data[i] || data.ajax.stash_data[i].state != "success")
				return false;
		return true;
	};
	
	function finish() {
		if (data.finished()) {
			console.log("Done!");
			data.ui.base.css("display", "none");
			receiveStashDataFinished();
		}
	}
	
	var accountNameCookie = document.cookie.match('(^|;)?stashMonkeyAccountName=([^;]*)(;|$)');
    
	if (accountNameCookie) {
		var accountName = accountNameCookie[2];
		console.log("Account name " + accountName + " loaded from cookie.");
	} else {
		var accountName = prompt("Account name");
		document.cookie = 'stashMonkeyAccountName=' + accountName
	}
	
	data.receive_character_metadata = function(metadata) {
		data.ajax.character_data = new Array(metadata.length);
		for (var i = 0; i < metadata.length; ++i) {
			var name = metadata[i].name;
			if (typeof data.ajax.character_data[i] === "undefined")
				data.ajax.character_data[i] = new Ajaxable(name, { "url": "https://www.pathofexile.com/character-window/get-items", "data" : { "character" : name, "accountName" : accountName } }, (function(k) { return function (r) { data.receive_character_data(r, k); }; })(name));
			data.ui.character_data.append($("<li></li>").append(data.ajax.character_data[i].dom));
		
			data.ajax.character_data[i].request();
		}
	};
	
	data.receive_stash_metadata = function(metadata) {
		stashMetaData["Standard"] = metadata.tabs;	// legacy
		
		data.ajax.stash_data = new Array(metadata.tabs.length);
		for (var i = 0; i < metadata.tabs.length; ++i) {
			var tab = metadata.tabs[i];
			data.ajax.stash_data[i] = new Ajaxable(tab.n, { url: "https://www.pathofexile.com/character-window/get-stash-items", data: { "league": "Standard", "tabs": 0, "tabIndex": i } },	(function(k) { return function(r) { data.receive_stash_data(r, k); }; })(i));
			data.ui.stash_data.append($("<li></li>").append(data.ajax.stash_data[i].dom));
			if (i == 0) {
				data.ajax.stash_data[0].setState("success");
				data.ajax.stash_data[0].callback(metadata);
			} else {
				data.ajax.stash_data[i].request();
			}
		}
	};
	
	data.receive_character_data = function(result, name) {
	//	console.log(result);
	//	receiveItemData(result.items);
		receiveCharacterData("Standard", name, result);
		finish();
	};
	
	data.receive_stash_data = function(result, tab) {
	//	console.log(result);
	//	receiveItemData(result.items);
		receiveStashData("Standard", tab, result);
		finish();
	};

	data.ajax = {};
	data.ajax.character_metadata = new Ajaxable("Character List", { url: "https://www.pathofexile.com/character-window/get-characters" }, data.receive_character_metadata);
	data.ajax.stash_metadata     = new Ajaxable("Stash List", { url: "https://www.pathofexile.com/character-window/get-stash-items", data: { "league": "Standard", "tabs": 1, "tabIndex": 0 } },	data.receive_stash_metadata);
	data.ajax.character_data     = {};
	data.ajax.stash_data         = {};
	
	data.ui = {};
	data.ui.base = $("<div></div>");
	
	data.ui.character_metadata = $(data.ajax.character_metadata.dom);
	data.ui.base.append(data.ui.character_metadata);
	
	data.ui.character_data = $("<ul></ul>");
	data.ui.base.append(data.ui.character_data);
	
	data.ui.stash_metadata = $(data.ajax.stash_metadata.dom);
	data.ui.base.append(data.ui.stash_metadata);
	
	data.ui.stash_data = $("<ul></ul>");
	data.ui.base.append(data.ui.stash_data);
	
	data.ajax.character_metadata.request();
	data.ajax.stash_metadata.request();
	
	return data;
})();

function preload_main()
{
	$("body").append(PoEData.ui.base);
}

//*****************************************************************************
// End Manual Preloading
//*****************************************************************************

function ready() {
    insertStylesheet();

    if ($("pre").length > 0) {
        existingItems = JSON.parse($("pre").html()).items;
    }

    $("body").html("<h2>Loading...</h2>");

	var league = getParameterByName("league") || "Standard";

	buildPage();
	preload_main();
//	requestCharacterData(league);
//	requestStashData(league);

    // does not work yet
    // fetchCurrencyConversionTable();
};

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
			"Rarity":  addIncreasedRarity,
            "AffixRating": addAffixRating
		})[table.columns[c]](row, item);
	}

	table.dom.appendChild(row);
}

function receiveItemData(items) {
	prepareItems(items);

	for (var i = 0; i < items.length; ++i) {
		var item = items[i];
		var itemType = item.frameType;
		var name = item.typeLine;
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

var currency = [];

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
var accesoriesColumnsWithDamage = accesoriesColumns.concat(["eDMG", "Rarity"]);
var advancedColumns = basicColumns.concat(["Str", "Int", "Dex", "Quality", "Sockets", "Mods", "AffixRating"]);
var gearColumns =  advancedColumns.concat(["AR", "EV", "ES", "tResist", "eDMG", "Rarity"]);

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

function getRequiredLevel(item) {
    if (item.baseItem) {
        if (item.affixes && item.affixes.length > 0) {
            var highestAffix = Object.max(item.affixes, function (affix) {
                return affix.level;
            });
            return Math.max(item.baseItem.level, Math.floor(highestAffix * 0.8));
        }
        return item.baseItem.level;
    }

    return getRequirement(item, "level");
}

function prepareItems(items) {
    for (var i = 0; i < items.length; ++i) {
        var item = items[i];

        if (item.prepared)
            return;
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
                })
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
    }
}

function removeStrangeCharacters(text) {
	var parts = text.split("<<set:MS>><<set:M>><<set:S>>");
	return parts[parts.length -1];
}

function addItemElementalDamage(row, item) {
	var eDMG = getElementalDamage(item);
	appendNewCellWithTextAndClass(row, (eDMG[0] || eDMG[1]) ? eDMG[0]+"-"+eDMG[1] : 0, "edmg", eDMG[0] + eDMG[1]);
}

function getRarityIncreaseForMods(mods) {
	var rarityType = "#% increased Rarity of Items found";

	var rarityIncrease = 0;
	var mod = mods[rarityType];
	if (mod) {
		rarityIncrease = parseInt(mod.values[0]);
	}
	return rarityIncrease;
}

function addIncreasedRarity(row, item) {
	var rarityIncrease = getRarityIncreaseForMods(item.explicitMods) + getRarityIncreaseForMods(item.implicitMods);
	appendNewCellWithTextAndClass(row, rarityIncrease, "rarity", rarityIncrease);
}

function addAffixRating(row, item) {
    if (item.affixes && item.affixes.length > 0) {
        var average = (item.affixes.reduce(function (sum, affix) {
            return sum + affix.level;
        }, 0) / item.affixes.length) - parseInt(getRequirement(item, "Level"));

        var text = "<ul class='affixes'>"+item.affixes.map(function (affix) {
            var highestForItemLevel = true;
            var highestInGroup      = true;

            var highestAffixLevel = Math.floor(parseInt(getRequirement(item, "Level")) / 0.8 + 1);

            Object.forEach(affix.group.affixes, function (alternative) {
               if (alternative.level > affix.level) {
                   highestInGroup = false;
                   if (alternative.level <= highestAffixLevel)
                        highestForItemLevel = false;
               }
            });

            // this should be moved to affix.js
            var title = affix.properties.map(function (property) {
                if (property.range.length == 2)
                    return property.name.replace("#-#","["+property.range[0].min+"-"+property.range[0].max+"]-["+property.range[1].min+"-"+property.range[1].max+"]");
                return property.name.replace("#","["+property.range[0].min+"-"+property.range[0].max+"]");
            }).join("\n");

            var val = "<li title=\""+title+"\">"+affix.name + "(" + affix.level + ")</li>";

            if (highestInGroup)
                return val.fontcolor("green");
            if (highestForItemLevel)
                return val.fontcolor("yellow");

            return val;
        }).join("")+"</ul>";

        appendNewCellWithTextAndClass(row, text, "AffixRating", average);
    } else {
        appendNewCellWithTextAndClass(row, "", "AffixRating", -9999);
    }
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
function createLevelCell(row, item) {
    createRequirementCell(row, item, "Level");
//    var req = getRequiredLevel(item);
//    var old = getRequirement(item, "Level");
//    if (req != old && req && old && item.frameType != 3 && old.indexOf("(gem)") == -1)
//        console.log("cmp", item, req, old, mistake_count++);
//    appendNewCellWithTextAndClass(row, req, "level", req);
}
var mistake_count = 0;
function createRequirementCell(row, item, reqName) {
    var req = getRequirement(item, reqName);
    appendNewCellWithTextAndClass(row, req, reqName.toLowerCase(), req);
}

function appendNewCellWithTextAndClass(row, text, className, sortValue) {
    var td = newCell();
    td.className = className;
    $(td).attr("data-sortValue", sortValue);
    td.innerHTML = text;
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
    var searchBox = "<div id='searchBoxContainer'><input id='searchBox' type='text' placeholder='Search...' autofocus /><div id='clearSearch'>x</div></div>";
    var infoBox = "<div id='infoBox'></div>";
    $("body").html("<div>" + title + searchBox + infoBox + "</div>");

    $("body").keypress(function(e) {
        if (!$("#searchBox").is(":focus")) {
            $("#searchBox").focus();
        }
    });

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
