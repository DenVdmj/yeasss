(function(){
/*
* YASS 0.3.5 - The fastest CSS selectors JavaScript library
* JSX 1.1 - Multi-events and components loading library
*
* Copyright (c) 2008-2009 Nikolay Matsievsky aka sunnybear (webo.in),
* 2007-2009 Andrew Sumin (jsx.ru)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2008-01-13 15:38:05 +3000 (Tue, 13 Jan 2009) $
* $Rev: 316 $
*/
/**
 * Returns number of nodes or an empty array
 * @param {String} CSS selector
 * @param {DOM node} root to look into
 * @param {Boolean} disable cache of not
 */
var _ = function (selector, root, noCache) {
/*
Subtree added, second argument, thx to tenshi.
Return cache if exists. Third argument.
Return not cached result if root specified, thx to Skiv
*/
	if (_.cache[selector] && !noCache && !root) {
		return  _.cache[selector];
	}
/* clean root with document */
	root = root || _.doc;
/* sets of nodes, to handle comma-separated selectors */
	var sets = [];
/* quick return or generic call, missed ~ in attributes selector */
	if (/^[\w[:#.][\w\]*^|=!]*$/.test(selector)) {
/*
some simple cases - only ID or only CLASS for the very first occurence
- don't need additional checks. Switch works as a hash.
*/
		var firstLetter = selector.charAt(0);
		switch (firstLetter) {
			case '#':
				var id = selector.slice(1);
				sets = _.doc.getElementById(id);
/*
workaround with IE bug about returning element by name not by ID.
Solution completely changed, thx to deerua.
Get all matching elements with this id
*/
				if (_.doc.all && sets.id !== id) {
					sets = _.doc.all[id];
				}
				sets = sets ? [sets] : [];
				break;
			case '.':
				var klass = selector.slice(1),
					idx = 0;
				if (_.doc.getElementsByClassName) {
					sets = (idx = (sets = root.getElementsByClassName(klass)).length) ? sets : [];
				} else {
					klass = new RegExp('(^| +)' + klass + '($| +)');
					var nodes = root.getElementsByTagName('*'),
						i = 0,
						node;
					while (node = nodes[i++]) {
						if (klass.test(node.className)) {
							sets[idx++] = node;
						}

					}
					sets = idx ? sets : [];
				}
				break;
			case ':':
				var idx = 0,
					node,
					nodes = root.getElementsByTagName('*'),
					i = 0,
					ind = selector.replace(/[^(]*\(([^)]*)\)/,"$1"),
					modificator = selector.replace(/\(.*/,'');
				while (node = nodes[i++]) {
					if (_.modificators[modificator] && !_.modificators[modificator](node, ind)) {
						sets[idx++] = node;
					}
				}
				sets = idx ? sets : [];
				break;
			case '[':
				var idx = 0,
					nodes = root.getElementsByTagName('*'),
					node,
					i = 0,
					attrs = /\[([^!~^*|$ [:=]+)([$^*|]?=)?([^ :\]]+)?\]/.exec(selector),
					attr = attrs[1] === 'class' ? 'className' : attrs[1],
					eql = attrs[2] || '',
					value = attrs[3];
				while (node = nodes[i++]) {
/* check either attr is defined for given node or it's equal to given value */
					if (_.attr[eql] && _.attr[eql](node, attr, value)) {
						sets[idx++] = node;
					}
				}
				sets = idx ? sets : [];
				break;
			default:
				sets = (idx = (sets = root.getElementsByTagName(selector)).length) ? sets : [];
				break;
		}
	} else {
/*
all other cases. Apply querySelector if exists.
All methods are called via . not [] - thx to arty
*/
		if (_.doc.querySelectorAll) {
			sets = root.querySelectorAll(selector);
/* generic function for complicated selectors */
		} else {
/* number of groups to merge or not result arrays */
			var groups_length = 0,
/*
groups of selectors separated by commas.
Split by RegExp, thx to tenshi.
*/
				groups = selector.split(/ *, */),
				group;
/* loop in groups, maybe the fastest way */
			while (group = groups[groups_length++]) {
/*
Split selectors by space - to form single group tag-id-class,
or to get heredity operator. Replace + in child modificators
to % to avoid collisions. Additional replace is required for IE.
*/
				var singles = group.replace(/(\([^)]*)\+/,"$1%").replace(/(~|>|\+)/," $1 ").split(/ +/),
					singles_length = singles.length,
/* to handle RegExp for single selector */
					single,
					i = 0,
/* to remember ancestor call for next childs, default is " " */
					ancestor = ' ',
/*
current set of nodes - to handle single selectors -
is cleanded up with DOM root
*/
					nodes = [root];
/*
John's Resig fast replace works a bit slower than
simple exec. Thx to GreLI for 'greed' RegExp
*/
				while (single = singles[i++]) {
/* simple comparison is faster than hash */
					if (single !== ' ' && single !== '>' && single !== '~' && single !== '+' && nodes) {
						single = /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!~^*|$[:=]+)([!$^*|]?=)?([^:\]]+)?\])?(?:\:([^(]+)(?:\(([^)]+)\))?)?/.exec(single);
/* 
Get all required matches from exec:
tag, id, class, attribute, value, modificator, index.
*/
						var tag = single[1] || '*',
							id = single[2],
							klass = single[3] ? new RegExp('(^| +)' + single[3] + '($| +)') : '',
							attr = single[4] === 'class' ? 'className' : single[4],
							eql = single[5] || '',
							modificator = single[7],
/*
for nth-childs modificator already transformed into array.
Example used from Sizzle, rev. 2008-12-05, line 362.
*/
							ind = modificator === 'nth-child' || modificator === 'nth-last-child' ? /(?:(-?\d*)n)?(?:(%|-)(\d*))?/.exec(single[8] === 'even' && '2n' || single[8] === 'odd' && '2n%1' || !/\D/.test(single[8]) && '0n%' + single[8] || single[8]) : single[8],
/* new nodes array */
							newNodes = [],
/* cached length of new nodes array */
							idx = 0,
/* length of root nodes */
							J = 0,
							child,
/* if we need to mark node with expando yeasss */
							last = i === singles_length;
/* loop in all root nodes */
						while (child = nodes[J++]) {
/*
find all TAGs or just return all possible neibours.
Find correct 'children' for given node. They can be
direct childs, neighbours or something else.
*/
							switch (ancestor) {
								case ' ':
									var childs = child.getElementsByTagName(tag),
										item,
										h = 0;
									while (item = childs[h++]) {
/*
check them for ID or Class. Also check for expando 'yeasss'
to filter non-selected elements. Typeof 'string' not added -
if we get element with name="id" it won't be equal to given ID string.
Also check for given attributes selector.
Modificator is either not set in the selector, or just has been nulled
by modificator functions hash.
*/
										if ((!id || item.id === id) && (!klass || klass.test(item.className)) && (!attr || (_.attr[eql] && _.attr[eql](item, attr, single[6]))) && !item.yeasss && (!(_.modificators[modificator] ? _.modificators[modificator](item, ind) : modificator))) {
/* 
Need to define expando property to true for the last step.
Then mark selected element with expando
*/
											if (last) {
												item.yeasss = 1;
											}
											newNodes[idx++] = item;
										}
									}
									break;
/* from w3.org: "an F element preceded by an E element" */
								case '~':
									tag = tag.toLowerCase();
/* don't touch already selected elements */
									while ((child = child.nextSibling) && !child.yeasss) {
										if (child.nodeType === 1 && (tag === '*' || child.nodeName.toLowerCase() === tag) && (!id || child.id === id) && (!klass || klass.test(item.className)) && (!attr || (_.attr[eql] && _.attr[eql](child, attr, single[6]))) && !child.yeasss && (!(_.modificators[modificator] ? _.modificators[modificator](child, ind) : modificator))) {
											if (last) {
												child.yeasss = 1;
											}
											newNodes[idx++] = child;
										}
									}
									break;
/* from w3.org: "an F element immediately preceded by an E element" */
								case '+':
									while ((child = child.nextSibling) && child.nodeType !== 1) {}
									if (child && (child.nodeName.toLowerCase() === tag.toLowerCase() || tag === '*') && (!id || child.id === id) && (!klass || klass.test(item.className)) && (!attr || (_.attr[eql] && _.attr[eql](child, attr, single[6]))) && !child.yeasss && (!(_.modificators[modificator] ? _.modificators[modificator](child, ind) : modificator))) {
										if (last) {
											child.yeasss = 1;
										}
										newNodes[idx++] = child;
									}
									break;
/* from w3.org: "an F element child of an E element" */
								case '>':
									var childs = child.getElementsByTagName(tag),
										i = 0,
										item;
									while (item = childs[i++]) {
										if (item.parentNode === child && (!id || item.id === id) && (!klass || klass.test(item.className)) && (!attr || (_.attr[eql] && _.attr[eql](item, attr, single[6]))) && !item.yeasss && (!(_.modificators[modificator] ? _.modificators[modificator](item, ind) : modificator))) {
											if (last) {
												item.yeasss = 1;
											}
											newNodes[idx++] = item;
										}
									}
									break;
							}
						}
/* put selected nodes in local nodes' set */
						nodes = newNodes;
					} else {
/* switch ancestor ( , > , ~ , +) */
						ancestor = single;
					}
				}
/* inialize sets with nodes */
				sets = sets.length ? sets : nodes;
/* fixing bug on non-existent selector, thx to deerua */
				if (groups_length > 1) {
/* concat is faster than simple looping */
					sets = sets.concat(nodes);
				}
			}
/* define sets length to clean yeasss */
			var idx = (sets = sets || []).length;
/*
Need this looping as far as we also have expando 'yeasss'
that must be nulled. Need this only to generic case
*/
			while (idx--) {
				sets[idx].yeasss = sets[idx].nodeIndex = sets[idx].nodeIndexLast = null;
			}
		}
	}
/* return and cache results */
	return _.cache[selector] = sets;
};
/* cache for selected nodes, no leaks in IE detected */
_.cache = {};
/* caching global document */
_.doc = document;
/* caching global window */
_.win = window;
/* function calls for CSS2/3 attributes selectors */
_.attr = {
/* from w3.org "an E element with a "attr" attribute" */
	'': function (child, attr) {
		return !!child[attr];
	},
/*
from w3.org "an E element whose "attr" attribute value is
exactly equal to "value"
*/
	'=': function (child, attr, value) {
		return child[attr] && child[attr] === value;
	},
/*
from w3.prg "an E element whose "attr" attribute value is
a list of space-separated values, one of which is exactly
equal to "value"
*/
	'~=': function (child, attr, value) {
		return child[attr] && (new RegExp('(^| +)' + value + '($| +)').test(child[attr]));
	},
/*
from w3.prg "an E element whose "attr" attribute value
begins exactly with the string "value"
*/
	'^=': function (child, attr, value) {
		return child[attr] && !child[attr].indexOf(value);
	},
/*
from w3.org "an E element whose "attr" attribute value
ends exactly with the string "value"
*/
	'$=': function (child, attr, value) {
		return child[attr] && child[attr].indexOf(value) === child[attr].length - value.length;
	},
/*
from w3.org "an E element whose "attr" attribute value
contains the substring "value"
*/
	'*=': function (child, attr, value) {
		return child[attr] && child[attr].indexOf(value) !== -1;
	},
/*
from w3.org "an E element whose "attr" attribute has
a hyphen-separated list of values beginning (from the
left) with "value"
*/
	'|=': function (child, attr, value) {
		var i = child[attr];
		return i && (i === value || !!i.indexOf(value+'-'));
	},
/* attr doesn't contain given value */
	'!=': function (child, attr, value) {
		return !child[attr] || !(new RegExp('(^| +)' + value + '($| +)').test(child[attr]));
	}
};
/*
function calls for CSS2/3 modificatos. Specification taken from
http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
on success return negative result.
*/
_.modificators = {
/* from w3.org: "an E element, first child of its parent" */
	'first-child': function (child) {
/* implementation was taken from jQuery.1.2.6, line 1394 */
			return child.parentNode.getElementsByTagName('*')[0] !== child;
		},
/* from w3.org: "an E element, last child of its parent" */
	'last-child': function (child) {
			var brother = child;
/* loop in lastChilds while nodeType isn't element */
			while ((brother = brother.nextSibling) && brother.nodeType !== 1) {}
/* Check for node's existence */
			return !!brother;
		},
/* from w3.org: "an E element, root of the document" */
	'root': function (child) {
			return child.nodeName.toLowerCase() !== 'html';
		},
/* from w3.org: "an E element, the n-th child of its parent" */
	'nth-child': function (child, ind) {
		var i = child.nodeIndex || 0;
		ind[3] = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0;
/* check if we have already looked into siblings, using exando - very bad */
		if (i) {
			return !( (i + ind[3]) % ind[1]);
		} else {
/* in the other case just reverse logic for n and loop siblings */
			var brother = child.parentNode.firstChild;
			i++;
/* looping in child to find if nth expression is correct */
			do {
				if (brother.nodeType === 1) {
/* nodeIndex expando used from Peppy / Sizzle/ jQuery */
					if ((brother.nodeIndex = ++i) && child === brother && ((i + ind[3]) % ind[1])) {
						return 0;
					}
				}
			} while (brother = brother.nextSibling);
			return 1;
		}
	},
/*
from w3.org: "an E element, the n-th child of its parent,
counting from the last one"
*/
	'nth-last-child': function (child, ind) {
/* almost the same as the previous one */
		var i = child.nodeIndexLast || 0;
		ind[3] = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0;
		if (i) {
			return !( (i + ind[3]) % ind[1]);
		} else {
			var brother = child.parentNode.firstChild;
			i++;
			do {
				if (brother.nodeType === 1) {
					if ((brother.nodeIndex = i++) && child === brother && ((i + ind[3]) % ind[1])) {
						return 0;
					}
				}
			} while (brother = brother.nextSibling);
			return 1;
		}
	},
/*
Rrom w3.org: "an E element that has no children (including text nodes)".
Thx to John, from Sizzle, 2008-12-05, line 416
*/
	'empty': function (child) {
			return !!child.firstChild;
		},
/* thx to John, stolen from Sizzle, 2008-12-05, line 413 */
	'parent': function (child) {
			return !child.firstChild;
		},
/* from w3.org: "an E element, only child of its parent" */
	'only-child': function (child) {
			return child.parentNode.getElementsByTagName('*').length !== 1;
		},
/*
from w3.org: "a user interface element E which is checked
(for instance a radio-button or checkbox)"
*/
	'checked': function (child) {
			return !child.checked;
		},
/*
from w3.org: "an element of type E in language "fr"
(the document language specifies how language is determined)"
*/
	'lang': function (child, ind) {
			return child.lang !== ind && _.doc.getElementsByTagName('html')[0].lang !== ind;
		},
/* thx to John, from Sizzle, 2008-12-05, line 398 */
	'enabled': function (child) {
			return child.disabled || child.type === 'hidden';
		},
/* thx to John, from Sizzle, 2008-12-05, line 401 */
	'disabled': function (child) {
			return !child.disabled;
		},
/* thx to John, from Sizzle, 2008-12-05, line 407 */
	'selected': function(elem){
/*
Accessing this property makes selected-by-default
options in Safari work properly.
*/
      child.parentNode.selectedIndex;
      return !child.selected;
    }
};
/* to handle DOM ready event */
_.isReady = 0;
/* to execute functions on DOM ready event */
_.onloadList = [];
/* dual operator for onload functions stack */
_.ready = function (fn) {
/* with param works as setter */
	if (typeof fn === 'function') {
		if (!_.isReady) {
			_.onloadList.push(fn);
/* after DOM ready works as executer */
		} else {
			fn();
		}
/* w/o any param works as executer */
	} else {
		if (!_.isReady){
			var idx = _.onloadList.length;
			while (idx--) {
				_.onloadList[idx]();
			}
			_.isReady = 1;
		}
	}
};
/* general event adding function */
_.bind = function (element, event, fn) {
	if (typeof element === 'string') {
		var elements = _(element),
			idx = 0;
		while (element = elements[idx++]) {
			_.bind(element, event, fn);
		}
	} else {
		event = 'on' + event;
		var handler = element[event];
		if (handler) {
			element[event] = function(){
				handler();
				fn();
			};
		} else {
			element[event] = fn;
		}
	}
}
/* browser sniffing */
_.ua = navigator.userAgent.toLowerCase();
/* code for DOM ready and browsers detection taken from jQuery */
_.browser = {
	safari: _.ua.indexOf('webkit') !== -1,
	opera: _.ua.indexOf('opera') !== -1,
	ie: _.ua.indexOf('msie') !== -1 && _.ua.indexOf('opera') === -1,
	mozilla: _.ua.indexOf('mozilla') !== -1 && (_.ua.indexOf('compatible') + _.ua.indexOf('webkit') === -2)
};
/*
Mozilla, Opera (see further below for it) and webkit nightlies
currently support this event
*/
if (_.doc.addEventListener && !_.browser.opera) {
/* Use the handy event callback */
	_.doc.addEventListener("DOMContentLoaded", _.ready, false);
}
/*
If IE is used and is not in a frame
Continually check to see if the document is ready
*/
if (_.browser.ie && _.win == top) {
	(function(){
		if (_.isReady) {
			return;
		}
/*
If IE is used, use the trick by Diego Perini
http://javascript.nwbox.com/IEContentLoaded/
*/
		try {
			_.doc.documentElement.doScroll("left");
		} catch(e) {
			setTimeout(arguments.callee, 0);
			return;
		}
		_.ready();
	})();
}
if (_.browser.opera) {
	_.doc.addEventListener("DOMContentLoaded", function () {
			if (_.isReady) {
				return;
			}
			var i = 0,
				ss;
			while (ss = _doc.styleSheets[i++]) {
				if (ss.disabled) {
					setTimeout(arguments.callee, 0);
					return;
				}
			}
			_.ready();
		}, false);
}
if (_.browser.safari) {
	(function(){
		if (_.isReady) {
			return;
		}
		if ((_.doc.readyState !== "loaded" && _.doc.readyState !== "complete") || _.doc.styleSheets.length !== _("style, link[rel=stylesheet]").length) {
			setTimeout(arguments.callee, 0);
			return;
		}
		_.ready();
	})();
}
/* to support old browsers */
_.bind(_.win, 'load', _.ready);
/*
hash of YASS modules statuses -
0 (non loaded),
1 (loading),
2 (loaded)
*/
_.modules = {};
/* async loader of javascript modules, main ideas are taken from jsx */
_.load = function (aliases, text) {
	var loader = function (alias, text, tries) {
		if (!(tries%1000)) {
			_.modules[alias] = 0;
			if (!(tries -= 1000)) {
/* can't load module */
				_.modules[alias] = -1;
				return;
			}
		}
		switch (_.modules[alias]) {
/* module is already loaded, just execute onload */
			case 2:
					try {
/* try to eval onload handler */
						eval(text);
					} catch (a) {
					}				
				break;
/* module hasn't been loaded yet */
			default:
				var script = _('head')[0].appendChild(_.doc.createElement('script'));
				script.src = 'yeasss/src/yass.' + alias + '.js';
				script.type = 'text/javascript';
/* to handle script.onload event */
				script.text = text || '';
/* to fill hash of loaded scripts */
				script.title = alias;
/* script onload for IE */
				script.onreadystatechange = function() {
					if (this.readyState === 'loaded') {
						try {
/* try to eval onload handler */
							eval(this.innerHTML);
						} catch (a) {
							return;
						}
/* on success mark this module as loaded */
						_.modules[this.title] = 2;
					}
				}
				script.onload = function (e) {
						e = e.target;
						try {
/* try to eval onload handler */
							eval(e.innerHTML);
						} catch (a) {
							return;
						}
/* on success mark this module as loaded */
						_.modules[e.title] = 2;
				};
/* set module's status to loading */
				_.modules[alias] = 1;
/* module is loading, re-check in 100 ms */
			case 1:
				setTimeout(function () {
					loader(alias, text, tries--)
				}, 10);
				break;
		}
	},
		idx = 0,
		alias;
/* 
we can define several modules for 1 component:
yass-component-module1-module2-module3
*/
	aliases = aliases.replace(new RegExp('(.* )?'+_.base+'-( .*)?'),'').split("-");
	while (alias = aliases[idx++]) {
/* 21000 = 1000 * 11 reload attempts + 10 * 100 checks * 10 reload attempts */
		loader(alias, text, 21000);
	}
}
/* base className for yass modules */
_.base = 'yass-component';
/* initialization as a global var */
_.win.yass = _;
/* do not override existing window._ */
_.win._ = _.win._ || _.win.yass;
})();

/* autoload of components */
_.ready(function() {
	var components = _('[class^='+_.base+']'),
		item,
		len = components.length,
		idx = 0;
	while (idx < len) {
		item = components[idx++];
/* script filename should be equal to yass.[module name].js */
		_.load(item.className, item.title);
		item.title = null;
	}
});