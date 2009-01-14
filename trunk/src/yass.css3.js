(function(){
/*
* YASS 0.3.4 - The fastest CSS selectors JavaScript library
* Experimental branch of YASS - CSS3 selectors with cache only
*
* Copyright (c) 2008 Nikolay Matsievsky aka sunnybear (webo.in, webo.name)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2008-01-14 23:00:06 +3000 (Wed, 14 Jan 2009) $
* $Rev: 7 $
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
					attr = attrs[1],
					eql = attrs[2] || '',
					value = attrs[3];
				while (node = nodes[i++]) {
/* check either attr is defined for given node or it's equal to given value */
					if (_.attr[eql] && (_.attr[eql](node, attr, value) || (attr === 'class' && _.attr[eql](node, 'className', value)))) {
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
		if (_.doc.querySelectorAll && selector.indexOf('!=') === -1) {
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
Replace ~ in attributes to & to avoid collisions.
*/
				var singles = group.replace(/(\([^)]*)\+/,"$1%").replace(/(\[[^\]]+)~/,"$1&").replace(/(~|>|\+)/," $1 ").split(/ +/),
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
						single = /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!&^*|$[:=]+)([!$^*|&]?=)?([^:\]]+)?\])?(?:\:([^(]+)(?:\(([^)]+)\))?)?/.exec(single);
/* 
Get all required matches from exec:
tag, id, class, attribute, value, modificator, index.
*/
						var tag = single[1] || '*',
							id = single[2],
							klass = single[3] ? new RegExp('(^| +)' + single[3] + '($| +)') : '',
							attr = single[4],
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
										if ((!id || item.id === id) && (!klass || klass.test(item.className)) && (!attr || (_.attr[eql] && (_.attr[eql](item, attr, single[6]) || (attr === 'class' && _.attr[eql](item, 'className', single[6]))))) && !item.yeasss && !(_.modificators[modificator] ? _.modificators[modificator](item, ind) : modificator)) {
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
										if (child.nodeType === 1 && (tag === '*' || child.nodeName.toLowerCase() === tag) && (!id || child.id === id) && (!klass || klass.test(item.className)) && (!attr || (_.attr[eql] && (_.attr[eql](item, attr, single[6]) || (attr === 'class' && _.attr[eql](item, 'className', single[6]))))) && !child.yeasss && !(_.modificators[modificator] ? _.modificators[modificator](child, ind) : modificator)) {
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
									if (child && (child.nodeName.toLowerCase() === tag.toLowerCase() || tag === '*') && (!id || child.id === id) && (!klass || klass.test(item.className)) && (!attr || (_.attr[eql] && (_.attr[eql](item, attr, single[6]) || (attr === 'class' && _.attr[eql](item, 'className', single[6]))))) && !child.yeasss && !(_.modificators[modificator] ? _.modificators[modificator](child, ind) : modificator)) {
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
										if (item.parentNode === child && (!id || item.id === id) && (!klass || klass.test(item.className)) && (!attr || (_.attr[eql] && (_.attr[eql](item, attr, single[6]) || (attr === 'class' && _.attr[eql](item, 'className', single[6]))))) && !item.yeasss && !(_.modificators[modificator] ? _.modificators[modificator](item, ind) : modificator)) {
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
/* function calls for CSS2/3 attributes selectors */
_.attr = {
/* from w3.org "an E element with a "attr" attribute" */
	'': function (child, attr) {
		return !!child.getAttribute(attr);
	},
/*
from w3.org "an E element whose "attr" attribute value is
exactly equal to "value"
*/
	'=': function (child, attr, value) {
		return (attr = child.getAttribute(attr)) && attr === value;
	},
/*
from w3.prg "an E element whose "attr" attribute value is
a list of space-separated values, one of which is exactly
equal to "value"
*/
	'&=': function (child, attr, value) {
		return (attr = child.getAttribute(attr)) && (new RegExp('(^| +)' + value + '($| +)').test(attr));
	},
/*
from w3.prg "an E element whose "attr" attribute value
begins exactly with the string "value"
*/
	'^=': function (child, attr, value) {
		return (attr = child.getAttribute(attr)) && !attr.indexOf(value);
	},
/*
from w3.org "an E element whose "attr" attribute value
ends exactly with the string "value"
*/
	'$=': function (child, attr, value) {
		return (attr = child.getAttribute(attr)) && attr.indexOf(value) === attr.length - value.length;
	},
/*
from w3.org "an E element whose "attr" attribute value
contains the substring "value"
*/
	'*=': function (child, attr, value) {
		return (attr = child.getAttribute(attr)) && attr.indexOf(value) !== -1;
	},
/*
from w3.org "an E element whose "attr" attribute has
a hyphen-separated list of values beginning (from the
left) with "value"
*/
	'|=': function (child, attr, value) {
		return (attr = child.getAttribute(attr)) && (attr === value || !!attr.indexOf(value + '-'));
	},
/* attr doesn't contain given value */
	'!=': function (child, attr, value) {
		return !(attr = child.getAttribute(attr)) || !(new RegExp('(^| +)' + value + '($| +)').test(attr));
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
/*
clean cache on DOM changes. Code copied from Sizzle
(thx, John), rev. 2008-12-05, line 13. Don't know why
we should ignore this for Safari, querySelectorAll removed.
*/
if (_.doc.addEventListener) {
  function invalidate(){ _.cache = {}; }
  _.doc.addEventListener('DOMAttrModified', invalidate, false);
  _.doc.addEventListener('DOMNodeInserted', invalidate, false);
  _.doc.addEventListener('DOMNodeRemoved', invalidate, false);
}
/* initialization as a global var */
window.yass = _;
/* do not override existing window._ */
window._ = window._ || _;
})();
