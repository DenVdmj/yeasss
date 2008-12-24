(function(){
/*
* YASS 0.2.9 - The fastest CSS selectors JavaScript library
*
* Copyright (c) 2008 Nikolay Matsievsky aka sunnybear (webo.in, webo.name)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2008-12-23 21:21:35 +3000 (Tue, 23 Dec 2008) $
* $Rev: 240 $
*/
/* given CSS selector is the first argument, fast trim eats about 0.2ms */
var _ = function (selector, root, noCache) {
/*
Subtree added, second argument, thx to tenshi.
Return cache if exists. Third argument.
Return not cached result if root specified, thx to Skiv
*/
		return _.cache[selector] && !noCache && !root ? _.cache[selector] : _.main(selector, root || _.doc);
};
_.main = function (selector, root) {
/* current sets of nodes, to handle comma-separated selectors */
	var sets,
/* first letter for quick switch in simple cases, a bit faster in Fx */
		firstLetter;
/* quick return or generic call */
/* this place need to be refactored to reduce RegExps, but how? */
	if (!(firstLetter = /^(.)\w+$/.exec(selector)) || !(sets = _.simple[firstLetter[1].replace(/[^\[:\.#]/,"%")](selector, root))) {
/*
all other cases. Apply querySelector if exists.
All methods are called via . not [] - thx to arty
*/
		if (_.doc.querySelectorAll) {
			sets = root.querySelectorAll(selector);
		} else {
/* call generic function for complicated selectors */
			sets = _.generic(selector, root);
		}
	}
/* return and cache results */
	return _.cache[selector] = sets;
};
/* function to get generic selector */
_.generic = function (selector, root) {
/* number of groups to merge or not result arrays */
	var groups_length = 0,
/*
groups of selectors separated by commas.
Split by RegExp, thx to tenshi.
*/
		groups = selector.split(/ *, */),
		group,
/* current sets of nodes, to handle comma-separated selectors */
		sets = null;
/* loop in groups, maybe the fastest way */
	while (group = groups[groups_length++]) {
/*
Split selectors by space - to form single group tag-id-class,
or to get heredity operator. Replace + in child modificators
to % to avoid collisions
*/
		var singles = group.replace(/(\([^)]*)\+([^)]*\))/,"$1%$2").split(/ *( |>|~|\+) */),
			singles_length = singles.length,
/* to handle RegExp for single selector */
			single,
			i = 0,
/* to remember ancestor call for next childs, initialize with [" "] */
			ancestor = _.ancestor[" "],
/*
current set of nodes - to handle single selectors -
is cleanded up with DOM root
*/
			nodes = root;
/*
John's Resig fast replace works a bit slower than
simple exec. Thx to GreLI for 'greed' RegExp
*/
		while (single = singles[i++]) {
			if (ancestor && nodes) {
				single = /([^\s[:.#]+)?(?:#([^\s[:.#]+))?(?:\.([^\s[:.]+))?(?:\[([^\s[:=]+)=?([^\s:\]]+)?\])?(?:\:([^\s(]+)(?:\(([^)]+)\))?)?/.exec(single);
/* 
Get all required matches from exec:
tag, id, class, attribute, value, modificator, index.
*/
				var tag = single[1],
					id = single[2],
					klass = single[3],
					attr = single[4],
					value = single[5],
					modificator = single[6],
					ind = single[7],
/* new nodes array */
					newNodes = [],
/* length of root nodes */
					J = 0,
/* iterator of return array, equals to its length */
					idx = 0,
					node;
/*
if root is single -- just make it as an array. Local
variables are faster.
*/
				nodes = nodes.length ? nodes : [nodes];
/* loop in all root nodes */
				while (node = nodes[J++]) {
					var h = 0,
						child,
/* find all TAGs or just return all possible neibours */
						childs = ancestor(node, tag || '*');
					while (child = childs[h++]) {
/*
check them for ID or Class. Also check for expando 'yeasss'
to filter non-selected elements. Typeof 'string' not added -
if we get element with name="id" it won't be equal to given ID string.
Also check for given attribute.
Modificator is either not set in the selector, or just has been nulled
by previous switch.
Ancestor will return true for simple child-parent relationship.
*/
						if ((!id || (id && child.id === id)) && (!klass || (klass && child.className.match(klass))) && (!attr || (attr && child[attr] && (!value || child[attr] === value)) || (attr === 'class' && child.className.match(value))) && !child.yeasss && (!(_.modificators[modificator] ? _.modificators[modificator](child, ind) : modificator))) {
/* 
Need to define expando property to true for the last step.
Then mark selected element with expando
*/
							if (i == singles_length) {
								child.yeasss = 1;
							}
/* and add to result array */
							newNodes[idx++] = child;
						}
					}
				}
/* put selected nodes in local nodes' set */
				nodes = idx ? idx == 1 ? newNodes[0] : newNodes : null;
				ancestor = null;
			} else {
/* switch ancestor ( , > , ~ , +) */
				ancestor = _.ancestor[single];
			}
		}
/* inialize sets with nodes */
		sets = sets || nodes;
/* fixing bug on non-existent selector, thx to deerua */
		if (nodes && groups_length > 1) {
/* concat is faster than simple looping */
			sets = (sets.length ? sets : [sets]).concat(nodes);
		}
	}
/* define sets length to clean yeasss */
	var idx = sets ? sets.length || (sets.yeasss = null) : 0;
/*
Need this looping as far as we also have expando 'yeasss'
that must be nulled. Need this only to generic case
*/
	while (idx--) {
		sets[idx].yeasss = null;
	}
/* return computed sets of elements */
	return sets;
};
/* cache for selected nodes, no leaks in IE detected */
_.cache = {};
/* caching global document */
_.doc = document;
/*
return some simple cases: only ID or only CLASS for the very
first case: don't need additional checks
*/
_.simple = {
/* return element by ID */
	'#':
		function (selector) {
			var id = selector.slice(1),
				nodes = _.doc.getElementById(id);
/*
workaround with IE bug about returning element by name not by ID.
Modified solution from
http://deer.org.ua/2008/08/15/2/
thx to deerua. Get all matching elements with this id
*/
			if (_.doc.all && nodes.id !== id && (nodes = _.doc.all[id])) {
				var nodes_length = nodes.length;
/*
if more than 1, choose first with the correct id.
if we have the only element -- it's already in nodes.
So ;oop in given elements to find the correct one
*/
				while (nodes_length--) {
					var node = nodes[nodes_length];
					if (node.id === id) {
						nodes = node;
						nodes_length = 0;
					}
				}
			}
			return nodes;
		},
/* return element by CLASS */
	'.':
		function (selector, root) {
			if (_.doc.getElementsByClassName) {
				var nodes = root.getElementsByClassName(selector.slice(1));
				return nodes.length === 1 ? nodes[0] : nodes;
			}
			return null;
		},
/* return elements by TAG */
	'%':
		function (selector, root) {
			var nodes = root.getElementsByTagName(selector);
			return nodes.length === 1 ? nodes[0] : nodes;
		},
/* return elements by ATTR */
	'[':
		function (selector, root) {
			var nodes = root.getElementsByTagName('*'),
				node,
				i = 0,
				attr = selector.replace(/\[([^=]+)=?.*\]/,"$1"),
				value = selector.replace(/\[[^=]+(?:=([^\]]+))?\]/,"$1"),
				newNodes = [],
				idx = 0;
			while (node = nodes[i++]) {
/* check either attr is defined for given node or it's equal to give value */
				if (node[attr] && (!value || node[attr] === value || (attr === 'class' && node.className.match(value)))) {
					newNodes[idx++] = node;
				}
			}
			return idx ? idx > 1 ? newNodes : newNodes[0] : null;
		},
/* return elements by MODIFICATOR */
	':':
		function (selector, root) {
			var nodes = root.getElementsByTagName('*'),
				node,
				i = 0,
				newNodes = [],
				idx = 0,
				ind = selector.replace(/[^(]*\(([^)]*)\)/,"$1"),
				selector = selector.replace(/\(.*/,"");
			while (node = nodes[i++]) {
				if (_.modificator[selector] && !_.modificator[selector](node, ind)) {
					newNodes[idx++] = node;
				}
			}
			return idx ? idx > 1 ? newNodes : newNodes[0] : null;
		}
};
/*
function calls for CSS2 ancestor modificators.
Return correct 'children' for given node. They can be
direct childs, neighbours or something else.
*/
_.ancestor = {
/* from w3.org: "an F element preceded by an E element" */
	"~":
		function (child, tag) {
			var newNodes = [],
				idx = 0;
			tag = tag.toLowerCase();
/* don't touch already selected elements */
			while ((child = child.nextSibling) && !child.yeasss) {
				if (child.nodeType === 1 && child.nodeName.toLowerCase() === tag) {
					newNodes[idx++] = child;
				}
			}
			return newNodes;
		},
/* from w3.org: "an F element immediately preceded by an E element" */
	"+":
		function (child, tag) {
			while ((child = child.nextSibling) && child.nodeType != 1) {}
			return child && child.nodeName.toLowerCase() === tag.toLowerCase() ? [child] : [];
		},
/* from w3.org: "an F element child of an E element" */
	">":
		function (child, tag) {
			var nodes = child.getElementsByTagName(tag),
				i = 0,
				idx = 0,
				node,
				newNodes = [];
			while (node = nodes[i++]) {
				if (node.parentNode === child) {
					newNodes[idx++] = node;
				}
			}
			return newNodes;
		},
/* from w3.org: "an F element descendant of an E element" */
	" ":
		function (child, tag) {
			return child.getElementsByTagName(tag);
		}
};
/*
function calls for CSS2/3 modificatos. Specification taken from
http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
in success return negative result.
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
/*
from w3.org: "an E element, the n-th child of its parent"
*/
	'nth-child': function (child, ind) {
			ind = ind.replace(/even/,"2n").replace(/odd/,"2n+1");
/* check if we need computation */
			if (ind.indexOf('n') !== -1) {
/* add multiplying for short form, % changes to + */
				ind = ind.replace(/%/,"+").replace(/([0-9])n/,"$1*n");
				var brothers = child.parentNode.getElementsByTagName('*'),
					n = brothers.length - 1;
/* looping in child to find if nth expression is correct */
				while (n--) {
					if (brothers[eval(ind)] === child) {
						return 0;
					}
				}
				return 1;
			}
			return child.parentNode.getElementsByTagName('*')[ind] !== child;
		},
/*
from w3.org: "an E element, the n-th child of its parent,
counting from the last one"
*/
	'nth-last-child': function (child, ind) {
			ind = ind.replace(/even/,"2n").replace(/odd/,"2n+1");
			var brothers = child.parentNode.getElementsByTagName('*'),
				n = brothers.length - 1;
/* check if we need computation */
			if (ind.indexOf('n') !== -1) {
/* add multiplying for short form, % changes to + */
				ind = ind.replace(/%/,"+").replace(/([0-9])n/,"$1*n");
/* looping in child to find if nth expression is correct */
				while (n--) {
					if (brothers[n - eval(ind)] === child) {
						return 0;
					}
				}
				return 1;
			}
			return brothers[n - ind] !== child;
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
			return child.parentNode.getElementsByTagName('*').length != 1;
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
			return child.disabled || child.type === "hidden";
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
  _.doc.addEventListener("DOMAttrModified", invalidate, false);
  _.doc.addEventListener("DOMNodeInserted", invalidate, false);
  _.doc.addEventListener("DOMNodeRemoved", invalidate, false);
}
/* initialization as a global var */
window.yass = _;
/* do not override existing window._ */
window._ = window._ || _;
})();
