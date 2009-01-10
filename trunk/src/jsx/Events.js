if (jsx.base == 'prototype'){
    jsx.Events = Event;
    jsx.Events.pageX = Event.pointerX;
    jsx.Events.pageY = Event.pointerY;
}else if (jsx.base == 'jquery'){
	jsx.Events = {};
	jsx.Events.observe = jsx.bind(jQuery.event, jQuery.event.add);
	jsx.Events.stopObserving = jsx.bind(jQuery.event, jQuery.event.remove);
	jsx.Events.element = function(event){
		return  event.srcElement || event.target;
	}
	jsx.Events.isLeftClick = function(event){
		return jQuery.event.fix(event).which == 1;
	}
	jsx.Events.pageX = function(event){
		return jQuery.event.fix(event).pageX;
	}
    jsx.Events.pageY = function(event){
        return jQuery.event.fix(event).pageY;
    }	
}
jsx.Events.__observe = jsx.Events.observe;
jsx.Events.observe = function(element, name, observer, useCapture, observe){
    observe = (typeof(observe) == 'undefined' ? true : observe);
    return new jsx.Events.observer(element, name, observer, useCapture, observe);
};

jsx.Events.observer = function (element, name, observer, useCapture, observe){
    this.element = element;
    this.name = name;
    this.observer = observer;
    this.useCapture = useCapture;
    observe ? this.start() : this.stop();

    /* prevent memory leaks in IE */
    if (document.attachEvent){
        jsx.Events.__observe(window, 'unload', jsx.bind(jsx.Events.unloadObserver, jsx.Events, this));
    }
};

jsx.Events.unloadObserver = function(observer){
    observer.element = null;
    observer.observer = null;
};

jsx.Events.observer.prototype = new function(){
    this.stop = function(){
        if (typeof this.observe != 'undefined' && !this.observe){
            return;
        }
        jsx.Events.stopObserving(this.element, this.name, this.observer, this.useCapture);
        this.observe = false;
    };
    this.start = function(){
        if (typeof this.observe != 'undefined' && this.observe){
            return;
        }
        jsx.Events.__observe(this.element, this.name, this.observer, this.useCapture);
        this.observe = true;
    };
};

jsx.Events.stop = function(event){
    jsx.Events.preventDefault(event);
    jsx.Events.stopPropagation(event);	
}

jsx.Events.preventDefault = function(event){
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
};

jsx.Events.stopPropagation = function(event){
    if (event.preventDefault) {
        event.stopPropagation();
    } else {
        event.cancelBubble = true;
    }
};
jsx.loaded('Events');