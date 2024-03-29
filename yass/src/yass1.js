(function(){
/*
* YASS1 - The fastest CSS1 selectors JavaScript library
* Experimental branch of YASS - just CSS1 family.
* Faster only by 20-30% than YASS 0.3.4
* Slower than native methods by 100-300%
*
* Copyright (c) 2008-2010 Nikolay Matsievsky aka sunnybear (webo.in, webo.name)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2010-08-31 20:42:03 +3000 (Tue, 31 Aug 2010) $
* $Rev: 7 $
*/
/* given CSS selector is the first argument, fast trim eats about 0.2ms */
var _ = function (selector, root) {
/* Subtree added, second argument, thx to tenshi. */
	root = root || _.doc;
/* sets of nodes, to handle comma-separated selectors */
	var sets = [];
/* quick return or generic call, missed ~ in attributes selector */
	if (/^[\w#.]\w*$/.test(selector)) {
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
				if (_.doc.all && (!sets || sets.id !== id)) {
					sets = _.doc.all[id];
				}
				sets = sets ? [sets] : [];
				break;
			case '.':
				var klass = selector.slice(1),
					idx = 0;
				if (_.ddoc.getElementsByClassName) {
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
				var singles = group.split(/ +/),
					singles_length = singles.length,
/* to handle RegExp for single selector */
					single,
					i = 0,
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
					single = /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!~^*|$[:=]+)([!$^*|]?=)?([^:\]]+)?\])?(?:\:([^(]+)(?:\(([^)]+)\))?)?/.exec(single);
/* 
Get all required matches from exec:
tag, id, class, attribute, value, modificator, index.
*/
					var tag = single[1] || '*',
						id = single[2],
						klass = single[3] ? new RegExp('(^| +)' + single[3] + '($| +)') : '',
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
							if ((!id || item.id === id) && (!klass || klass.test(item.className)) && !item.yeasss) {
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
					}
/* put selected nodes in local nodes' set */
					nodes = newNodes;
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
	return sets;
};
/* caching global document */
_.doc = document;
/* caching main root */
_.ddoc = document.documentElement;
/* initialization as a global var */
window.yass = _;
/* do not override existing window._ */
window._ = window._ || _;
})();
