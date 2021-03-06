function main(baseURL) {
    console.log(baseURL);
    window.BASE_URL = baseURL || "https://raw.github.com/Unremarkable/poestashmonkey/master";
    var timestamp = new Date().getTime();
    $.getScript(window.BASE_URL + "/scripts/require.js")
        .done(function() {
            require([
                    window.BASE_URL+"/scripts/ajax.js?_v="+timestamp,
                    window.BASE_URL+"/scripts/prepareItems.js?_v="+timestamp,
                    window.BASE_URL+"/scripts/jungle.js?_v="+timestamp,
                    window.BASE_URL+"/scripts/currency.js?_v="+timestamp,
                    window.BASE_URL+"/scripts/tableInteractions.js?_v="+timestamp,
                    window.BASE_URL+"/scripts/selectedSummary.js?_v="+timestamp,
                    window.BASE_URL+"/scripts/stats.js?_v="+timestamp,
                    window.BASE_URL+"/scripts/weaponInfo.js?_v="+timestamp,
                    window.BASE_URL+"/scripts/data/affixes.js?_v="+timestamp,
                    window.BASE_URL+"/scripts/data/baseWeapons.js?_v="+timestamp,
                    window.BASE_URL+"/scripts/data/baseEquipment.js?_v="+timestamp
            ], function() {
                ready();
            });
        });
}

function getParameterByName(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

Object.forEach = function(obj, fct) {
    for (var k in obj) {
        fct(obj[k], k);
    }
};

Object.map = function(obj, fct) {
    var r = {};
    Object.forEach(obj, function(v, k) {
        r[k] = fct.apply(this, arguments);
    });
    return r;
};

Object.filter = function(obj, fct) {
    var r = {};
    Object.forEach(obj, function(v, k) {
        if (fct.apply(this, arguments))
            r[k] = v;
    });
    return r;
};

Object.every = function(obj, fct) {
    for (var k in obj) {
        if (!fct(obj[k], k))
            return false;
    }
    return true;
};

Object.any = function(obj, fct) {
    for (var k in obj) {
        if (fct(obj[k], k))
            return true;
    }
    return false;
};

Object.min = function(obj, fct) {
    var min = undefined;

    for (var k in obj) {
        var val = fct(obj[k], obj);
        if (val < min || min == undefined)
            min = val;
    }

    return min;
};

Object.max = function(obj, fct) {
    var max = undefined;

    for (var k in obj) {
        var val = fct(obj[k], obj);
        if (val > max || max == undefined)
            max = val;
    }

    return max;
};

Object.smallest = function(obj, fct) {
    var min = undefined;
    var key = undefined;

    for (var k in obj) {
        var val = fct(obj[k], obj);
        if (val < min || min == undefined) {
            min = val;
            key = k;
        }
    }

    return key;
};
