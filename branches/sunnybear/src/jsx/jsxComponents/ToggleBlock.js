jsxComponents.ToggleBlock = new function(){
  this.init = function(element, params){
    new jsxComponents.ToggleBlock.Constructor(element, params);
    element = null;
  };
};

jsxComponents.ToggleBlock.Constructor = function (element, params){
  this.element = element;
  this.collapseClass = params.collapseClass || '';
  this.expandClass = params.expandClass || '';
  this.init();
  element = null;
};

jsxComponents.ToggleBlock.Constructor.prototype = new function(){
  this.init = function(){
    this.switchers = jsx.Dom.getElementsBySelector(this.element, '.jsxComponents-ToggleBlock-Switcher');
    this.switchers.map(jsx.bind(this, this.observeSwitcher));

    jsx.CallBacks.add('ToggleBlockClick', jsx.bind(this, this.click), this.element);

    jsx.Events.observe(window, 'unload', jsx.bind(this, this.garbageCollector));
  };
  this.click = function(event){
    switch (event){
      case 'expand':
        jsx.Dom.removeClassName(this.element, this.collapseClass);
        jsx.Dom.addClassName(this.element, this.expandClass);        
        break;
      case 'collapse':
        jsx.Dom.removeClassName(this.element, this.expandClass);
        jsx.Dom.addClassName(this.element, this.collapseClass);        
        break;
    }
  }
  this.observeSwitcher = function(switcher){
    jsx.Events.observe(switcher, 'click', jsx.bind(this, this.switchBlock));
  };
  this.switchBlock = function(e){
    jsx.Events.stop(e);
    if (this.collapseClass && this.expandClass){
      jsx.Dom.switchClassName(this.element, this.collapseClass, this.expandClass);
      return;
    }
    if (this.expandClass){
      jsx.Dom.toggleClassName(this.element, this.expandClass);
    }
    if (this.collapseClass){
      jsx.Dom.toggleClassName(this.element, this.collapseClass);
    }
  };
  this.garbageCollector = function(){
    this.element = null;
    this.switchers = null;
  };
};

jsx.require(['Dom', 'Events', 'CallBacks'], jsx.bind(jsx, jsx.loaded, '{jsxComponents}.ToggleBlock'));