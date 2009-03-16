if(!jsx){
  var jsx = {loaded:function(){}};
}
/**
 * Get, set and delete cookies methods.
 */
jsx.Cookies = new function(){

    /**
     * Set cookie.
     * @param {String} Name.
     * @param {String} Value.
     * @param {Date} Expire.
     */
    this.setCookie = function(name, value, time){
        // set cookie if value not null & not empty
        if (value != null && value != '') {
            var kukki = name + '=' + encodeURIComponent(value) + ';path=/';

            // set expire time if defined
            if (typeof(time) != 'undefined') {
                var expire = new Date();

                // set expire time
                expire.setTime(expire.getTime() + time * 3600000);
                kukki += ';expires=' + expire.toGMTString();
            }

            // save cookie
            document.cookie = kukki;
        }
    };

    /**
     * Get cookie value.
     * @param {String} Name.
     * @return {String} Value.
     */
    this.getCookie = function(name){
        var kukki = document.cookie;

        // find cookie entry
        var index = kukki.indexOf(name + '=');

        if (index == -1) {
            return null;
        }

        index = kukki.indexOf('=', index) + 1;
        var endstr = kukki.indexOf(';', index);
        if (endstr == -1) {
            endstr = kukki.length;
        }

        return decodeURIComponent(kukki.substring(index, endstr));
    };

    /**
     * Delete cookie.
     * @param {String} Name.
     */
    this.delCookie = function(name){
        var expire = new Date();

        // set expire time to one year later
        expire.setTime(expire.getTime() - 3600000 * 24 * 365);

        // save cookie
        document.cookie = name + '=' + 'value=;expires=' + expire.toGMTString() + ';path=/';
    };
};

jsx.loaded('Cookies');