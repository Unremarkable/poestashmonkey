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