/**
 * Allows to collect form fields to request string like "foo=bar&amp;bar=foo".
 * @alias jsx.FormCollector
 */
jsx.FormCollector = new function(){

    this.formTags = ['input', 'textarea', 'select'];

    function createParam(name, value){
        return name + '=' + encodeURIComponent(value);
    }

    /**
     * Collects form fields to request string like "foo=bar&amp;bar=foo".
     * @alias jsx.FormCollector.collectTags
     * @param {Object} DOM node (usually form).
     * @return {String} String like "foo=bar&amp;bar=foo".
     */
    this.collectTags = function(container, tags){
        tags = tags || this.formTags;
        var len = tags.length;
        var body = new Array(len);
        for(var i = 0; i < len; i++) {
            body[i] = this.getTagsValue(container, tags[i]);
        }
        return body.join('&');
    };

    /**
     * Collects fields with tag name and value and return string like "foo=bar&amp;bar=foo".
     * @alias jsx.FormCollector.getTagsValue
     * @param {Object} DOM node (usually form).
     * @param {String} Tag name.
     * @return {String} String like "foo=bar&amp;bar=foo".
     */
    this.getTagsValue = function(container, tag){
        var elements = container.getElementsBySelector(tag);
        var len = elements.length;
        var body = new Array();
        for(var i = 0; i < len; i++){
            var element = elements[i];
            if (element.disabled || !element.name.length){
                continue;
            }
            switch (element.tagName.toLowerCase()){
                case 'input':
                case 'textarea':
                    var param = this.getInputValue(element);
                    if (param) {
                        body.push(param);
                    }
                    break;
                case 'select':
                    if(element.selectedIndex < 0){
                        continue;
                    }
                    if(element.multiple){
                        for(var j = 0, lj = element.options.length; j < lj; j++){
                            if (element.options[j].selected){
                                body.push(createParam(element.name, element.options[j].value));
                            }
                        }
                    } else {
                        body.push(createParam(element.name, element.options[element.selectedIndex].value));
                    }
                    break;
            }
        }
        return body.join('&');
    };

    /**
     * Converts element name and value to string like "foo=bar".
     * @alias jsx.FormCollector.getInputValue
     * @param {Object} DOM node.
     * @return {String} String like "foo=bar".
     */
    this.getInputValue = function(element){
        switch (element.type){
            case 'radio':
            case 'checkbox':
                if (element.checked){
                    return createParam(element.name, element.value);
                }
                break;
            default :
                return createParam(element.name, element.value);
        }
        return '';
    };

    /**
     * Collects tags from DOM node children.
     * @alias jsx.FormCollector.getTagsArray
     * @param {Object} DOM node.
     * @return {Arrya} Array of DOM nodes.
     */
    this.getTagsArray = function(container) {
        var result = [];
        for(var i = 0, li = this.formTags.length; i < li; i++){
            var elements = container.getElementsByTagName(this.formTags[i]);
            for (var j = 0, lj = elements.length; j < lj; j++){
                result[result.length] = elements[j];
            }
        }
        return result;
    };
};

jsx.loaded('FormCollector');
