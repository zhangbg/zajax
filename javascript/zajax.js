/**
 * @fileoverview zajax.js provides a set of utilities for custom ajax process.
 * @function basic ajax function,  params function
 * @author zhangbg
 * @Date: 2014-07-10
 */
 
(function (window) {
    var zajax = {
        request : function (url, settings) {
            if (url && typeof url !== 'string') {
                return;
            }
            var self = this, xmlHttp, url, params, type, async, success, error, context, paramsFilter, paramsStr;
            settings = settings || {};
            params = settings.params || {};
            type = settings.type || 'get';
            type = type.toLowerCase();
            async = (typeof settings.async !== 'undefined') ? settings.async : true;
            success = settings.success || function () {};
            error = settings.error || function () {};
            context = settings.context;
            paramsFilter = settings.paramsFilter || self.paramsFilter;
            xmlHttp = self.createRequest();
            
            if (context) {
                url = (url.indexOf('/') ? context : '/') + url;
            }
            
            if (params) {
                if (typeof params === 'object') {
                    params = paramsFilter(params);
                    paramsStr = self.paramsStringify(params);
                }
            }
            
            if (type === 'get') {
                url += url.indexOf('?') === -1 ? '?' + paramsStr : '&' + paramsStr;
            }
            
            xmlHttp.open(type, url, async);
            
            if (type === 'get') {
                paramsStr = null;
            } else { // type === 'post'
                xmlHttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
            }
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                    success.call(xmlHttp, xmlHttp.responseText, xmlHttp.status, xmlHttp.readyState);
                } else {
                    error.call(xmlHttp, xmlHttp.responseText, xmlHttp.status, xmlHttp.readyState);
                }
            };
            xmlHttp.send(paramsStr);
            return xmlHttp;
        },
        get : function (url, data, callback, type) {
            var self = this;
            if (typeof data === 'function') {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            self.request(url, {
                type : 'get',
                success : callback,
                params : data
            });
        },
        post : function (url, data, callback, type) {
            var self = this;
            if (typeof data === 'function') {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            self.request(url, {
                type : 'post',
                success : callback,
                params : data
            });
        },
        createRequest : function () {
            var xmlHttp = null;
            if (window.XMLHttpRequest) {
                xmlHttp = new XMLHttpRequest();
            } else {
                xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
            }
            return xmlHttp;
        },
        paramsFilter : function (params) {
            return params;
        },
        paramsStringify : function (params, filter) { // need to upgrade
            var key, value, temp = [], str = '';
            for (key in params) {
                value = params[key];
                temp.push(key + '=' + (typeof filter === 'function' ? filter(value) : escape(value)));
            }
            str = temp.join('&');
            return str;
        },
        parseJsonStr : function (jsonStr) {
            return (new Function("return " + jsonStr))();
        }
    };
    window.zajax = zajax;
})(window);


/**
    Phase1: basic ajax function, custom config(url context, params filter), params function, Json Parser for reponseText
    Phase2: ajax Event, Json Parser(new function return json string), custom config(url context, params filter),
    Phase3: ajax other
    Phase4: ajax using html5 new features, such as localStorage
*/