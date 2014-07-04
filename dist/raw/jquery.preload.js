/**
 * 
 * jquery.preload.js
 * 
 * @name jquery.preload.js
 * @version 0.3.0
 * ---
 * @author falsandtru https://github.com/falsandtru/jquery.preload.js/
 * @copyright 2014, falsandtru
 * @license MIT
 * 
 */

new (function(window, document, undefined, $) {
"use strict";
var MODULE;
(function (MODULE) {
    MODULE.NAME = 'preload';
    MODULE.NAMESPACE = jQuery;

    

    

    

    (function (State) {
        State[State["wait"] = -1] = "wait";
        State[State["ready"] = 0] = "ready";
        State[State["lock"] = 1] = "lock";
        State[State["seal"] = 2] = "seal";
    })(MODULE.State || (MODULE.State = {}));
    var State = MODULE.State;

    

    
})(MODULE || (MODULE = {}));
var MODULE;
(function (MODULE) {
    var ModelTemplate = (function () {
        function ModelTemplate() {
            this.NAME = MODULE.NAME;
            this.NAMESPACE = MODULE.NAMESPACE;
            this.state_ = -1 /* wait */;
            this.GEN_UUID = function () {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16).toUpperCase();
                });
            };
            this.stock = function stock(key, value, merge) {
                if (this instanceof stock) {
                    switch (typeof key) {
                        case 'object':
                        case 'function':
                            this.uuid = MODULE.M.GEN_UUID();
                            stock[this.uuid] = this;
                            return jQuery.extend.apply(jQuery, [true, this].concat([].slice.call(arguments)).concat({ uuid: this.uuid }));
                        case 'string':
                            return delete stock[key];
                    }
                } else if ('object' === typeof key) {
                    var keys = key, iKeys;
                    for (iKeys in keys) {
                        MODULE.Model.store(iKeys, keys[iKeys]);
                    }
                } else {
                    switch (arguments.length) {
                        case 0:
                            return new this.stock();
                        case 1:
                            return this.stock[key] || MODULE.Model.store(key);
                        case 2:
                            return MODULE.Model.store(key, value);
                        case 3:
                            return MODULE.Model.store(key, value, merge);
                    }
                }
            };
            this.UUID = this.GEN_UUID();
        }
        ModelTemplate.prototype.MAIN = function (context) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            return this.main_.apply(this, [context].concat(args));
        };

        ModelTemplate.prototype.main_ = function (context) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            this.state_ = 0 /* ready */;
            return context;
        };

        ModelTemplate.store = function store(key, value, merge) {
            switch (arguments.length) {
                case 0:
                    break;
                case 1:
                    return MODULE.Model.store[key];
                case 2:
                    return MODULE.Model.store[key] = value;
                case 3:
                    return MODULE.Model.store[key] = jQuery.extend(true, MODULE.Model.store[key], value);
            }
        };
        return ModelTemplate;
    })();
    MODULE.ModelTemplate = ModelTemplate;
})(MODULE || (MODULE = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MODULE;
(function (MODULE) {
    var ModelMain = (function (_super) {
        __extends(ModelMain, _super);
        function ModelMain() {
            _super.apply(this, arguments);
            this.UTIL = {
                canonicalizeUrl: function (url) {
                    var ret;

                    ret = this.trim(url);

                    ret = ret.replace(/["`^|\\<>{}\[\]\s].*/, '');

                    ret = /^https?:/i.test(ret) ? ret : (function (url, a) {
                        a.href = url;
                        return a.href;
                    })(ret, document.createElement('a'));

                    ret = encodeURI(decodeURI(ret));

                    ret = ret.replace(/(?:%\w{2})+/g, function (str) {
                        return url.match(str.toLowerCase()) || str;
                    });
                    return ret;
                },
                trim: function (text) {
                    if (String.prototype.trim) {
                        text = text.toString().trim();
                    } else {
                        if (text = String(text).replace(/^[\s\uFEFF\xA0]+/, '')) {
                            for (var i = text.length; --i;) {
                                if (/[^\s\uFEFF\xA0]/.test(text.charAt(i))) {
                                    text = text.substring(0, i + 1);
                                    break;
                                }
                            }
                        }
                    }
                    return text;
                },
                fire: function (fn, context, args, async) {
                    if (typeof context === "undefined") { context = window; }
                    if (typeof args === "undefined") { args = []; }
                    if (typeof async === "undefined") { async = false; }
                    if (typeof fn === 'function') {
                        return async ? setTimeout(function () {
                            fn.apply(context || window, args);
                        }, 0) : fn.apply(context || window, args);
                    } else {
                        return fn;
                    }
                }
            };
        }
        ModelMain.prototype.main_ = function ($context, option) {
            var _this = this;
            var pattern;
            pattern = $context instanceof MODULE.NAMESPACE ? 'm:' : 'f:';
            pattern += option ? ({}).toString.call(option).split(' ').pop().slice(0, -1).toLowerCase() : option;
            switch (pattern.toLowerCase()) {
                case 'f:number':
                case 'f:0':
                case 'f:string':
                    option = { link: option };
                case 'f:':
                case 'm:object':
                case 'm:null':
                case 'm:function':
                case 'm:undefined':
            }

            $context = $context instanceof jQuery ? $context : jQuery(document);

            var setting = new this.stock(this.configure(option));

            this.stock({
                setting: setting,
                queue: []
            });

            var url = window.location.href.replace(/#.*/, '');
            url = setting.encode ? MODULE.M.UTIL.canonicalizeUrl(url) : url;
            var loaded = {};
            loaded[url] = true;
            this.stock('loaded', loaded, true);

            $context.uuid = setting.uuid;

            jQuery(function () {
                setting.view.push(new MODULE.View($context).BIND(setting.uuid));
                setting.view[0].CONTEXT.trigger(setting.nss.event);
                _this.state_ = ~_this.state_ ? _this.state_ : 0 /* ready */;
            });

            this.cooldown(setting);

            return $context;
        };
        ModelMain.prototype.configure = function (option) {
            var setting = jQuery.extend(true, {}, option), initial = {
                gns: MODULE.M.NAME,
                ns: null,
                link: 'a:not([target])',
                filter: function () {
                    return /(\/[^.]*|\.html?|\.php)([#?].*)?$/.test(this.href);
                },
                lock: 1000,
                forward: null,
                check: null,
                interval: 1000,
                limit: 2,
                cooldown: 10000,
                skip: 50,
                query: '',
                encode: false,
                ajax: { dataType: 'text', async: true, timeout: 1500 }
            }, force = {
                view: [],
                target: null,
                volume: 0,
                points: [],
                touch: false,
                xhr: null,
                timeStamp: 0,
                option: option
            }, compute = function () {
                var nsArray = [setting.gns || MODULE.M.NAME].concat(setting.ns && String(setting.ns).split('.') || []);
                return {
                    nss: {
                        name: setting.ns || '',
                        array: nsArray,
                        event: nsArray.join('.'),
                        data: nsArray.join('-'),
                        class4html: nsArray.join('-'),
                        click: ['click'].concat(nsArray.join(':')).join('.'),
                        mousemove: ['mousemove'].concat(nsArray.join(':')).join('.'),
                        mouseover: ['mouseover'].concat(nsArray.join(':')).join('.'),
                        mouseout: ['mouseout'].concat(nsArray.join(':')).join('.'),
                        touchstart: ['touchstart'].concat(nsArray.join(':')).join('.'),
                        touchmove: ['touchmove'].concat(nsArray.join(':')).join('.'),
                        touchend: ['touchend'].concat(nsArray.join(':')).join('.')
                    },
                    ajax: jQuery.extend(true, {}, jQuery.ajaxSettings, setting.ajax)
                };
            };

            setting = jQuery.extend(true, {}, initial, setting, force);
            setting = jQuery.extend(true, {}, setting, compute());

            return setting;
        };
        ModelMain.prototype.cooldown = function (setting) {
            (function (wait, setting) {
                setTimeout(function cooldown() {
                    setting.volume -= Number(!!setting.volume);
                    setTimeout(cooldown, wait);
                }, wait, setting);
            })(setting.cooldown, setting);
        };

        ModelMain.prototype.PRELOAD = function (event) {
            var setting = this.stock(event.data);
            setting.volume = 0;
            setting.timeStamp = 0;
            setting.view[0].BIND(event.data, event);
        };
        ModelMain.prototype.CLICK = function (event) {
            var setting = this.stock(event.data), context = event.currentTarget;

            if (MODULE.M.state_ !== 0 /* ready */) {
                return;
            }

            event.timeStamp = new Date().getTime();
            if (setting.encode) {
                'href' in context ? context.href = this.getURL_(setting, context) : context.src = this.getURL_(setting, context);
            }
            switch (!event.isDefaultPrevented() && jQuery.data(event.currentTarget, setting.nss.data)) {
                case 'preload':
                case 'lock':
                    if (setting.forward) {
                        var url = this.getURL_(setting, event.currentTarget);
                        if (false === MODULE.M.UTIL.fire(setting.forward, null, [event, setting.xhr, setting.timeStamp])) {
                            if ('lock' === jQuery.data(event.currentTarget, setting.nss.data)) {
                                event.preventDefault();
                            } else {
                                this.click_(setting, event);
                                jQuery.removeData(event.currentTarget, setting.nss.data);
                            }
                        } else {
                            event.preventDefault();
                            jQuery.removeData(event.currentTarget, setting.nss.data);
                        }
                    } else {
                        if ('lock' === jQuery.data(event.currentTarget, setting.nss.data)) {
                            event.preventDefault();
                        } else {
                            this.click_(setting, event);
                            jQuery.removeData(event.currentTarget, setting.nss.data);
                        }
                    }
                    break;
                default:
                    setting.xhr && setting.xhr.readyState < 4 && setting.xhr.abort();
            }
        };
        ModelMain.prototype.MOUSEMOVE = function (event) {
            var setting = this.stock(event.data);

            if (MODULE.M.state_ !== 0 /* ready */) {
                return;
            }

            event.timeStamp = new Date().getTime();
            if (!setting.points[0] || 30 < event.timeStamp - setting.points[0].timeStamp) {
                setting.points.unshift(event);
                setting.points.splice(10, 1);
                this.check_(event, setting);
            }
        };
        ModelMain.prototype.MOUSEOVER = function (event) {
            var setting = this.stock(event.data);
            setting.target = event.currentTarget;
        };
        ModelMain.prototype.MOUSEOUT = function (event) {
            var setting = this.stock(event.data);
            setting.target = null;
        };

        ModelMain.prototype.preload_ = function (event) {
            var setting = this.stock(event.data), that = this;

            var ajax = jQuery.extend(true, {}, setting.ajax, {
                success: function () {
                    var args = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        args[_i] = arguments[_i + 0];
                    }
                    time = new Date().getTime() - time;
                    MODULE.M.UTIL.fire(setting.ajax.success, this, args);

                    var loaded = {};
                    loaded[url] = true;
                    that.stock('loaded', loaded, true);

                    if (arguments[2].status === 304 || time <= setting.skip) {
                        setting.volume -= Number(!!setting.volume);
                        setting.timeStamp = 0;
                    }
                    if ('click' === jQuery.data(event.currentTarget, setting.nss.data)) {
                        that.click_(setting, event);
                    }
                    jQuery.removeData(event.currentTarget, setting.nss.data);
                },
                error: function () {
                    var args = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        args[_i] = arguments[_i + 0];
                    }
                    MODULE.M.UTIL.fire(setting.ajax.error, this, args);

                    setting.volume -= Number(!!setting.volume);
                    setting.timeStamp = 0;
                    jQuery.removeData(event.currentTarget, setting.nss.data);
                }
            });
            var query = setting.query;
            if (query) {
                query = query.split('=');
                query = encodeURIComponent(query[0]) + (query.length > 0 ? '=' + encodeURIComponent(query[1]) : '');
            }
            var url = this.getURL_(setting, event.currentTarget);
            ajax.url = url.replace(/([^#]+)(#[^\s]*)?$/, '$1' + (query ? (url.match(/\?/) ? '&' : '?') + query : '') + '$2');
            var time = new Date().getTime();
            setting.xhr = jQuery.ajax(ajax);
            jQuery.when && jQuery.when(setting.xhr).done(setting.ajax.done).fail(setting.ajax.fail).always(setting.ajax.always);
        };

        ModelMain.prototype.speed = function (points) {
            if (points.length < 3) {
                return [];
            }
            var speed1, time1, speed2, time2;
            time1 = points[0].timeStamp - points[1].timeStamp;
            speed1 = parseInt(String(Math.pow(points[0].pageX - points[1].pageX, 2) + Math.pow(points[0].pageY - points[1].pageY, 2) / (time1 || 1)), 10);
            time2 = points[1].timeStamp - points[2].timeStamp;
            speed2 = parseInt(String(Math.pow(points[1].pageX - points[2].pageX, 2) + Math.pow(points[1].pageY - points[2].pageY, 2) / (time2 || 1)), 10);

            return 1000 > time1 && 1000 > time2 ? [speed1 - speed2, speed1] : [];
        };
        ModelMain.prototype.check_ = function (event, setting) {
            var _this = this;
            var url, queue, id, speed;
            url = this.getURL_(setting, event.currentTarget);
            queue = this.stock('queue');
            switch (true) {
                case setting.target !== event.currentTarget:
                case queue.length > 100:
                case setting.volume >= setting.limit:
                case setting.interval ? new Date().getTime() - setting.timeStamp < setting.interval : false:
                case setting.check ? !!MODULE.M.UTIL.fire(setting.check, event.currentTarget, [url]) : this.stock('loaded')[url.replace(/#.*/, '')]:
                case setting.points.length < 3:
                case setting.points[2].pageX === event.pageX:
                case (function (speed) {
                    switch (true) {
                        case !speed.length:
                            break;
                        case -50 > speed[0] && 200 > speed[1]:
                        case -50 < speed[0] && 50 > speed[0] && -50 < speed[1] && 50 > speed[1]:
                            return false;
                    }
                    return true;
                })(speed = this.speed(setting.points)):
                    break;
                default:
                    if (!setting.ajax.crossDomain && (setting.target.protocol !== window.location.protocol || setting.target.host !== window.location.host)) {
                        break;
                    }
                    setting.xhr && setting.xhr.readyState < 4 && setting.xhr.abort();
                    var loaded = {};
                    loaded[url.replace(/#.*/, '')] = true;
                    this.stock('loaded', loaded, true);
                    ++setting.volume;
                    setting.timeStamp = event.timeStamp;

                    jQuery.data(event.currentTarget, setting.nss.data, 'preload');

                    if (setting.lock) {
                        jQuery.data(event.currentTarget, setting.nss.data, 'lock');
                        jQuery(event.currentTarget).one(setting.nss.click, function (event) {
                            if (jQuery.data(event.currentTarget, setting.nss.data)) {
                                var timer = Math.max(setting.lock - new Date().getTime() + event.data, 0);
                                jQuery.data(event.currentTarget, setting.nss.data, 'click');
                                if (timer) {
                                    setTimeout(function () {
                                        'click' === jQuery.data(event.currentTarget, setting.nss.data) && _this.click_(setting, event);
                                        jQuery.removeData(event.currentTarget, setting.nss.data);
                                    }, timer);
                                    event.preventDefault();
                                }
                            }
                        });

                        this.preload_(event);
                    }
                    break;
            }
        };

        ModelMain.prototype.click_ = function (setting, event) {
            var _this = this;
            var target = event.currentTarget;
            setting.xhr && setting.xhr.readyState < 4 && setting.xhr.abort();
            jQuery(event.currentTarget).removeData(setting.nss.data);
            if (jQuery(document).find(event.currentTarget)[0]) {
                jQuery(document).unbind(setting.nss.click).one(setting.nss.click, function (event) {
                    if (!event.isDefaultPrevented()) {
                        window.location.href = setting.encode ? MODULE.M.UTIL.canonicalizeUrl(target.href) : target.href;
                        if (setting.encode) {
                            window.location.href = _this.getURL_(setting, event.currentTarget);
                        }
                    }
                });
                jQuery(event.currentTarget).click();
            }
            event.preventDefault();
        };

        ModelMain.prototype.getURL_ = function (setting, element) {
            var url;
            switch (element.tagName.toLowerCase()) {
                case 'a':
                case 'link':
                    url = element.href;
                    break;
                case 'script':
                case 'img':
                case 'iframe':
                    url = element.src;
                    break;
            }
            return setting.encode ? MODULE.M.UTIL.canonicalizeUrl(url) : url;
        };
        return ModelMain;
    })(MODULE.ModelTemplate);
    MODULE.ModelMain = ModelMain;

    MODULE.Model = ModelMain;
    MODULE.M = new MODULE.Model();
})(MODULE || (MODULE = {}));
var MODULE;
(function (MODULE) {
    var ViewTemplate = (function () {
        function ViewTemplate(context) {
            this.state_ = -1 /* wait */;
            this.queue_ = [];
            this.HANDLERS = {};
            this.UUID = MODULE.M.GEN_UUID();
            switch (arguments.length) {
                case 0:
                    break;
                case 1:
                    this.CONTEXT = context;
                    this.OBSERVE();
                    break;
            }
            this.state_ = 0;
        }
        ViewTemplate.prototype.OBSERVE = function () {
        };

        ViewTemplate.prototype.RELEASE = function () {
        };

        ViewTemplate.prototype.BIND = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            this.UNBIND();
            return this;
        };

        ViewTemplate.prototype.UNBIND = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return this;
        };

        ViewTemplate.EVENTS = {};

        ViewTemplate.TRIGGERS = {};
        return ViewTemplate;
    })();
    MODULE.ViewTemplate = ViewTemplate;
})(MODULE || (MODULE = {}));
var MODULE;
(function (MODULE) {
    var ViewMain = (function (_super) {
        __extends(ViewMain, _super);
        function ViewMain() {
            _super.apply(this, arguments);
            this.HANDLERS = {
                PRELOAD: function (event) {
                    MODULE.C.PRELOAD(event);
                },
                CLICK: function (event) {
                    MODULE.C.CLICK(event);
                },
                MOUSEMOVE: function (event) {
                    MODULE.C.MOUSEMOVE(event);
                },
                MOUSEOVER: function (event) {
                    MODULE.C.MOUSEOVER(event);
                },
                MOUSEOUT: function (event) {
                    MODULE.C.MOUSEOUT(event);
                }
            };
        }
        ViewMain.prototype.OBSERVE = function () {
            return this;
        };
        ViewMain.prototype.RELEASE = function () {
            return this;
        };

        ViewMain.prototype.BIND = function (uuid, event) {
            var setting = MODULE.M.stock(uuid);
            this.UNBIND(uuid, event);
            this.CONTEXT.bind(setting.nss.event, uuid, this.HANDLERS.PRELOAD);

            event && this.CONTEXT.find(event.currentTarget).add(this.CONTEXT.filter(event.currentTarget)).find(setting.link).filter(setting.filter).bind(setting.nss.click, uuid, this.HANDLERS.CLICK).bind(setting.nss.mouseover, uuid, this.HANDLERS.MOUSEOVER).bind(setting.nss.mousemove, uuid, this.HANDLERS.MOUSEMOVE).bind(setting.nss.mouseout, uuid, this.HANDLERS.MOUSEOUT);
            return this;
        };
        ViewMain.prototype.UNBIND = function (uuid, event) {
            var setting = MODULE.M.stock(uuid);
            this.CONTEXT.unbind(setting.nss.event);

            event && this.CONTEXT.find(event.currentTarget).add(this.CONTEXT.filter(event.currentTarget)).find(setting.link).filter(setting.filter).unbind(setting.nss.click).unbind(setting.nss.mouseover).unbind(setting.nss.mousemove).unbind(setting.nss.mouseout);
            return this;
        };

        ViewMain.prototype.RESET = function (setting) {
            this.CONTEXT.trigger(setting.nss.event);
            return this;
        };
        ViewMain.EVENTS = {
            BIND: MODULE.M.NAME
        };

        ViewMain.TRIGGERS = {};
        return ViewMain;
    })(MODULE.ViewTemplate);
    MODULE.ViewMain = ViewMain;

    MODULE.View = ViewMain;
    MODULE.V = new MODULE.View();
})(MODULE || (MODULE = {}));
var MODULE;
(function (MODULE) {
    var ControllerTemplate = (function () {
        function ControllerTemplate() {
            this.state_ = -1 /* wait */;
            this.HANDLERS = {};
            this.UUID = MODULE.M.GEN_UUID();

            if (MODULE.M.NAMESPACE && MODULE.M.NAMESPACE == MODULE.M.NAMESPACE.window) {
                MODULE.M.NAMESPACE[MODULE.M.NAME] = this.EXEC;
            } else {
                MODULE.M.NAMESPACE[MODULE.M.NAME] = MODULE.M.NAMESPACE.prototype[MODULE.M.NAME] = this.EXEC;
            }

            var f = 'function' === typeof MODULE.ControllerFunction && new MODULE.ControllerFunction() || MODULE.ControllerFunction;

            this.REGISTER_FUNCTIONS(MODULE.M.NAMESPACE[MODULE.M.NAME], f);

            this.UPDATE_PROPERTIES(MODULE.M.NAMESPACE[MODULE.M.NAME], f);
            this.OBSERVE();
            this.state_ = 0;
        }
        ControllerTemplate.prototype.EXTEND = function (context) {
            if (context === MODULE.M.NAMESPACE || MODULE.M.NAMESPACE && MODULE.M.NAMESPACE == MODULE.M.NAMESPACE.window) {
                context = MODULE.M.NAMESPACE[MODULE.M.NAME];
            } else if (context instanceof MODULE.M.NAMESPACE) {
                if (context instanceof jQuery) {
                    context = context.add();
                } else {
                }
            }
            var f = 'function' === typeof MODULE.ControllerFunction && new MODULE.ControllerFunction() || MODULE.ControllerFunction, m = 'function' === typeof MODULE.ControllerMethod && new MODULE.ControllerMethod() || MODULE.ControllerMethod;

            this.REGISTER_FUNCTIONS(context, f);
            this.REGISTER_FUNCTIONS(context, m);

            this.UPDATE_PROPERTIES(context, f);
            this.UPDATE_PROPERTIES(context, m);
            return context;
        };

        ControllerTemplate.prototype.EXEC = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            var context = MODULE.C.EXTEND(this);
            args = [context].concat(args);
            args = MODULE.C.exec_.apply(MODULE.C, args);
            args = args instanceof Array ? args : [args];
            return MODULE.M.MAIN.apply(MODULE.M, args);
        };

        ControllerTemplate.prototype.exec_ = function (context) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            return [context].concat(args);
        };

        ControllerTemplate.prototype.REGISTER_FUNCTIONS = function (context, funcs) {
            var props = MODULE.Controller.PROPERTIES;

            var i;
            for (i in funcs) {
                context[i] = funcs[i];
            }
            return context;
        };

        ControllerTemplate.prototype.UPDATE_PROPERTIES = function (context, funcs) {
            var props = MODULE.Controller.PROPERTIES;

            var i, len, prop;
            for (i = 0, len = props.length; i < len; i++) {
                prop = props[i];
                if (funcs[prop]) {
                    context[prop] = funcs[prop].call(context);
                }
            }
            return context;
        };

        ControllerTemplate.prototype.OBSERVE = function () {
        };

        ControllerTemplate.prototype.RELEASE = function () {
        };

        ControllerTemplate.EVENTS = {};

        ControllerTemplate.FUNCTIONS = {};

        ControllerTemplate.METHODS = {};

        ControllerTemplate.PROPERTIES = [];

        ControllerTemplate.TRIGGERS = {};
        return ControllerTemplate;
    })();
    MODULE.ControllerTemplate = ControllerTemplate;
})(MODULE || (MODULE = {}));
var MODULE;
(function (MODULE) {
    var ControllerFunction = (function () {
        function ControllerFunction() {
        }
        ControllerFunction.prototype.enable = function () {
            MODULE.M.state_ = 0 /* ready */;
            return this;
        };

        ControllerFunction.prototype.disable = function () {
            MODULE.M.state_ = 1 /* lock */;
            return this;
        };
        return ControllerFunction;
    })();
    MODULE.ControllerFunction = ControllerFunction;
})(MODULE || (MODULE = {}));
var MODULE;
(function (MODULE) {
    var ControllerMethod = (function (_super) {
        __extends(ControllerMethod, _super);
        function ControllerMethod() {
            _super.apply(this, arguments);
        }
        return ControllerMethod;
    })(MODULE.ControllerFunction);
    MODULE.ControllerMethod = ControllerMethod;
})(MODULE || (MODULE = {}));
var MODULE;
(function (MODULE) {
    var ControllerMain = (function (_super) {
        __extends(ControllerMain, _super);
        function ControllerMain() {
            _super.apply(this, arguments);
            this.HANDLERS = {};
        }
        ControllerMain.prototype.PRELOAD = function (event) {
            MODULE.M.PRELOAD(event);
        };
        ControllerMain.prototype.CLICK = function (event) {
            MODULE.M.CLICK(event);
        };
        ControllerMain.prototype.MOUSEMOVE = function (event) {
            MODULE.M.MOUSEMOVE(event);
        };
        ControllerMain.prototype.MOUSEOVER = function (event) {
            MODULE.M.MOUSEOVER(event);
        };
        ControllerMain.prototype.MOUSEOUT = function (event) {
            MODULE.M.MOUSEOUT(event);
        };

        ControllerMain.prototype.OBSERVE = function () {
        };

        ControllerMain.EVENTS = {};

        ControllerMain.PROPERTIES = [];

        ControllerMain.TRIGGERS = {};
        return ControllerMain;
    })(MODULE.ControllerTemplate);
    MODULE.ControllerMain = ControllerMain;

    MODULE.Controller = ControllerMain;
    MODULE.C = new MODULE.Controller();
})(MODULE || (MODULE = {}));
})(window, window.document, void 0, jQuery);
