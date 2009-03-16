/**
 * This object allows you to make soft links between objects (any objects DOM node or JS).
 */

jsx.CallBacks = new function (){
    this.srcload = false;
    this.listeners = {};
    this.eventHistory = {};

    /**
     * Returns object id.
     * @param {Object} DOM node or string "*"
     * @return {String} DOM node id or "*"
     * @private
     */
    this.getId = function(object){
        return (object === '*' ? '*' : jsx.Utils.getUniqueId(object));
    };

    /**
     * Allows to listen for object event.
     * @param {String} Type of event.
     * @param {Funtion} Listener for event.
     * @param {Object} Which object to listen.
     * @param {Boolean} Start listen immediately by default is "true".
     * @param {Object} This object will be in "this" variable for listener, not obligatory.
     * @return {Object} Listener jsx.CallBacks.Listener.
     */
    this.add = function (type, listener, object, execute) {
        object = object || this;
        var id = this.getId(object);

        if (id == this.uniqueID && type == 'srcload' && this.srcload){
            this.execListener(listener);
        }

        var key = id + type;
        if (typeof(this.listeners[key]) == 'undefined') {
            this.listeners[key] = [];
        }
        var listeners = this.listeners[key];
        return (listeners[listeners.length] = new jsx.CallBacks.Listener(listener, execute, key));
    };

    /**
     * Allows to dispatch object event.
     * @param {String} Type of event.
     * @param {Object} Object that is dispatch event.
     * @param {Object} Event object, any data for listeners.
     */
    this._dispatch = function(type, object, event){
        object = object || this;
        var id = this.getId(object);

        if (id == this.uniqueID && type == 'srcload' && !this.srcload && !this.srcLoad()){
            return;
        }

        this.execListeners(id, type, event);
        this.execListeners('*', type, event);
        this.execListeners(id, '*', event);
        this.execListeners('*', '*', event);


        // add event to history
        var key = id + type;
        if (typeof(this.eventHistory[key]) == 'undefined'){
            this.eventHistory[key] = [];
        }
        this.eventHistory[key].push(event);
    }

    if(jsx.Vars.DEBUG) {
        this.dispatch = function (type, object, event) {
            jsx.Console.group('Type: ', type + ', object: ', object, this.execListener.tags.concat(type));
            this._dispatch(type, object, event);
            jsx.Console.groupEnd();
        };
    }else{
        this.dispatch = this._dispatch;
    }

    /**
     * Runs list of listeners by key.
     * @param {String} Object id (from jsx.CallBacks.getId method).
     * @param {String} Type of event.
     * @param {Object} Event object, any data for listeners.
     * @private
     */
    this.execListeners = function (id, type, event) {
        var key = id + type;
        var listeners = this.listeners[key];
        if (typeof(listeners) == 'undefined') {
            return;
        }
        // create local copy of array
        var listenersCopy = [];
        for(var i = 0, l = listeners.length; i < l; i++) {
          listenersCopy[i] = listeners[i];
        }
        for (var i = 0, l = listenersCopy.length; i < l; i++) {
            var listener = listenersCopy[i];
            // if don't need to execute execute == false, if deleted execute == null
            if (listener.execute) {
                this.execListener(listener.listener, event, id, type);
            }
        }
    };

    /**
     * Runs listener.
     * @param {Function} Listener.
     * @param {Object} This object will be in "this" variable for listener.
     * @param {Object} Event object, data for listener.
     * @private
     */
    this._execListener = function (listener, event) {
        listener(event);
    };

    if(jsx.Vars.DEBUG) {
        this.execListener = function (listener, event, id, type) {
            jsx.Console.log('Listener: ', listener, this.execListener.tags.concat(type));
            jsx.Console.log('Event: ', event, this.execListener.tags.concat(type));
            this._execListener(listener, event);
        };
        this.execListener.tags = ['jsx', 'CallBacks', 'Dispatch'];
    } else {
        this.execListener = this._execListener;
    }

    /**
     * Removes listener.
     * @param {Object} listener.
     */
    this.remove = function (listener) {
        var listenersByKey = this.listeners[listener.key];
        var i = listenersByKey.indexOf(listener);
        if (i != -1) {
          listenersByKey.splice(i, 1);
        }
        listener = listener.listener = listener.execute = null;
    };

    /**
     * Code for IE. This code doesn't allow to dispatch event "scrLoad" before body node closes in IE.
     * For all browsers create jsx.CallBacks.Destroer object.
     * @private
     */
    this.srcLoad = function(){
        var _this = this;
        if (!jsx.Vars.is_ie || document.readyState == 'interactive' || document.readyState == 'complete'){
            return srcLoaded();
        }

        function srcLoaded(){
            return _this.srcload = true;
        }

        function srcLoad(){
            if (document.readyState == 'interactive' || document.readyState == 'complete'){
                srcLoaded();
                _this.dispatch('srcload');
            }
        }
        document.onreadystatechange = srcLoad;
        return false;
    };
};

/**
 * Listener object. When you add function listener you will receive this object.
 * This object allows you to manipulate with function listener.
 */
jsx.CallBacks.Listener = function (listener, execute, key) {
    this.listener = listener;
    this.key = key;
    this.execute = (typeof(execute) != 'undefined' ? execute : true);
};
jsx.CallBacks.Listener.prototype = {
    /**
     * Starts listen for event.
     */
    start: function () {
        this.execute = true;
    },

    /**
     * Stops listen for event.
     */
    stop: function () {
        this.execute = false;
    }
};
jsx.require(['Utils'], jsx.bind(jsx, jsx.loaded, 'CallBacks'));