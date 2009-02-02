(function(){
/*
* YASS1 - The fastest CSS1 selectors JavaScript library
* Experimental branch of YASS - just CSS1 family.
* Faster only by 20-30% than YASS 0.4.0
* Slower than native methods by 100-300%
*
* Copyright (c) 2008 Nikolay Matsievsky aka sunnybear (webo.in, webo.name)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2009-02-02 18:29:29 +3000 (Mon, 02 Feb 2009) $
* $Rev: 15 $
*/
/**
 * Returns number of nodes or an empty array
 * @param {String} CSS selector
 * @param {DOM node} root to look into
 * @param {Boolean} disable cache of not
 */
var _ = function (selector, root) {
/* Subtree added, second argument, thx to tenshi. */
	root = root || _.doc;
/* quick return or generic call, missed ~ in attributes selector */
	if (/^[\w#.]\w*$/.test(selector)) {
/*
some simple cases - only ID or only CLASS for the very first occurence
- don't need additional checks. Switch works as a hash.
*/
		var idx = 0,
			sets = [];
/* the only call -- no cache, thx to GreLI */
		switch (selector.charAt(0)) {
			case '#':
				idx = selector.slice(1);
				sets = _.doc.getElementById(idx);
/*
workaround with IE bug about returning element by name not by ID.
Solution completely changed, thx to deerua.
Get all matching elements with this id
*/
				if (_.doc.all && sets.id !== idx) {
					sets = _.doc.all[idx];
				}
				return sets ? [sets] : [];
			case '.':
				var klass = selector.slice(1);
				if (_.k) {
					return (idx = (sets = root.getElementsByClassName(klass)).length) ? sets : [];
				} else {
/* no RegExp, thx to DenVdmj */
					klass = ' ' + klass + ' ';
					var nodes = root.getElementsByTagName('*'),
						i = 0,
						node;
					while (node = nodes[i++]) {
						if ((' ' + node.className + ' ').indexOf(klass) != -1) {
							sets[idx++] = node;
						}

					}
					return idx ? sets : [];
				}
			default:
				return (idx = (sets = root.getElementsByTagName(selector)).length) ? sets : [];
		}
	} else {
/*
all other cases. Apply querySelector if exists.
All methods are called via . not [] - thx to arty
*/
		if (_.q && selector.indexOf('!=') == -1) {
			return root.querySelectorAll(selector);
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
/* sets of nodes, to handle comma-separated selectors */
				sets = [],
				singles,
/* to handle RegExp for single selector */
				single,
				i,
/* current set of nodes - to handle single selectors */
				nodes,
				newNodes, idx, J, child, last, childs, item, h, id, klass, tag, par,
/* stack for reverse looping */
				stack,
/* remember is need to check root */
				rootReq = root && root !== _.doc;
/* loop in groups, maybe the fastest way */
			while (group = groups[groups_length++]) {
/*
Split selectors by space - to form single group tag-id-class
*/
				singles = group.split(/ +/);
				newNodes = [];
				stack = [];
				h = 0;
				idx = 0;
				J = 0;
				i = 0;
/*
John's Resig fast replace works a bit slower than
simple exec. Thx to GreLI for 'greed' RegExp
*/
				while (single = singles[i++]) {
					single = /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!~^*|$[:=]+)([!$^*|]?=)?([^:\]]+)?\])?(?:\:([^(]+)(?:\(([^)]+)\))?)?/.exec(single);
/* 
Get all required matches from exec to stack:
tag, id, class
*/
					stack[h++] = [single[1] ? single[1].toLowerCase() : '', single[2], single[3] ? ' ' + single[3] + ' ' : ''];
				}
				i = h;
				item = stack[i - 1];
				tag = item[0];
				id = item[1];
				klass = item[2];
/* new nodes array */
				nodes = id ? [_.doc.getElementById(id)] : _.k && !tag && klass ? _.doc.getElementsByClassName(klass) : _.doc.getElementsByTagName(tag || '*');
/* pre-check of selected nodes */
				while (child = nodes[J++]) {
					if ((!tag || child.nodeName.toLowerCase() === tag) && (!id || child.id === id) && (!klass || (' ' + child.className +' ').indexOf(klass) != -1)) {
						newNodes[idx++] = child;
					}
				}
				if (i--) {
					nodes = newNodes;
					idx = 0;
					J = 0;
					newNodes = [];
/* reverse looping through stack for all nodes */
					while (child = nodes[J++]) {
						h = i - 1;
						par = child;
/* climb up through parent nodes and stack */
						while ((item = stack[h--]) && par && (par = par.parentNode)) {
							tag = item[0];
							id = item[1];
							klass = item[2];
							while (par && ((tag && par.nodeName.toLowerCase() !== tag) || (id && par.id !== id) || (klass && (' ' + par.className +' ').indexOf(klass) == -1))) {
								par = par.parentNode;
							}
						}
						if (rootReq) {
							while ((par = par.parentNode) && par !== root) {}
						}
						if (child && par && !child.yeasss) {
							child.yeasss = 1;
							newNodes[idx++] = child;
						}
					}
				}
/* fixing bug on non-existent selector, thx to deerua */
				if (groups_length > 1) {
/* concat is faster than simple looping */
					sets = sets.concat(newNodes);
				} else {
/* inialize sets with nodes */
					sets = newNodes;
				}
			}
/* define sets length to clean yeasss */
			idx = (sets = sets || []).length;
/*
Need this looping as far as we also have expando 'yeasss'
that must be nulled. Need this only to generic case
*/
			while (idx--) {
				sets[idx].yeasss = null;
			}
/* return results */
			return sets;
		}
	}
};
/* caching global document */
_.doc = document;
/* cached check for querySelectorAll */
_.q = !!_.doc.querySelectorAll;
/* cached check for getElementsByClassName */
_.k = !!_.doc.getElementsByClassName;
/* initialization as a global var */
window.yass = _;
/* do not override existing window._ */
window._ = window._ || _;
})();