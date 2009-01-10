/**
 * Some functions for uniqID
 */
jsx.Utils = {
    /**
     * Generates unique string with prefix.
     * @param {String} Prefix.
     * @return {String} Uniq ID.
     */
    generateId: function (prefix){
          return (prefix || 'uid') + ((new Date()).getTime() + Math.round(Math.random() * 10000));
    },

    /**
     * Generates unique ID for DOM node for IE returns native uniqID.
     * @param {Object} DOM node.
     * @return {String} Uniq ID.
     * @deprecated
     */
    getUniqueID: function(object){
        return this.getUniqueId(object);
    },

    /**
     * Generates unique ID for DOM node for IE returns native uniqID.
     * @param {Object} DOM node.
     * @return {String} Uniq ID.
     */
    getUniqueId: function(object){
        return object.uniqueID || (object.uniqueID = this.generateId());
    },

    /**
     * Compares two links DOM nodes.
     * @param {Object} DOM node.
     * @param {Object} DOM node.
     */
    isEqual: function(first, second){
        return (this.getUniqueId(first) == this.getUniqueId(second));
    }
};
jsx.loaded('Utils');