(function() {
	var script = document.createElement('script');
	script.src = 'http://yeasss.googlecode.com/svn/trunk/yass/src/yass.js';
	document.body.appendChild(script);
	setTimeout(function() {
		if (!_) {
			arguments.callee;
		} else {
			var sheets = _.doc.styleSheets,
				sheet,
				i = 0,
				rules,
				rule,
				j,
				text,
				selector,
				k,
				log = [];
			while (sheet = sheets[i++]) {
				if (!sheet.disabled) {
					j = 0;
					rules = sheet.cssRules;
					while (rule = rules[j++]) {
						text = rule.cssText;
						text = text.substring(0, text.indexOf('{'));
						text = text.split(',');
						k = 0;
						while (selector = text[k++]) {
							if (!_(selector.replace(/(^\s+|\s+$)/,""))[0]) {
								log[log.length] = selector;
							}
						}
					}
				}
			}
			var container = document.createElement('blockquote');
			container = document.body.appentChild(container);
			var style = container.style;
			style.position = 'absolute';
			style.left = '10px';
			style.padding = '5px';
			style.top = '10px;';
			style.background = '#fff';
			style.border = '1px solid #999';
			container.innerHTML = '<pre>' + log.implode("\n") + '</pre>';
		}
	});
})()