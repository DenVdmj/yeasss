(function(){
/*
* YASS 0.2.3 - The fastest CSS selectors JavaScript library
*
* Copyright (c) 2008 Nikolay Matsievsky aka sunnybear (webo.in, webo.name)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2008-12-11 13:28:11 +3000 (Tue, 11 Dec 2008) $
* $Rev: 187 $
*/
var _ = function () {
	/* given CSS selector, first argument, fast trim eats about 0.2ms */
	var selector = arguments[0];
/* return cache if exists. Third argument */
	if (_.cache[selector] && !arguments[2]) {
		return _.cache[selector];
	} else {
/* subtree added, second argument, thx to tenshi */
		var root = arguments[1] || _.doc;
/* select first letter to fast switch in simple cases */
		if (!/^.\w+$/.test(selector) || !(_.sets = _.simple[selector.charAt(0).replace(/[a-zA-Z\*]/,"%")](selector, root))) {
/* all other cases.
Apply querySelector if exists.
All methods are called via . not [] - thx to arty
*/
			if (_.doc.querySelectorAll) {
				_.sets = root.querySelectorAll(selector);
			} else {
/* number of groups to merge or not result arrays */
				var groups_length = 0,
/*
groups of selectors separated by commas.
Split by RegExp, thx to tenshi.
*/
					groups = selector.split(/,\s*/),
					group;
/* current set of nodes, to handle single selectors */
				_.sets = null;
				while (group = groups[groups_length++]) {
/* split selectors by space -- to form single group tag-id-class */
					var singles = group.split(/\s+/),
						singles_length = singles.length,
						single,
						i = 0;
/*
current sets of nodes, to handle comma-separated selectors.
Clean them with DOM root
*/
					_.nodes = root;
					while (single = singles[i++]) {
/*
inspired with John's Resig fast replace implementation, more details:
http://ejohn.org/blog/search-and-dont-replace/
http://webo.in/articles/habrahabr/40-search-not-replace/
thx to GreLI for 'greed' RegExp
*/
						single.replace(/([^\s\[\:\.#]+)?(?:#([^\s\[\:\.#]+))?(?:\.([^\s\[\:\.#]+))?(?:\[([^\s\[\:\.#]+)=([^\s\[\:\.#]+)\])?(?:\:([^\s\(\[\:\.#]+)(?:\(([^\)]+)\))?)?/, function(a, tag, id, klass, attr, value, modificator, ind) {
/*
switch to quick select for the root node.
There won't be any duplicates as far as it's the first level
*/
							var newNodes = [],
/* length of root nodes */
								J = 0,
/* iterator of return array, equals to its length */
								idx = 0,
								node;
/*
if root is single -- just make it as an array. Cached
variable is a bit faster in Fx3, but definitely slower in Opera9.
*/
							_.nodes = _.nodes.length ? _.nodes : [_.nodes];
/* loop in all root nodes */
							while (node = _.nodes[J++]) {
								var h = 0,
									child,
/* find all TAGs */
									childs = node.getElementsByTagName(tag || '*');
								while (child = childs[h++]) {
/*
check them for ID or Class. Also check for expando 'yeasss'
to filter non-selected elements. Typeof 'string' not added -
if we get element with name="id" it won't be equal to given ID.
*/
									if ((!id || (id && child.id === id)) && (!klass || (klass && child.className.match(klass))) && (!attr || (attr && child[attr] === value) || (attr === 'class' && child.className.match(value))) && !child.yeasss) {
/*
modificator is either not set in the selector,
or just has been nulled by previous switch
*/
										if (!(_.modificators[modificator] ? _.modificators[modificator](child, ind) : modificator)) {
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
							}
/* put selected nodes in local nodes' set */
							_.nodes = idx ? idx == 1 ? newNodes[0] : newNodes : null;
						});
					}
/* inialize sets with nodes */		
					_.sets = _.sets || _.nodes;
/* fixing bug on non-existent selector, thx to deerua */
					if (_.nodes && groups_length > 1) {
						var node,
							K = 0,
							idx = _.sets.length;
/* remember selected nodes to global set to start new selection */
						while (node = _.nodes[K++]) {
							_.sets[idx++] = node;
						}
/* handle case with the only element in nodes */
						if (K == 1 && _.nodes) {
							_.sets[idx++] = _.nodes;
						}
					}
				}
				var idx = _.sets ? _.sets.length || (_.sets.yeasss = null) : 0;
/*
Need this looping as far as we also have expando 'yeasss'
that must be nulled. Need this only to non-default case
*/
				while (idx--) {
					_.sets[idx].yeasss = null;
				}
			}
		}
/* return and cache results */
		return _.cache[selector] = _.sets;
	}
};
/* current set of nodes, to handle single selectors */
_.nodes = null;
/* current sets of nodes, to handle comma-separated selectors */
_.sets = null;
/* cache for selected nodes, no leaks in IE detected */
_.cache = {};
/* caching global document */
_.doc = document;
/*
return some simple cases: only ID or only CLASS for the very
first case: don't need additional checks
*/
_.simple = {
	'#':
		function () {
			var id = arguments[0].slice(1),
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
*/
				if (nodes_length) {
/* loop in given elements to find the correct one */
					while (nodes_length--) {
						var node = nodes[nodes_length];
						if (node.id === id) {
							nodes = node;
							nodes_length = 0;
						}
					}
				}
			}
			return nodes;
		},
	'.':
		function () {
			if (_.doc.getElementsByClassName) {
				var nodes = arguments[1].getElementsByClassName(arguments[0].slice(1));
				return nodes.length == 1 ? nodes[0] : nodes;
			}
			return null;
		},
	'%':
		function () {
			var nodes = arguments[1].getElementsByTagName(arguments[0])
			return nodes.length == 1 ? nodes[0] : nodes;
		},
	'[':
		function () {},
	':':
		function () {}
};
/*
function calls for CSS2/3 modificatos. Specification taken from
http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
in success just null the flag -- this will be equal to
the ordinary case. Don't null a modificator -- it can
be used for other loops.
*/
_.modificators = {
/* from w3.org: "an E element, first child of its parent" */
	'first-child':
		function (child) {
/* implementation was taken from jQuery.1.2.6, line 1394 */
			return child.parentNode.getElementsByTagName('*')[0] !== child;
		},
/* from w3.org: "an E element, last child of its parent" */
	'last-child':
		function (child) {
			var brother = child.parentNode.lastChild;
/* pre-check. Will be true if most normal cases */
			if (brother === child) {
				return 0;
			}
/* loop in lastChilds while nodeType isn't element */
			while ((brother = brother.previousSibling) && brother.nodeType != 1) {}
/* post check. Maybe true in some cases */
			if (brother === child) {
				return 0;
			}
			return 1;
		},
/* from w3.org: "an E element, root of the document" */
	'root':
		function (child) {
			return child.nodeName.toLowerCase() !== 'html';
		},
/*
from w3.org: "an E element, the n-th child of its parent"
Completely wrong at this moment. Need to support at least: n, 2n, 2n+1
*/
	'nth-child':
		function (child, ind) {
			return ind < 0 || child.parentNode.getElementsByTagName('*')[ind] !== child;
		},
/*
from w3.org: "an E element, the n-th child of its parent,
counting from the last one"
*/
	'nth-last-child':
		function (child, ind) {
			var brothers = child.parentNode.getElementsByTagName('*');
			return ind < 0 || brothers[brothers.length - 1 - ind] !== child;
		},
/* from w3.org: "an E element that has no children (including text nodes)" */
	'empty':
		function (child) {
			return child.hasChildNodes(); 
		},
/* from w3.org: "an E element, only child of its parent" */
	'only-child':
		function (child) {
			return (child.parentNode.getElementsByTagName('*').length !== 1);
		},
/*
from w3.org: "a user interface element E which is checked
(for instance a radio-button or checkbox)"
*/
	'checked':
		function (child) {
			return (child.nodeName.toLowerCase() !== 'input' || !(child.type === 'checkbox' || child.type === 'radio') || !child.checked);
		},
/*
from w3.org: "an element of type E in language "fr"
(the document language specifies how language is determined)"
*/
	'lang':
		function (child, ind) {
			return (child.lang !== ind && _.doc.getElementsByTagName('html')[0].lang !== ind);
		}
};
/* initialization as a global var */
window.yass = _;
/* do not override existing window._ */
window._ = window._ || _;
})();