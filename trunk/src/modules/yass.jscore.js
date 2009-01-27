(function(ie) {
/*
* YASS 0.3.8 - The fastest CSS selectors JavaScript library
* js-core 2.7.2 - lightweight JavaScript framework
* js-core-ajax 2.5.0 - ajax module for js-core
*
* Copyright (c) 2009 Nikolay Matsievsky aka sunnybear (webo.in),
* 2009 Dmitry Korobkin aka Octane (www.js-core.ru)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2009-01-27 22:25:02 +3000 (Tue, 27 Jan 2009) $
* $Rev: 3 $
*/
(function(win, doc, core, ie, undefined) {
core.forEach = function(obj, func, context) {
	if(obj.length !== undefined) {
		var i = -1;
		while(obj[++i]) if(func.call(context, obj[i], i, obj) === false) break;
	}
	else for(var key in obj) if(obj.hasOwnProperty(key)) if(func.call(context, key, obj[key], obj) === false) break;
	return obj;
};
core.extend = function(obj, hash) {
	this.forEach(hash, function(key, value) {
		obj[key] = value;
	});
	return obj;
};
core.extend(core, {
	ie: ie,
	cache: {},
	clear: function(node) {
		node.hasChildNodes() ? this.cache = {} : delete this.cache[node.id];
		return node;
	},
	id: function(arg) {
		return arg.split ? this.cache[arg] || (this.cache[arg] = doc.getElementById(arg)) : arg;
	},
	create: function(arg) {
		return arg.nodeType ? arg : doc.createElement(arg);
	},
	insert: function(node, arg, before) {
		return node.insertBefore(this.create(arg), before);
	},
	sibling: function(node, dir, tag) {
		if(tag) tag = tag.toUpperCase();
		while(node = node[dir]) if(node.nodeType == 1 && (tag ? node.tagName == tag : true)) return node;
	},
	bind: function() {
		return win.addEventListener ? function(node, type, listener) {
			node.addEventListener(type, listener, false);
		} : function(expr) {
			return function(node, type, listener) {
				node.attachEvent('on' + type, expr.test(listener) ? this.context(listener, node) : listener);
			};
		}(/^function\s*\(/);
	}(),
	unbind: function() {
		return win.removeEventListener ? function(node, type, listener) {
			node.removeEventListener(type, listener, false);
		} : function(node, type, listener) {
			node.detachEvent('on' + type, listener);
		};
	}(),
	inStr: function(str, search) {
		return str.search('\\b' +  search + '\\b') + 1;
	},
	toArray: function(arg) {
		return arg.split ? this.trim.all(arg).split(/\s+/) : arg;
	},
	attr: function(node, params) {
		this.forEach(params, function(key, value) {
			node[key] = value;
		});
	},
	css: function() {
		return ie ? function(change) {
			return function(node, property) {
				return node.currentStyle[change(property)];
			};
		}(function(prop) {
			var expr = /-([a-z])/g;
			return prop == 'float' ? 'styleFloat' : expr.test(prop) ? prop.replace(expr, function () {
				return arguments[1].toUpperCase();
			}) : prop;
		}) : function(node, property) {
			return doc.defaultView.getComputedStyle(node, null).getPropertyValue(property);
		};
	}(),
	context: function(fn, context) {
		return function _fn() {
			return fn.call(context, arguments[0]);
		};
	},
	preventDefault: function _fn() {
		new core.event(arguments[0]).preventDefault();
	},
	n: function(tag) {
		return new this(doc.createElement(tag));
	},
	makeArray: function() {
		return ie ? function(list) {
			var array = [], i = 0;
			this.forEach(list, function(el) {
				array[i++] = el;
			});
			return array;
		} : function(list) {
			return Array.prototype.slice.call(list);
		};
	}(),
	list: function(items, filter) {
		if(this.list) return new this.list(items, filter);
		if(filter === false) this.items = items || [];
		else {
			var i = j = k = -1;
			this.items = [];
			while(items[++i]) if(items[i].nodeType == 1 && (filter ? filter.call(items[i], ++j) : true)) this.items[++k] = items[i];
		}
	},
	timer: function(time, fn, context) {
		if(this.timer) return new this.timer(time, fn, context);
		core.extend(this, {time: time, fn: fn, context: context, enabled: false});
	},
	event: function(event) {
		event = event || win.event;
		if(this.event) return new this.event(event);
		this.object = event;
	},
	trim: function(str) {
		return this.trim.both(str);
	}
});
core.prototype = {
	parent: function() {
		return new core(this.node.parentNode);
	},
	append: function(arg) {
		return new core(this.node.appendChild(core.create(arg)));
	},
	prepend: function(arg) {
		return new core(core.insert(this.node, arg, this.node.firstChild));
	},
	after: function(arg) {
		return new core(core.insert(this.node.parentNode, arg, this.node.nextSibling));
	},
	before: function(arg) {
		return new core(core.insert(this.node.parentNode, arg, this.node));
	},
	appendTo: function(arg) {
		(arg = new core(arg)).node.appendChild(this.node);
		return arg;
	},
	prependTo: function(arg) {
		core.insert((arg = new core(arg)).node, this.node, arg.node.firstChild);
		return arg;
	},
	insertAfter: function(arg) {
		var node = core.id(arg);
		return new core(core.insert(node.parentNode, this.node, node.nextSibling));
	},
	insertBefore: function(arg) {
		var node = core.id(arg);
		return new core(core.insert(node.parentNode, this.node, node));
	},
	next: function(tag) {
		return new core(core.sibling(this.node, 'nextSibling', tag));
	},
	prev: function(tag) {
		return new core(core.sibling(this.node, 'previousSibling', tag));
	},
	clone: function(bool) {
		return new core(this.node.cloneNode(bool !== false));
	},
	replace: function(arg) {
		try {
			return this.before(core.create(arg));
		}
		catch(e) {}
		finally {
			this.remove();
		}
	},
	wrap: function() {
		return ie ? function(arg, side) {
			return new core(this.node.applyElement(core.create(arg), side));
		} : function(arg, side) {
			if(side == 'inside') {
				var nodes = doc.createDocumentFragment();
				core.forEach(core.makeArray(this.node.childNodes), function(node) {
					nodes.appendChild(node);
				});
				return new core(nodes).appendTo(this.append(arg).node);
			}
			else return this.appendTo(this.before(arg).node);
		};
	}(),
	el: function(arg) {
		return arg ? this.replace(core.id(arg)) : this.node;
	},
	empty: function() {
		core.clear(this.node);
		while(this.node.firstChild) this.node.removeChild(this.node.firstChild);
		return this;
	},
	remove: function() {
		core.clear(this.node).parentNode.removeChild(this.node);
		return this;
	},
	html: function(str) {
		if(str !== undefined) {
			this.node.innerHTML = str;
			return this;
		}
		else return this.node.innerHTML;
	},
	text: function(str) {
		if(str !== undefined) {
			this.empty().node.appendChild(doc.createTextNode(str));
			return this;
		}
		else return this.node.innerText || this.node.textContent;
	},
	useDefault: function(prefix) {
		return function(type, def) {
			if(def) {
				this.node[prefix + type] = false;
				core.unbind(this.node, type, core.preventDefault);
			}
			else if(!this.node[prefix + type]) {
				this.node[prefix + type] = true;
				core.bind(this.node, type, core.preventDefault);
			}
			return this;
		};
	}('preventDefaultOn'),
	bind: function(type, listener, def) {
		core.bind(this.node, type, listener);
		if(def !== undefined) this.useDefault(type, def);
		return this;
	},
	unbind: function(type, listener, def) {
		core.unbind(this.node, type, listener);
		if(def !== undefined) this.useDefault(type, def);
		return this;
	},
	exist: function(exist, die) {
		if(exist && this.node) exist.call(this.node);
		else if(die && !this.node) die();
		return !!this.node;
	},
	hasClass: function(arg) {
		if(arg) {
			var className = this.node.className, key = false;
			core.forEach(core.toArray(arg), function(str) {
				if(!core.inStr(className, str)) return !(key = true);
			});
			return !key;
		}
		else return !!this.node.className;
	},
	addClass: function(arg) {
		var className = this.node.className, modified = false;
		core.forEach(core.toArray(arg), function(str) {
			if(!core.inStr(className, str)) {
				className += ' ' + str;
				modified = true;
			}
		});
		if(modified) this.node.className = className;
		return this;
	},
	removeClass: function(arg) {
		if(arg) {
			var className = this.node.className, modified = false;
			className = className.replace(new RegExp('\\b' + core.toArray(arg).join('|') + '\\b', 'g'), function() {
				modified = true;
				return '';
			});
			if(modified) this.node.className = className;
		}
		else this.node.className = '';
		return this;
	},
	toggleClass: function(arg1, arg2) {
		if(arg2) {
			var className = this.node.className, modified = false;
			arg2 = core.toArray(arg2);
			core.forEach(core.toArray(arg1), function(str, i) {
				className = className.replace(new RegExp('\\b' + str + '\\b'), function() {
					modified = true;
					return arg2[i];
				});
			});
			if(modified) this.node.className = className;
		}
		else if(arg1) core.forEach(core.toArray(arg1), function(str) {
			this.hasClass(str) ? this.removeClass(str) : this.addClass(str);
		}, this);
		return this;
	},
	attr: function(arg) {
		if(arg.join || arg.split) {
			var array = [], i = 0;
			core.forEach(core.toArray(arg), function(attr) {
				array[i++] = this[attr];
			}, this.node);
			return array.length == 1 ? array[0] : array;
		}
		else {
			core.attr(this.node, arg);
			return this;
		}
	},
	removeAttr: function(arg) {
		core.forEach(core.toArray(arg), function(attr) {
			this[attr] = null;
		}, this.node);
		return this;
	},
	val: function(str) {
		return str !== undefined ? this.attr({value: str}): this.attr('value');
	},
	is: function(arg, tag) {
		if(arg) {
			if(!arg.join && !arg.split) {
				var key = false;
				core.forEach(arg, function(attr) {
					if(this[attr] != arg[attr]) return !(key = true);
				}, this.node);
				if(tag && !key) key = this.node.tagName != tag.toUpperCase();
				return !key;
			}
			else return this.node.tagName == arg.toUpperCase();
		}
		else return this.exist();
	},
	css: function(arg) {
		if(arg.join || arg.split) {
			var array = [], i = 0;
			core.forEach(core.toArray(arg), function(prop) {
				array[i++] = core.css(this, prop);
			}, this.node);
			return array.length == 1 ? array[0] : array;
		}
		else {
			core.attr(this.node.style, arg);
			return this;
		}		
	},
	hide: function() {
		return this.css({display: 'none', visibility: 'hidden'});
	},
	show: function(type) {
		return this.css({display: type || 'block', visibility: 'visible'});
	},
	visible: function() {
		return this.css(['display']) != 'none' && this.css(['visibility']) != 'hidden';
	},
	toggle: function(type) {
		return this.visible() ? this.hide() : this.show(type);
	},
	opacity: function() {
		return ie ? function(level) {
			if(level !== undefined) return this.css({filter: 'alpha(opacity=' + level * 100 + ')'});
			else if(this.node.filters.length) {
				var alpha = this.css('filter').match(/opacity\s*=\s*['"]?\s*(\d+)/i);
				return alpha ? alpha[1] / 100 : 1;
			}
			else return 1;
		} : function(level) {
			return level !== undefined ? this.css({opacity: level}) : this.css('opacity');
		};
	}(),
	enabled: function(bool) {
		return typeof bool == 'boolean' ? (bool ? this.removeAttr(['disabled']) : this.attr({disabled: 'disabled'})) : !this.attr(['disabled']);
	},
	id: function(str) {
		if(str) {
			delete core.cache[this.node.id];
			this.node.id = str;
			return this;
		}
		else return this.node.id;
	},
	serialize: function() {
		return this.node.outerHTML || new XMLSerializer().serializeToString(this.node);
	}
};
core.forEach('resize,scroll,blur,focus,error,load,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,keydown,keypress,keyup,change,select,submit,reset'.split(','), function(listener) {
	return function(type) {
		core.prototype[type] = function(arg) {
			return arg ? this.bind(type, arg.call ? arg : listener(arg, Array.prototype.slice.call(arguments, 1))) : this.node[type]();
		};
	};
}(function(method, args) {
	return function(obj) {
		(obj = $(this))[method][args ? 'apply' : 'call'](obj, args);
	};
}));
core.list.prototype = {
	item: function(i) {
		return new core(this.items[i]);
	},
	last: function(length) {
		return new core(this.items[this.items.length - 1] || false);
	},
	filter: function(filter) {
		if(arguments[0].call) return new core.list(this.items, filter);
		else {
			var obj, method = arguments[0], args = Array.prototype.slice.call(arguments, 1);
			return new core.list(this.items, function() {
				return (obj = new core(this))[method].apply(obj, args);
			});
		}
	},
	size: function() {
		return this.items.length;
	},
	each: function() {
		if(arguments[0].call) {
			var i = -1;
			while(this.items[++i]) if(arguments[0].call(this.items[i], i, this.items) === false) break;
			return this;
		}
		else {
			var obj, method = arguments[0], args = Array.prototype.slice.call(arguments, 1);
			return this.each(function() {
				(obj = new core(this))[method].apply(obj, args);
			});
		}
	}
};
core.timer.prototype = {
	start: function(timer) {
		if(!this.enabled) {
			(timer = this).enabled = true;
			(function() {
				timer.fn.call(timer.context, timer);
				if(timer.enabled) setTimeout(arguments.callee, timer.time);
			})();
		}
		return this;
	},
	stop: function() {
		this.enabled = false;
		return this;
	},
	repeat: function(amount, callback, context, timer) {
		if(!this.enabled) {
			(timer = this).enabled = true;
			(function() {
				timer.fn.call(timer.context, timer);
				if(timer.enabled && --amount) setTimeout(arguments.callee, timer.time);
				else {
					timer.enabled = false;
					if(callback) callback.call(context, timer);
				}
			})();
		}
		return this;
	}
};
core.event.prototype = {
	preventDefault: function() {
		return ie ? function() {
			this.object.returnValue = false;
			return this;
		} : function() {
			this.object.preventDefault();
			return this;
		};
	}(),
	stopPropagation: function() {
		return ie ? function() {
			this.object.cancelBubble = true;
			return this;
		} : function() {
			this.object.stopPropagation();
			return this;
		};
	}(),
	stop: function() {
		return this.preventDefault().stopPropagation();
	},
	target: function(target) {
		return function() {
			return this.object[target];
		};
	}(ie ? 'srcElement' : 'target'),
	mouseButton: function() {
		var attr = ie ? 'button' : 'which', middle = ie ? 4 : 2;
		return function() {
			return this.object[attr] < 2 ? 'left' : this.object[attr] == middle ? 'middle' : 'right';
		};
	}(),
	mousePosition: function() {
		return ie ? function(doc, body) {
			return function() {
				return {x: this.object.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0), y: this.object.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0)};
			};
		}(doc.documentElement, doc.body) : function() {
			return {x: this.object.pageX, y: this.object.pageY};
		}
	}(),
	key: function() {
		return ie ? function() {
			return this.object.keyCode;
		} : function() {
			return this.object.keyCode || this.object.which;
		};
	}()
};
core.extend(core.trim, {
	left: function(str) {
		return str.replace(/^\s+/, '');
	},
	right: function(str) {
		return str.replace(/\s+$/, '');
	},
	spaces: function(str) {
		return str.replace(/\s{2,}/g, ' ');
	},
	both: function(str) {
		return this.right(this.left(str));
	},
	all: function(str) {
		return this.both(this.spaces(str));
	}
});
/**
 * AJAX module for “js-core”, version 0.2.5
 * warning: do not use timeout for more then 2 XHR at one time!
 */
core.ajax = function() {
	if(this.ajax) return new this.ajax();
	this.xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
};
core.ajax.type = {
	html: 'text/html',
	text: 'text/plain',
	xml: 'application/xml, text/xml',
	json: 'application/json, text/javascript',
	script: 'text/javascript, application/javascript',
	'default': 'application/x-www-form-urlencoded'
};
core.ajax.accept = '*\/*';
core.ajax.prototype.open = function(params) {
	core.extend(this, {
		method: params.method || 'GET',
		url: params.url || location.href,
		async: params.async !== false,
		user: params.user || null,
		password: params.password || null,
		params: params.params || null,
		processData: params.processData === true,
		timeout: params.timeout || 0,
		contentType: core.ajax.type[params.contentType] || core.ajax.type['default'],
		dataType: core.ajax.type[params.dataType] ? core.ajax.type[params.dataType] + ', *\/*' : core.ajax.accept,
		requestHeaders: params.requestHeaders || null,
		success: params.success,
		error: params.error
	});
	if(this.params) {
		var params = [], process = this.process;
		core.forEach(this.params, function(key, value) {
			params.push([key, '=', process ? encodeURIComponent(value) : value].join(''));
		});
		this.params = params.join('&');
	}
	try {
		this.xhr.open(this.method, this.method == 'GET' && this.params ? this.url + '?' + this.params : this.url, this.async, this.user, this.password);
		this.xhr.setRequestHeader('Accept', this.dataType);
		this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		this.xhr.setRequestHeader('Content-Type', this.contentType);
		var ajax = this;
		if(this.requestHeaders) core.forEach(this.requestHeaders, function(key, value) {
			ajax.xhr.setRequestHeader(key, value);
		});
		this.xhr.onreadystatechange = function() {
			if(ajax.xhr.readyState == 4) {
				if(ajax.xhr.status == 200 || ajax.xhr.status == 0 && ajax.success) ajax.success(ajax.xhr.responseText);
				else if(ajax.error && !ajax.aborted) ajax.error(ajax.xhr.statusText);
			}
		};
		this.xhr.send(this.params);;
		if(this.async && this.timeout) setTimeout(function() {
			if(ajax.xhr.readyState != 4) {
				ajax.aborted = true;
				ajax.xhr.abort();
				if(ajax.error) ajax.error('Time is out');
			}
		}, this.timeout);
	}
	catch(error) {
		if(this.error) this.error(error);
	}
};
core.get = function(params, success, error) {
	new core.ajax().open(core.extend(params, {success: success, error: error}));
	return this;
};
core.post = function(params, success, error) {
	new core.ajax().open(core.extend(params, {method: 'POST', success: success, error: error}));
	return this;
};
core.getJSON = function(params, callback, error) {
	new core.ajax().open(core.extend(params, {dataType: 'json', success: function(response) {
		try {
			callback(eval('(' + response + ')'));
		}
		catch(error) {
			if(this.error) this.error(error);
		}
	}, error: error}));
	return this;
};
core.prototype.load = function(params, success, error) {
	var _this = this;
	new core.ajax().open(core.extend(params, {success: function(response) {
		_this.html(response);
		if(success) success.call(_this.node, response, this.xhr);
	}, error: function(response) {
		if(error) error.call(_this.node, response, this.xhr);
	}}));
	return this;
};
win.core = win.$ ? core : (win.$ = core);
})(window, document, function(arg) {
	if(this.core) return new this.core(arg);
	this.node = core.id(arg);
} /*@cc_on , ScriptEngineMinorVersion() @*/);

/**
 * Integration
 */
var $$ = core.query = function(selector, root, noCache) {
	return new core.list(_(selector, root, noCache), false);
};
core.prototype.query = function(selector, noCache) {
	return new core.list(_(selector, this.node, noCache), false);
};
core.browser = _.browser;
core.ready = _.ready;
core.load = _.load;