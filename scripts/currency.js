var currencyConversionTable = {};

function fetchCurrencyConversionTable(){
	$.get( "http://exilestats.com/ex/", function( data ) {
		var conversionCells = $(data).find("#newspaper-a td.cell");
		
		for(var i in conversionCells){
			var conversionCell = $(conversionCells[i]);
			
			var orbNames = conversionCell.attr("title").split(" : ");
			var orbValues = conversionCell.find("span").html().split(":");
			console.log(orbNames + " " + orbValues);
			
			var ratio = parseFloat(orbValues[0]) / parseFloat(orbValues[1]);
			
			currencyConversionTable[orbNames[0]] = {};
			currencyConversionTable[orbNames[0]][orbNames[1]] = (1.0/ratio);
			currencyConversionTable[orbNames[1]] = {};
			currencyConversionTable[orbNames[1]][orbNames[0]] = ratio;
		}
	});
}

// data from PoE trade as of 2015-12-23
var currencyToChaosMap = {
		"Orb of Augmentation" : 1.0/20.0,
		"Orb of Transmutation" : 1.0/30.0,
		"Armourer's Scrap" : 1.0/20.0,
		"Chromatic Orb" : 1.0/8.0,
		"Orb of Alteration" : 1.0/10.0,
		"Blacksmith's Whetstone" : 1/10.0,
		"Jeweller's Orb" : 1.0/5.0,
		"Orb of Chance" : 1.0/5.0,
		"Orb of Alchemy" : 1.0/4.0,
		"Cartographer's Chisel" : 1.0/3.0,
		"Orb of Fusing" : 4.0/5.0,
		"Orb of Scouring" : 2.0/3.0,
		"Orb of Chaos" : 1.0,
		"Orb of Regret" : 3.0/2.0,
		"Regal Orb" : 5.0/4.0,
		"Vaal Orb" : 2.0,
		"Blessed Orb" : 2.0,
		"Gemcutter's Prism" : 3.0,
		"Divine Orb" : 25.0,
		"Exalted Orb" : 61.0,
		"Mirror of Kalendra" : 18000.0
};