var ajax = {
    /**
     * Starts a request
     * args = {};
     * @param string args.method        GET or POST
     * @param string args.url           Request URL
     * @param string args.target        Element ID that will receive http.responseText
     * @param integer args.tries        Maximum request tries
     * @param mixed args.params         Params that will be sent to URL
     * @param function args.callback    Function that will receive the request object
     * @param function args.filter      Function that will receive every param you send
     * @param function args.onload
     * @param function args.onrequest
     * @param function args.xtra        Callback arguments
     */
    'request': function(args)
    {
        var http = this.create(), self = this, tried = 0, tmp, i, j;
        var onload, onrequest, filter, callback, tries, target, url, method, xtra, params;
        
        onload = args.onload;
        onrequest = args.onrequest;
        filter = args.filter;
        callback = args.callback;
        tries = args.tries;
        target = args.target;
        url = args.url;
        method = args.method;
        xtra = args.xtra;
        params = args.params;
        
        method = method.toLowerCase();
        
        if (params) {
            if (typeof params == 'object') {
                tmp = [];
                
                for (i in params) {
                    j = params[i];
                    tmp.push(i + '=' + (typeof filter == 'function'? filter.call(null, j) : escape(j)));
                }
                
                params = tmp.join('&');
            }
            
            if (method == 'get') {
				url += url.indexOf('?') == -1? '?' + params : '&' + params;
			}
        }

        http.open(method, url, true);
        
        if (method == 'post') {
			http.setRequestHeader('Method', 'POST ' + url + ' HTTP/1.1');
			http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		} else {
			params = null;
		}
        
        http.onreadystatechange = function()
        {
            if (http.readyState != 4) {
                return;
            }
            
            if (typeof onload == 'function') {
				onload.call(null);
			}

            if (http.status == 200) {
                if (target) {
                    if (http.getResponseHeader('content-type').match(/(html|plain)/)) {
                        self.parseHTML(target, http.responseText);
                    }
				}
                
                if (typeof callback == 'function') {
                    callback.call(null, true, http, xtra);
                }
            } else {
                if (tries > 0) {
                    if (tried < tries) {
						tried++;
						http.abort();
						http.send(params);
					}
                } else if (typeof callback == 'function') {
					callback.call(null, false, http, xtra);
				}
            }
        };
        
        if (typeof onrequest == 'function') {
			onrequest.call(null);
		}
        
        http.send(params);
		
        return http;
    }
    ,
    /**
     * Creates XMLHttpRequest
     */
    'create': function()
    {
        var http;
        
        try {
            http = new XMLHttpRequest();
        } catch (e) {
            try {
                http = new ActiveXObject('Msxml2.XMLHTTP');
            } catch (f) {
                try {
                    http = new ActiveXObject('Microsoft.XMLHTTP');
                } catch (g) { null; }
            }
        }
        
        return http;
    }
    ,
    'get': function(args)
    {
        args.method = 'GET';
        this.request(args);
    }
    ,
    'post': function(args)
    {
        args.method = 'POST';
        this.request(args);
    }
    ,
    'parseHTML': function(target, source, empty)
    {
        var clone, child, children, i, tmp;
        
        target = document.getElementById(target);
		
        if (target) {
            if (empty) {
                clone = target.cloneNode(false);
                target.parentNode.replaceChild(clone, target);
                target = clone;
            }
            
            tmp = document.createElement('div');
            tmp.innerHTML = source;
            children = tmp.childNodes;

            for (i = 0; child = children[i]; i++) {
                child = child.cloneNode(true);
                target.appendChild(child);
            }
        }
    }
};