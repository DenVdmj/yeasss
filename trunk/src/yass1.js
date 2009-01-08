(function(){
/*
* YASS1 - The fastest CSS1 selectors JavaScript library
* Experimental branch of YASS - just CSS1 family.
* Faster only by 20-30% than YASS 0.3.2
* Slower than native methods by 100-300%
*
* Copyright (c) 2008 Nikolay Matsievsky aka sunnybear (webo.in, webo.name)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2008-01-08 22:33:01 +3000 (Thu, 08 Jan 2009) $
* $Rev: 4 $
*/
/* given CSS selector is the first argument, fast trim eats about 0.2ms */
var _ = function (selector, root) {
/* Subtree added, second argument, thx to tenshi. */
	root = root || _.doc;
/* sets of nodes, to handle comma-separated selectors */
	var sets;
/* quick return or generic call, missed ~ in attributes selector */
	if (/^(.)\w+$/.exec(selector)) {
/*
some simple cases - only ID or only CLASS for the very first occurence
- don't need additional checks. Switch works as a hash.
*/
		switch (RegExp.$1) {
			case '#':
				var id = selector.slice(1);
				sets = _.doc.getElementById(id);
/*
workaround with IE bug about returning element by name not by ID.
Modified solution from
http://deer.org.ua/2008/08/15/2/
thx to deerua. Get all matching elements with this id
*/
				if (_.doc.all && sets.id !== id && (sets = _.doc.all[id])) {
					var nodes_length = sets.length;
/*
if more than 1, choose first with the correct id.
if we have the only element -- it's already in nodes.
So loop in given elements to find the correct one
*/
					while (nodes_length--) {
						var node = sets[nodes_length];
						if (node.id === id) {
							sets = node;
							nodes_length = 0;
						}
					}
				}
				break;
			default:
				var idx = 0,
					newNodes = [];
				switch (RegExp.$1) {
					case '.':
						var klass = selector.slice(1);
						if (_.doc.getElementsByClassName) {
							newNodes = root.getElementsByClassName(klass);
							idx = newNodes.length;
						} else {
							klass = new RegExp('(^| +)' + klass + '($| +)');
							var nodes = root.getElementsByTagName('*'),
								i = 0,
								node;
							while (node = nodes[i++]) {
								if (klass.test(node.className)) {
									newNodes[idx++] = node;
								}
							}
						}
						break;
					default:
						newNodes = root.getElementsByTagName(selector);
						idx = newNodes.length;
						break;
				}
				sets = idx ? idx > 1 ? newNodes : newNodes[0] : null;
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
				group,
/* current sets of nodes, to handle comma-separated selectors */
				sets = null;
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
					nodes = root;
/*
John's Resig fast replace works a bit slower than
simple exec. Thx to GreLI for 'greed' RegExp
*/
				while (single = singles[i++]) {
/* hash for set of values is faster than simple RegExp */
					single = /([^.#]+)?(?:#([^.#]+))?(?:\.([^.]+))?/.exec(single);
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
/*
if root is single -- just make it as an array. Local
variables are faster.
*/
					nodes = nodes.length ? nodes : [nodes];
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
by previous switch.
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
					nodes = idx ? idx === 1 ? newNodes[0] : newNodes : null;
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
		}
	}
/* return and cache results */
	return sets;
};
/* caching global document */
_.doc = document;
/* initialization as a global var */
window.yass = _;
/* do not override existing window._ */
window._ = window._ || _;
})();