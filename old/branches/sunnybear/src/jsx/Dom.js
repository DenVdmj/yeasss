jsx.Dom = {}
if (jsx.base == 'prototype'){
	jsx.Dom.hasClassName = Element.Methods.hasClassName;
	jsx.Dom.removeClassName = Element.Methods.removeClassName;
	jsx.Dom.addClassName = Element.Methods.addClassName;
	jsx.Dom.switchClassName = Element.Methods.switchClassName;
	jsx.Dom.toggleClassName = Element.Methods.toggleClassName;
	
	jsx.Dom.getElementsBySelector = Element.Methods.getElementsBySelector;
	jsx.Dom.offset = function(element){
		var offset = Position.cumulativeOffset(element);
		return {left: offset[0], top: offset[1]};
	}
}else if (jsx.base == 'jquery'){
	jsx.Dom.hasClassName = jQuery.className.has;
	jsx.Dom.removeClassName = jQuery.className.remove;
	jsx.Dom.addClassName = jQuery.className.add;
	jsx.Dom.switchClassName = function(element, classOne, classTwo){
	  if (jQuery.className.has(element, classOne)){
	    jQuery.className.remove(element, classOne);
	    jQuery.className.add(element, classTwo);
	  }else if(jQuery.className.has(element, classTwo)){
	    jQuery.className.remove(element, classTwo);
	    jQuery.className.add(element, classOne);
	  }
	};
	jsx.Dom.toggleClassName = function(element, className){
	  if(jQuery.className.has(element, className)){
	    jQuery.className.remove(element, className);
	  }else{
	    jQuery.className.add(element, className);
	  }
	};
	
	function unArray(item){
		return item.length ? item[0] : item; 
	}
	jsx.Dom.getElementsBySelector = function(context, selector){
		return jsx.toArray(jQuery(selector, context)).map(unArray);
	}
	jsx.Dom.offset = function (element){
		return jQuery(element).offset();
	}
}

jsx.loaded('Dom');