/*
* YASS Events - Event handlers delegation module
*
* Copyright (c) 2009 Nikolay Matsievsky aka sunnybear (webo.in),
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* $Date: 2008-01-16 16:52:17 +3000 (Fri, 16 Jan 2009) $
* $Rev: 1 $
*/
/* garbage cleaner adds 10-100ms to window unload */
if (_.browser.ie) {
	_.bind(_.win, 'unload', function(){
		var nodes = _('*'),
			idx = nodes.length,
			node,
			events = ['onblur','onclick','onchange','ondblclick','onerror','onfocus','onkeydown','onkeypress','onkeyup','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','onreadystatechange','onresize','onscroll','onselect','onsubmit','onunload'],
			i;
		while (idx--) {
			node = nodes[idx];
			i = 21;
			while (i--) {
				node[events[i]] = null;
			}
		}
	});
}