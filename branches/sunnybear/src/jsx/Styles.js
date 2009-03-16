jsx.Styles = new function (){
    this.styles = [];
    this.createStyle = function (href, charset){
      this.styles[href] = this.styles[href] || this._createStyle(href, charset);
    };
    this._createStyle = function (charset, src) {
        var style = document.createElement('link');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('type', 'text/css');
        if (charset){
            script.setAttribute('charset', charset);
        }
        script.setAttribute('src', src);
        // InsertBefore for IE.
        // If head is not closed and use appendChild IE crashes.
        container.insertBefore(script, document.getElementsByTagName('head').item(0).firstChild);
    }
};

jsx.loaded('Styles');