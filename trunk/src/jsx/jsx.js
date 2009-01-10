/**
 * JSX 1.2 - Multi-events and components loading library
 * 
 * Copyright (c) 2007 Andrew Sumin (http://jsx.ru/),
 * 2009 Nikolay Matsievsky aka sunnybear (http://webo.in/)
 * 
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 */
 
(function () {
/**
 * Core object contains methods for dynamic loading of scripts.
 */

var jsx = {};
	
/**
 * Contains all global vars like base to core (this) file browser type and version...
 */
jsx.NULL  = function() { return null;         };
jsx.EMPTY = function() { /* return nothing */ };
/* user agent constants */
jsx.userAgent = navigator.userAgent.toLowerCase();
jsx.version = (jsx.userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1];
jsx.safari  = jsx.userAgent.indexOf('webkit') !== -1;
jsx.opera   = jsx.userAgent.indexOf('opera') !== -1;
jsx.msie    = jsx.userAgent.indexOf('msie') !== -1 && !jsx.opera;
jsx.mozilla = jsx.userAgent.indexOf('mozilla') !== -1 && !(jsx.safari || jsx.userAgent.indexOf('compatible') !== -1);
/* caching global vars */
jsx.doc = document;
jsx.win = window;

jsx.aliases = [];
jsx.expectedAliases = {};
jsx.charsets = [];
jsx.scriptsByFileName = [];
jsx.params = {};
jsx.base = 'yass';

    Array.prototype.indexOf = function (searchElement, fromIndex) {
        fromIndex = fromIndex || 0;
		var length = this.length;
        while (fromIndex++ < length) {
            if (this[fromIndex] === searchElement) {
                return fromIndex;
            }
        }
        return -1;
    }

    Array.prototype.lastIndexOf = function (searchElement, fromIndex) {
        var length = this.length;
        fromIndex += fromIndex = fromIndex || length - 1 < 0 ? length : 0;
		while (fromIndex--) {
            if (this[fromIndex] === searchElement) {
                return fromIndex;
            }
        }
        return -1;
    }

    Array.prototype.every = function (callback, thisObject) {
        thisObject = thisObject || jsx.win;
        var idx = this.length;
        while (idx--) {
            if (!callback.apply(thisObject, [this[idx], idx, this])) {
                break;
            }
        }
        return !idx;
    }

	Array.prototype.forEach = function (callback, thisObject) {
        thisObject = thisObject || jsx.win;
		var idx = this.length;
        while (idx--) {
            callback.apply(thisObject, [this[idx], idx, this]);
        }
    }

	Array.prototype.map = function (callback, thisObject) {
        thisObject = thisObject || jsx.win;
        var idx = this.length,
			map = [];
        while (idx--) {
            map[idx] = callback.apply(thisObject, [this[idx], idx, this]);
        }
        return map;
    }

	Array.prototype.some = function (callback, thisObject) {
        thisObject = thisObject || jsx.win;
        var idx = this.length;
        while (idx--) {
            if (callback.apply(thisObject, [this[idx], idx, this])) {
                break;
            }
        }
        return (index != length);
    }

    jsx.filter = function (arr, callback) {
        var length = arr.length,
			count = 0,
			filtered = [],
			idx = 0;
        while (idx < length) {
            if (callback(arr[idx++])) {
                filtered[count++] = arr[idx];
            }
        }
        return filtered;
    }
/* Unobtrusive loading */
jsx.getReadyState = function(){
  return jsx.doc.readyState || 'loading';
}
function setReadyState() {
    jsx.getReadyState = function(){return 'complete'};	
}
/* for Mozilla/Opera9+ */
if (jsx.doc.addEventListener) {
    jsx.doc.addEventListener("DOMContentLoaded", setReadyState, false);
}
/* for Safari */
if (jsx.webkit) {
    // sniff
    var _timer = setInterval(function() {
        if (/loaded|complete/.test(_.doc.readyState)) {
            setReadyState(); // call the onload handler
			clearInterval(_timer);
        }
    }, 10);
}

jsx.init = function(){
    jsx.getBaseAndSetAlias('yass', 'jsx.js', 'utf-8', function (){
        jsx.getScriptByFileName('jsx.js', function (script){
            if (jsx.params.base){
                jsx.base = jsx.params.base;
                jsx.Loader.require(['{jsx}.' + jsx.base + '.' + jsx.base], jsx.bind(jsx, jsx.initLocator));
            } else if (jsx.base){
                jsx.initLocator();
            }
      	});
    });
}

jsx.bind = function(object, executer){
    return function() {
        return executer.apply(object, arguments);
    }
}

/**
 * Returns path to file in src attribute
 * @param {String} file name
 * @method
 */
jsx.getBase = function(file, listener){
    jsx.getScriptByFileName(file, function (script){
        var src = script.src;
        listener(src.substring(0, src.indexOf(file)));
    });
};

/**
 * Returns tag "script" by file name or null if no such tag.
 * @param {String} file name
 * @param {Function} listener to call with founded file as parameter
 * @method
 */    
jsx.getScriptByFileName = function(file, listener, /* private */ tries){
    if (jsx.scriptsByFileName[file] = jsx.scriptsByFileName[file] || jsx.filter(_('script'), function (script){
    	return (script.src || '').indexOf(file) !== -1;
    })[0]){
		listener(jsx.scriptsByFileName[file]);
    } else {		
		if((tries = tries || 0) < 1000){
			setTimeout(function(){
				jsx.getScriptByFileName(file, listener, ++tries);
			}, 10);
		}
	}
}

/**
 * Sets the alias as path to file
 * @param {String} alias
 * @param {String} file name
 * @param {String} charset
 */
jsx.getBaseAndSetAlias = function(alias, file, charset, listener){
    jsx.getBase(file, jsx.bind(jsx, function (base){
        jsx.setAliasCharset(alias, charset || null);
        jsx.setAlias(alias, base);
        if (typeof listener === 'function'){
            listener();
        }
    }));
};
/**
 * Sets the alias
 * @param {String} path
 * @param {String} alias
 * @method
 */
jsx.setAlias = function(name, value){
    jsx.aliases[name] = value;
    if (!jsx.expectedAliases[name]){
        return;
    }
    // maybe some scripts are waiting for this alias        
    var listener,
		idx = 0;
    while (listener = jsx.expectedAliases[name][idx++]){
        listener();
    }
};
/**
 * Sets the charset for scripts with such alias
 * @param {String} alias
 * @param {String} charset
 * @method
 */
jsx.setAliasCharset = function(alias, charset){
    jsx.charsets[alias] = charset;
};
/**
 * Returns the alias
 * @param {String} location
 * @method
 */
jsx.getAlias = function(location){
    return location = /^\{[^}]+\}/.exec(location) ? location[0].substr(1, location[0].length - 2) : null;
};

jsx.getScriptParams = function(script){
	return !script.onload ? null : script.onload() ? script.onload() : eval('(' + script.onload.replace(/return/, '') + ')');
}

/**
 * Creates tag script.
 * @alias jsx.Scripts
 */
jsx.Scripts = function (){
    /**
     * This method creates tag SCRIPT.
     * @param {Object} Attrbites
     * @param {Function} Listerner for script creation.
     */
    jsx.createScript = function (attributes, listener, /*private*/ tries){
		var script = jsx.doc.createElement('script'),
			head = _('head')[0];
        script.type = 'text/javascript';
        for (var i in attributes) {
            script[i] = attributes[i];
        }
        // InsertBefore for IE.
        // If head is not closed and use appendChild IE crashes.
        head.insertBefore(script, head.firstChild);
		listener = typeof listener === 'function' ? listener : jsx.NULL;
        if (!script && (tries = tries || 0) < 10) {
            setTimeout(jsx.bind(jsx, jsx.createScript, attributes, listener, ++tries), 10);
        } else {
            listener(script);
        }
    };
};

/**
 * Creates tag link.
 * @alias jsx.Links
 */
jsx.Links = function (){
    /**
     * This method creates tag LINK.
     * @param {Object} Attrbites
     */
    jsx.createLink = function (attributes){
        var link = jsx.doc.createElement('link'),
			head = _('head')[0];
        attributes.rel = attributes.rel || 'stylesheet';
        attributes.type = attributes.type || 'text/css';
        for (var i in attributes) {
            link[i] = attributes[i];
        }
        // InsertBefore for IE.
        // If head is not closed and use appendChild IE crashes.
        head.insertBefore(link, head.firstChild);
    };
};

/**
 * Creates real URL from strings.
 * @param {String} String like "foo.bar"
 * @param {String} File extention like "js"
 * @return {String} URL like http://www.yandex.ru/foo/bar.js
 */
jsx.ConstructURL = function(string, type){
	return (string.match(/^https?\:\/\//i) || '') + string.replace(/\./g, '/').replace(/\{[^}]+\}/ig, function (match){
		return jsx.aliases[match.substr(1, match.length - 2)];
	}).replace(/^https?\:\/\//i, '').replace(/\/\//ig, '/') + '.' + (type || 'js');
};

/**
 * Alias locator. Contains information about files with aliases.
 */
jsx.Locator = new function(){
    this.aliases = [];
    this.get = function(alias){
        return this.aliases[alias] || null;
    };
    this.set = function(name, alias){
        this.aliases[name] = alias;
        if(jsx.expectedAliases[name]){
            this.load(name);
        }
    };
    this.load = function(alias){
        if (!this.get(alias) || this.get(alias).called){
            return;
        }
        this.get(alias).called = true;
        jsx.Scripts.createScript({'src': this.get(alias).src, 'charset': this.get(alias).charset});
    };
};

/**
 * Dynamically loads scripts.
 */
jsx.Loader = function() {
    this.scripts = {};

    /**
     * This method loads script and executes listener after script loading.
     * @param {String} String like "foo.bar". This string means to load file bar.js from framework folder subfolder foo.
     * @param {Function} Function for execution after loading script.
     */
    this.require = function(urls, listener){
        urls = typeof urls === 'string' ? [urls] : urls;
        this.requireList(urls, listener);
    };

    /**
     * This method is for scripts that are loaded. They must execute this method (jsx.loaded) after all initialization functions.
     * @param {String} String like "foo.bar". This string means to load file bar.js from framework folder subfolder foo.
     */
    this.loaded = function(url){
        if (!jsx.getAlias(url)){
            url = '{jsx}.' + url;
        }
        if (!this.scripts[url]){
            this.scripts[url] = function (){
				return { listeners: [jsx.NULL], ready: false }
			};
        }
        var listener,
			idx = 0;
        while (listener = this.scripts[url].listeners[idx++]){
            listener();
        }
        this.scripts[url].ready = true;
    };

    this.requireList = function(urls, listener){
        var length = urls.length;
        // when JS file will be loaded listWatch will be called
        function listWatch() {
            // increase files counter
            length--;
            // exec listener if all loaded
            if (!length){
                (listener || jsx.EMPTY)();
            }
        }
        urls.forEach(jsx.bind(this, this._require, listWatch));
    };

    this._require = function (listener, url){
        var alias = jsx.getAlias(url);
        if (!alias){
            url = '{jsx}.' + url;
            alias = 'jsx';
        }
        if (jsx.aliases[alias]){
            // if alas is defined start load
			if (this.scripts[url]) {
				if (this.scripts[url].ready) {
					(listener || jsx.EMPTY)();
				} else {
					this.scripts[url].listeners.push(listener);
				}
			} else {
				this.scripts[url] = this.createScriptFake(listener);
				jsx.Scripts.createScript({'src': jsx.ConstructURL(url), 'charset': jsx.charsets[alias]});
			}
        } else {
            // another way may be it will appear later
			jsx.expectedAliases[alias] = jsx.expectedAliases[alias] || [];
			jsx.expectedAliases[alias].push(jsx.bind(this, this._require, listener, url));
			jsx.Locator.load(alias);
        }
    };
};

jsx.initLocator = function(){
    jsx.Locator.set('jsxComponents', {
        src: jsx.ConstructURL('{jsx}.jsxComponents.jsxComponents'),
        charset: 'utf-8',
        called: false
    });  
    jsx.Locator.set('jsxAjax', {
        src: jsx.ConstructURL('{jsx}.jsxAjax.jsxAjax'),
        charset: 'utf-8',
        called: false
    });
    if (!jsx.params.autoinit){
        return;
    }
    if (jsx.getReadyState() === 'complete'){
        jsx.Loader.require('Components', function(){jsx.Components.init()});
        return;
    }    
    function observe(element, name, observer, useCapture) {
        if (element.addEventListener) {
            element.addEventListener(name, observer, useCapture);
        } else if (element.attachEvent) {
            element.attachEvent('on' + name, observer);
        }
    }
    observe(jsx.win, 'load', function () {
        jsx.Loader.require('Components', function(){jsx.Components.init()});
    });
};

_.jsx = jsx;
})();

_.jsx.init();