var CACHE_MAX_LIFE = 3600000; // one hour
var numberOfTabs = 0;
var stashMetaData = {};

var URL_GET_ITEMS = 		"https://www.pathofexile.com/character-window/get-items";
var URL_GET_STASH_ITEMS = 	"https://www.pathofexile.com/character-window/get-stash-items";
var URL_GET_CHARACTERS = 	"https://www.pathofexile.com/character-window/get-characters";

var ajaxables = [];

setInterval(function () {
    ajaxable = ajaxables.pop();
    ajaxable.call();
}, 1333 );

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
	    ajaxables.unshift(self.make_call);
    };

	self.make_call = function () {
		if (self.state == "idle" || self.state == "error") {
			self.setState("pending");
			$.ajax(self.ajax)
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
				    self.retry();
				    self.setState("error");
				});
		}
	};
	
	self.retry = function() {
	    ajaxables.push(self.make_call);
	    ajaxables.push(function(){/*no-op*/});
	    ajaxables.push(function(){console.log("Waiting for rate limit...")});
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
		document.cookie = 'stashMonkeyAccountName=' + accountName;
	}
	
	data.receive_character_metadata = function(metadata) {
		data.ajax.character_data = new Array(metadata.length);
		for (var i = 0; i < metadata.length; ++i) {
			var name = metadata[i].name;

			if (typeof data.ajax.character_data[i] === "undefined")
				data.ajax.character_data[i] = new Ajaxable(name, { "url": URL_GET_ITEMS, "data" : { "character" : name, "accountName" : accountName } }, (function(k) { return function (r) { data.receive_character_data(r, k); }; })(name));
			data.ui.character_data.append($("<li></li>").append(data.ajax.character_data[i].dom));
		
			data.ajax.character_data[i].request();
		}
	};

	data.receive_stash_metadata = function(metadata) {
		var league = "Standard";
		stashMetaData[league] = metadata.tabs;	// legacy
		
		data.ajax.stash_data = new Array(metadata.tabs.length);
		for (var i = 0; i < metadata.tabs.length; ++i) {
			var tab = metadata.tabs[i];

			data.ajax.stash_data[i] = new Ajaxable(tab.n, { url: URL_GET_STASH_ITEMS, data: { "league": league, "tabs": 0, "tabIndex": i, "accountName" : accountName } },	(function(k) { return function(r) { data.receive_stash_data(r, k); }; })(i));
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
	data.ajax.character_metadata = new Ajaxable("Character List", { url: URL_GET_CHARACTERS }, data.receive_character_metadata);
	data.ajax.stash_metadata     = new Ajaxable("Stash List", { url: URL_GET_STASH_ITEMS, data: { "league": "Standard", "tabs": 1, "tabIndex": 0, "accountName": accountName } },	data.receive_stash_metadata);
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

	var useCache = getParameterByName("cache");
	if (useCache) {
		// the timeout is necessary to give time to all of the java script files to load
		// there may be a better place to intercept this
		setTimeout(loadFromLocalStorage, 100);
	} else {
		// load from server
		data.ajax.character_metadata.request();
		data.ajax.stash_metadata.request();
	}
	
	return data;
})();

function receiveStashData(league, tab, data) {
    if (typeof stashData[league] === "undefined") stashData[league] = {};
	console.log(league, tab, data);
	console.log(stashMetaData);
	
	for (var i = 0; i < data.items.length; ++i) {
		data.items[i].inventoryId = stashMetaData[league][tab].n;
	}

	stashData[league][tab] = data;

	storeDataForKey(data.items, getLocalStorageKey(tab, league));
	receiveItemData(data.items);
}

function getAccountName() {
	var accountNameCookie = document.cookie.match('(^|;)?stashMonkeyAccountName=([^;]*)(;|$)');
    var accountName;
	
	if (accountNameCookie) {
		accountName = accountNameCookie[2];
	} else {
		accountName = prompt("Account name");
		document.cookie = 'stashMonkeyAccountName=' + accountName;
	}
	
	return accountName;
}

function getCharacterCache(name) {
	var str = localStorage["/character-window/get-items?character="+name];
	if (typeof str !== "undefined" && str.length > 0) {
		var cache = JSON.parse(str);
		if (cache && ((Date.now() - cache.date) < CACHE_MAX_LIFE))
			return cache.data;
	}
	return false;
}

function setCharacterCache(name, value) {
	localStorage["/character-window/get-items?character="+name] = JSON.stringify({
		date: Date.now(),
		data: value
	});
}

function receiveCharacterData(league, name, data) {
	for (var i = 0; i < data.items.length; ++i) {
		data.items[i].inventoryId = name + "'s " + data.items[i].inventoryId;
	}

	storeDataForKey(data.items, getLocalStorageKey(name));
	receiveItemData(data.items);
}

// The key consists of a POE base and a key name. A league is optionally inserted if present and not empty.
function getLocalStorageKey(keyName, league) {
	if (league) {
		return "POEStashTab-" + league + "-" + keyName;
	} else {
		return "POECharacter-" + keyName;
	}
}

// Attempts to store the provided data at the given key. Does not block on failure.
function storeDataForKey(data, key) {
	try {
		localStorage.setItem(key, JSON.stringify(data)); // save
	} catch(e) {
		console.log("Failed to store data for key " + key + " in local storage due to exception ", e);
	}
}

// Load all PoE data stored in the local browser cache
function loadFromLocalStorage() {
	for (key in localStorage) {
		if (key.startsWith("POE")) {
			var itemsFromStore = JSON.parse(localStorage.getItem(key));
			if (itemsFromStore) {
				PoEData.ui.base.append("<div>" + key + "</div>");
				console.log("Loading from storage: " + key);
				receiveItemData(itemsFromStore);
			}
		}
	}

	PoEData.ui.base.css("display", "none");
	receiveStashDataFinished();
}

//*****************************************************************************
//Manual Preloading
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