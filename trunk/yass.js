(function(){
/*
* YASS 0.2.1 - The fastest CSS3 selectors JavaScript library
*
* Copyright (c) 2008 Nikolay Matsievsky aka sunnybear (webo.in, webo.name)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2008-12-00 00:12:10 +3000 (Tue, 9 Dec 2008) $
* $Rev: 129 $
*/
var _ = function () {
/* given CSS selector, first argument */
	var selector = arguments[0];
/* return cache if exists. Third argument */
	if (_.cache[selector] && !arguments[2]) {
		return _.cache[selector];
	} else {
		if (!selector) {
			return null;
		}
/* subtree added, second argument, thx to tenshi */
		var root = arguments[1] || document;
/*
apply querySelector if exists.
All methods are called via . not [] - thx to arty
*/
		if (root.querySelectorAll) {
			_.sets = root.querySelectorAll(selector);
		} else {
			switch (selector) {
/* return some simple and quick cases */
				case 'a':
					_.sets = root.links || root.getElementsByTagName('a');
					break;
				case 'body':
					_.sets = root.body;
					break;
				case 'div':
					_.sets = root.getElementsByTagName('div');
					break;
				case 'form':
					_.sets = root.forms || root.getElementsByTagName('form');
					break;
				case 'h1':
					_.sets = root.getElementsByTagName('h1');
					break;
				case 'h2':
					_.sets = root.getElementsByTagName('h2');
					break;
				case 'h3':
					_.sets = root.getElementsByTagName('h3');
					break;
				case 'head':
					_.sets = root.getElementsByTagName('head')[0];
					break;
				case 'img':
					_.sets = root.images || root.getElementsByTagName('img');
					break;
				case 'p':
					_.sets = root.getElementsByTagName('p');
					break;
				case 'table':
					_.sets = root.getElementsByTagName('table');
					break;
				case 'title':
					_.sets = root.getElementsByTagName('title')[0];
					break;
/* generic case */
				default:
/*
groups of selectors separated by commas.
Split by RegExp, thx to tenshi.
*/
					var groups = selector.split(/, */),
						group,
						j = 0,
						doc = document;
					while (group = groups[j++]) {
/* split selectors by space -- to form single group tag-id-class */
						var singles = group.split(/ +/),
							singles_length = singles.length,
							single,
							i = 0;
/* clean nodes with DOM root */
						_.nodes = root;
						while (single = singles[i++]) {
/*
inspired with John's Resig fast replace implementation, more details:
http://ejohn.org/blog/search-and-dont-replace/
http://webo.in/articles/habrahabr/40-search-not-replace/
thx to GreLI for 'greed' RegExp
*/
							single.replace(/([^\[\:\.#]+)?(?:#([^\[\:\.#]+))?(?:\.([^\[\:\.#]+))?(?:\[([^\[\:\.#]+)=([^\[\:\.#]+)\])?(?:\:([^\(\[\:\.#]+)(?:\(([^\)]+)\))?)?/, function(a, tag, id, klass, attr, value, modificator, ind) {
/*
switch to quick select for the root node.
There won't be any duplicates as far as it's the first level
*/
								switch (i) {
									case 0:
										if (!modificator) {
/* perform quick check for ID, won't work always correctly if ROOT is set */
											if (!klass) {
												if (!tag) {
/*
usage of cached document isn't faster in all browsers,
due to optimized calls for document.getElementById,
but we are working for IE. Thx to GreLI
*/
													_.nodes = doc.getElementById(id);
/*
workaround with IE bug about returning element by name not by ID.
Modified solution from
http://deer.org.ua/2008/08/15/2/
thx to deerua. Get all matching elements with this id
*/
													if (doc.all && _.nodes.id != id && (_.nodes = doc.all[id])) {
														var nodes_length = _.nodes.length;
/*
if more than 1, choose first with the correct id.
if we have the only element -- it's already in nodes.
*/
														if (nodes_length) {
/* loop in given elements to find the correct one */
															while (nodes_length--) {
																var node = _.nodes[nodes_length];
																if (node.id === id) {
																	_.nodes = node;
																	nodes_length = 0;
																}
															}
														}
													}
/* check if element has given attribute with value */
													if (!attr || _.nodes[attr] === value) {
														break;
													}
												}
/* quick check for TAG */
												if (!id && !attr) {
													_.nodes = root.getElementsByTagName(tag);
													break;
												}
											}
/* quick check for CLASS */
											if (!tag && !id && !attr && !modificator && root.getElementsByClassName) {
												_.nodes = root.getElementsByClassName(klass);
												break;
											}
										}
/* generic selector to get element by TAG, CLASS, ID, ATTR/VALUE, MIDIFICATOR */
									default:
/* array to merge results */
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
CSS2/3 modificatos. Specification taken from
http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
in success just null the flag -- this will be equal to
the ordinary case. Don't null a modificator -- it can
be used for other loops.
*/
													var flag = modificator;
													switch (flag) {
/* from w3.org: "an E element, first child of its parent" */
														case 'first-child':
/* implementation was taken from jQuery.1.2.6, line 1394 */
															if (child.parentNode.getElementsByTagName('*')[0] === child) {
																flag = 0;
															}
															break;
/* from w3.org: "an E element, last child of its parent" */
														case 'last-child':
															var brother = child.parentNode.lastChild;
/* llop in lastChilds while nodeType isn't element */
															while (brother.nodeType != 1) {
																brother = brother.nextSibling;
															}
															if (brother === child) {
																flag = 0;
															}
															break;
/* from w3.org: "an E element, root of the document" */
														case 'root':
															if (child.nodeName.toLowerCase() === 'html') {
																flag = 0;
															}
															break;
/*
from w3.org: "an E element, the n-th child of its parent"
Completely wrong at this moment. Need to support at least: n, 2n, 2n+1
*/
														case 'nth-child':
															if (ind > -1 && child.parentNode.getElementsByTagName('*')[ind] === child) {
																flag = 0;
															}
															break;
/*
from w3.org: "an E element, the n-th child of its parent,
counting from the last one"
*/
														case 'nth-last-child':
															var brothers = child.parentNode.getElementsByTagName('*');
															if (ind > -1 && brothers[brothers.length - 1 - ind] === child) {
																flag = 0;
															}
															break;
/* from w3.org: "an E element that has no children (including text nodes)" */
														case 'empty':
															if (!child.hasChildNodes()) {
																flag = 0;
															}
															break;
/* from w3.org: "an E element, only child of its parent" */
														case 'only-child':
															if (child.parentNode.getElementsByTagName('*').length == 1) {
																flag = 0;
															}
															break;
/*
from w3.org: "a user interface element E which is checked
(for instance a radio-button or checkbox)"
*/
														case 'checked':
															if (child.nodeName.toLowerCase() === 'input' && (child.type === 'checkbox' || child.type === 'radio') && child.checked) {
																flag = 0;
															}
															break;
/*
from w3.org: "an element of type E in language "fr"
(the document language specifies how language is determined)"
*/
														case 'lang':
															if (child.lang === ind || doc.getElementsByTagName('html')[0].lang === ind) {
																flag = 0;
															}
															break;
													}
/*
modificator is either not set in the selector,
or just has been nulled by previous switch
*/
													if (!flag) {
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
										_.nodes = newNodes;
										break;
								}
							});
						}
/* inialize sets with nodes */
						_.sets = _.sets || _.nodes;
/* fixing bug on non-existent selector, thx to deerua */
						if (_.nodes && j > 1) {
							var node,
								K = 0,
								idx = _.sets.length;
/* remember selected nodes to global set to start new selection */
							while (node = _.nodes[K++]) {
								_.sets[idx++] = node;
							}
						}
					}
					var idx = _.sets.length;
/*
Need this looping as far as we also have expando 'yeasss'
that must be nulled. Need this only to non-default case
*/
					while (idx--) {
						_.sets[idx].yeasss = null;
					}
					break;
			}
		}
/* save result in cache */
		_.cache[selector] = _.sets.length>1 || _.sets.nodeName ? _.sets : _.sets[0];
/* clear all properties to prevent memory leaks */
		_.sets = _.nodes = null;
/* return saved result */
		return _.cache[selector];
	}
};
/* current set of nodes, to handle single selectors */
_.nodes = null;
/* current sets of nodes, to handle comma-separated selectors */
_.sets = null;
/* cache for selected nodes, no leaks in IE detected */
_.cache = {};
/* initialization as a global var */
window.yass = _;
/* do not override existing window._ */
window._ = window._ || _;
})();