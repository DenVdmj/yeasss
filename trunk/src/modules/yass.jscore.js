(function(ie) {
/*
* YASS 0.3.8 - The fastest CSS selectors JavaScript library
* js-core 2.7.0 - lightweight JavaScript framework
*
* Copyright (c) 2009 Nikolay Matsievsky aka sunnybear (webo.in),
* 2009 Dmitry Korobkin aka Octane (www.js-core.ru)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2009-01-26 00:07:00 +3000 (Thu, 22 Jan 2009) $
* $Rev: 1 $
*/
var core = _.core = function(arg) {
	if (this.core) return new this.core(arg);
	this.node = core.id(arg);
};
core.forEach = function(obj, func, context) {
	if (obj.length != undefined) {
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
	cache: _.c,
	clear: function(node) {
		_.c = {};
		return node;
	},
	id: function(arg) {
		return arg.nodeType ? arg : _.('#' + arg)[0];
	},
	tag: function() {
		return _(hash.tag || '*', hash.node);
	},
	create: function(arg) {
		return arg.nodeType ? arg : _.doc.createElement(arg);
	},
	insert: function(node, arg, before) {
		return node.insertBefore(this.create(arg), before);
	},
	sibling: function(node, dir, tag) {
		if (tag) tag = tag.toUpperCase();
		while (node = node[dir]) if (node.nodeType == 1 && (!tag || node.tagName === tag)) return node;
	},
	bind: function() {
		return _.win.addEventListener ? function(node, type, listener) {
			node.addEventListener(type, listener, false);
		} : function(expr) {
			return function(node, type, listener) {
				node.attachEvent('on' + type, expr.test(listener) ? this.context(listener, node) : listener);
			};
		}(/^function\s*\(/);
	}(),
	unbind: function() {
		return _.win.removeEventListener ? function(node, type, listener) {
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
	attr: function(hash) {
		if(hash.attr.length) {
			var array = [],
				idx = 0;
			this.forEach(_(hash.tag, hash.node), function(node) {
				var key = true;
				this.forEach(core.toArray(hash.attr), function(attr) {
					if(!node[attr]) return key = false;
				});
				if (key) array[idx++] = node;
			}, this);
			return array;
		}
		else if(hash.node) this.forEach(hash.attr, function(attr) {
			hash.node[attr] = hash.attr[attr];
		});
	},
	value: function(hash) {
		var array = [],
			idx = 0;
		this.forEach(_(hash.tag, hash.node), function(node) {
			var key = true;
			this.forEach(hash.attr, function(attr) {
				if(node[attr] !== hash.attr[attr]) return key = false;
			});
			if(key) array[idx++] = node;
		}, this);
		return array;		
	},
	child: function(node, tags) {
		var i = -1, list = node.childNodes, array = [],	idx = 0;
		if(tags) {
			if(tags.join) tags = tags.join(' ');
			tags = tags.toUpperCase();
		}
		while(list[++i]) if(list[i].nodeType == 1) if(tags ? this.inStr(tags, list[i].tagName) : true) array[idx++] = list[i];
		return array;
	},
	tags: function(hash) {
		if (hash.tag) {
			var array = [],
				idx = 0;
			this.forEach(this.toArray(hash.tag), function(tag) {
				this.forEach(_(tag, hash.node), function(node) {
					array[idx++] = node;
				});
			}, this);
			return array;
		}
		else return _('*', hash.node);
	},
	values: function(hash) {
		var str = hash.value.join ? hash.value.join(' ') : hash.value, array = [], idx = 0;
		this.forEach(this.attr({node: hash.node, tag: hash.tag, attr: hash.attr}), function(node) {
			var key = false;
			this.forEach(core.toArray(node[hash.attr]), function(value) {
				if(core.inStr(str, value)) return !(key = true);
			});
			if(key) array[idx++] = node;
		}, this);
		return array;
	},
	css: function() {
		return ie ? function(change) {
			return function(node, property) {
				return node.currentStyle[change(property)];
			};
		}(function(prop) {
			var expr = /-([a-z])/g;
			return prop === 'float' ? 'styleFloat' : expr.test(prop) ? prop.replace(expr, function () {
				return arguments[1].toUpperCase();
			}) : prop;
		}) : function(node, property) {
			return _.doc.defaultView.getComputedStyle(node, null).getPropertyValue(property);
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
	t: function(tag) {
		return new this.list(this.tags({tag: tag}), false);
	},
	n: function(tag) {
		return new this(_.doc.createElement(tag));
	},
	c: function(arg, tag) {
		return this.prototype.findClass(arg, tag);
	},
	a: function(arg, tag) {
		return this.prototype.find(arg, tag);
	},
	f: function(attr, value, tag) {
		return this.prototype.findAttr(attr, value, tag);
	},
	makeArray: function() {
		return ie ? function(list) {
			var array = [],
				idx = 0;
			this.forEach(list, function(el) {
				array[idx++] = el;
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
			var i = -1, j = 0, idx = 0;
			this.items = [];
			while(items[++i]) if(items[i].nodeType == 1 && (filter ? filter.call(items[i], j++) : true)) this.items[idx++] = items[i];
		}
	},
	timer: function(time, fn, arg) {
		if(this.timer) return new this.timer(time, fn, arg);
		core.extend(this, {time: time, fn: fn, arg: arg, enabled: false});
	},
	event: function(event) {
		event = event || _.win.event;
		if (this.event) return new this.event(event);
		this.object = event;
	},
	trim: function(str) {
		return this.trim.both(str);
	}
});
core.prototype = {
	child: function(tag, bool) {
		if(tag) return new core.list(typeof tag === 'boolean' ? core.tags({node: this.node}) : (bool ? core.tags({node: this.node, tag: tag}) : core.child(this.node, tag)), false);
		else return new core.list(core.child(this.node), false);
	},
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
			if(side === 'inside') {
				var nodes = _doc.createDocumentFragment();
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
		return null;
	},
	html: function(str) {
		if (str != undefined) {
			this.node.innerHTML = str;
			return this;
		}
		else return this.node.innerHTML;
	},
	text: function(str) {
		if(str != undefined) {
			this.empty().node.appendChild(_.doc.createTextNode(str));
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
		if(typeof def === 'boolean') this.useDefault(type, def);
		return this;
	},
	unbind: function(type, listener, def) {
		core.unbind(this.node, type, listener);
		if(typeof def === 'boolean') this.useDefault(type, def);
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
			var array = [],
				idx = 0;
			core.forEach(core.toArray(arg), function(attr) {
				array[idx++] = this[attr];
			}, this.node);
			return idx == 1 ? array[0] : array;
		}
		else {
			core.attr({node: this.node, attr: arg});
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
		return str != undefined ? this.attr({value: str}): this.attr('value');
	},
	find: function(arg, tag) {
		return new core.list(arg.join || arg.split ? core.attr({node: this.node, tag: tag, attr: arg}) : core.value({node: this.node, tag: tag, attr: arg}), false);
	},
	findAttr: function(attr, value, tag) {
		return new core.list(core.values({node: this.node, tag: tag, attr: attr, value: value}), false);
	},
	is: function(arg, tag) {
		if(arg) {
			if(!arg.join && !arg.split) {
				var key = false;
				core.forEach(arg, function(attr) {
					if(this[attr] != arg[attr]) return !(key = true);
				}, this.node);
				if(tag && !key) key = this.node.tagName !== tag.toUpperCase();
				return !key;
			}
			else return this.node.tagName === arg.toUpperCase();
		}
		else return this.exist();
	},
	findClass: function(arg, tag) {
		return new core.list(core.values({node: this.node, tag: tag, attr: 'className', value: arg}), false);
	},
	css: function(arg) {
		if(arg.join || arg.split) {
			var array = [],
				idx = 0;
			core.forEach(core.toArray(arg), function(prop) {
				array[idx++](core.css(this, prop));
			}, this.node);
			return idx == 1 ? array[0] : array;
		}
		else {
			core.attr({node: this.node.style, attr: arg});
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
		return this.css(['display']) !== 'none' && this.css(['visibility']) !== 'hidden';
	},
	toggle: function(type) {
		return this.visible() ? this.hide() : this.show(type);
	},
	opacity: function() {
		return ie ? function(level) {
			if(level != undefined) return this.css({filter: 'alpha(opacity=' + level * 100 + ')'});
			else if(this.node.filters.length) {
				var alpha = this.css('filter').match(/opacity\s*?=\s*?['"]?\s*?(\d+)/i);
				return alpha ? alpha[1] / 100 : 1;
			}
			else return 1;
		} : function(level) {
			return level != undefined ? this.css({opacity: level}) : this.css('opacity');
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
core.list.prototype = {
	item: function(i) {
		return new core(this.items[i]);
	},
	last: function() {
		return new core(this.items[this.items.length]);
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
	start: function() {
		if (!this.enabled) {
			var timer = this;
			this.interval = setInterval(function(){
				timer.fn.apply(timer, timer.arg || []);
			}, this.time);
			this.enabled = true;
		}
		return this;
	},
	stop: function() {
		clearInterval(this.interval);
		this.enabled = false;
		return this;
	},
	repeat: function(amount, fn, arg) {
		if(fn) core.extend(this, {callback: {fn: fn, arg: arg}});
		var timer = this;
		if(amount) setTimeout(function() {
			timer.fn.apply(timer, timer.arg || []);
			timer.repeat(--amount);
			if(!amount && timer.callback) timer.callback.fn.apply(timer, timer.callback.arg || []);
		}, this.time);
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
		}(_.doc.documentElement, _.doc.body) : function() {
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
core.ready = _.ready;
_.ready.exec = _.ready;
_.ready.check = function() {
	return _.isReady;
};
})(/*@cc_on ScriptEngineMinorVersion() @*/);