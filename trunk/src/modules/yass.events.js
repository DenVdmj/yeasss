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