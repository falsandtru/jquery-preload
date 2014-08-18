/// <reference path="../define.ts"/>
/// <reference path="_template.ts"/>
/// <reference path="utility.ts"/>
/// <reference path="../view/main.ts"/>
/// <reference path="../controller/main.ts"/>

/* MODEL */

module MODULE.MODEL {
  export class Main extends Template implements ModelInterface {

    controller_: ControllerInterface = new CONTROLLER.Main(this)

    state_: State
    loaded_: { [index: string]: boolean } = {}

    main_($context: ContextInterface, option): ContextInterface {

      // polymorphism
      var pattern;
      pattern = $context instanceof NAMESPACE ? 'm:' : 'f:';
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

      var setting: SettingInterface = new this.stock(this.configure(option));

      this.stock({
        setting: setting,
        queue: []
      });

      var url: string = setting.encode ? Util.canonicalizeUrl(window.location.href) : window.location.href;
      url = url.replace(/#.*/, '');
      this.loaded_[url] = true;

      $context.uuid = setting.uuid;

      jQuery(() => {
        setting.view.push(new VIEW.Main(this, this.controller_, $context, setting.uuid));
        setting.view[0].CONTEXT.trigger(setting.nss.event);
        this.state_ = ~this.state_ ? this.state_ : State.ready;
      });

      this.cooldown(setting);

      return $context;
    }
    configure(option: any): SettingInterface {
      var setting = jQuery.extend(true, {}, option),
        initial = {
          gns: NAME,
          ns: null,
          link: 'a:not([target])',
          filter: function () { return /(\/[^.]*|\.html?|\.php)([#?].*)?$/.test(this.href); },
          lock: 1000,
          forward: null,
          check: null,
          balance: {
            host: null,
            ajax: {
              crossDomain: true,
              beforeSend: null
            }
          },
          interval: 1000,
          limit: 2,
          cooldown: 10000,
          skip: 50,
          query: '',
          encode: false,
          ajax: { dataType: 'text', async: true, timeout: 1500 }
        },
        force = {
          view: [],
          target: null,
          volume: 0,
          points: [],
          touch: false,
          xhr: null,
          timeStamp: 0,
          option: option,
        },
        compute = function () {
          var nsArray = [setting.gns || NAME].concat(setting.ns && String(setting.ns).split('.') || []);
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
            ajax: jQuery.extend(true, {}, jQuery.ajaxSettings, setting.ajax),
          };
        };

      setting = jQuery.extend(true, {}, initial, setting, force);
      setting = jQuery.extend(true, {}, setting, compute());

      return setting;
    }
    cooldown(setting: SettingInterface): void {
      (function (wait, setting) {
        setTimeout(function cooldown() {
          setting.volume -= Number(!!setting.volume);
          setTimeout(cooldown, wait);
        }, wait, setting);
      })(setting.cooldown, setting);
    }

    PRELOAD(event: JQueryEventObject): void {
      var setting: SettingInterface = this.stock(event.data);
      setting.volume = 0;
      setting.timeStamp = 0;
      setting.view[0].BIND(event.data, event);
    }
    CLICK(event: JQueryMouseEventObject) {
      var setting: SettingInterface = this.stock(event.data),
          context = event.currentTarget;

      if (this.state_ !== State.ready) { return; }

      event.timeStamp = new Date().getTime();
      if (setting.encode) { 'href' in context ? (<HTMLAnchorElement>context).href = this.getURL_(setting, <HTMLElement>context) : (<HTMLImageElement>context).src = this.getURL_(setting, <HTMLElement>context); }
      switch (!event.isDefaultPrevented() && jQuery.data(<Element>event.currentTarget, setting.nss.data)) {
        case 'preload':
        case 'lock':
          if (setting.forward) {
            // forward
            var url = this.getURL_(setting, <HTMLElement>event.currentTarget),
                host = setting.xhr.host;
            delete setting.xhr.host;
            if (false === Util.fire(setting.forward, null, [event, setting.xhr, host, setting.timeStamp])) {
              // forward fail
              if ('lock' === jQuery.data(<Element>event.currentTarget, setting.nss.data)) {
                // lock
                event.preventDefault();
              } else {
                // preload
                this.click_(setting, event);
                jQuery.removeData(<Element>event.currentTarget, setting.nss.data);
              }
            } else {
              // forward success
              event.preventDefault();
              jQuery.removeData(<Element>event.currentTarget, setting.nss.data);
            }
          } else {
            // not forward
            if ('lock' === jQuery.data(<Element>event.currentTarget, setting.nss.data)) {
              // lock
              event.preventDefault();
            } else {
              // preload
              this.click_(setting, event);
              jQuery.removeData(<Element>event.currentTarget, setting.nss.data);
            }
          }
          break;
        default:
          setting.xhr && setting.xhr.readyState < 4 && setting.xhr.abort();
      }
    }
    MOUSEMOVE(event: JQueryMouseEventObject): void {
      var setting: SettingInterface = this.stock(event.data);

      if (this.state_ !== State.ready) { return; }

      event.timeStamp = new Date().getTime();
      if (!setting.points.length || 30 < event.timeStamp - setting.points[0].timeStamp) {
        //var point = {
        //  pageX: event.pageX,
        //  pageY: event.pageY,
        //  timeStamp: new Date().getTime()
        //};
        setting.points.unshift(event);
        setting.points = setting.points.slice(0, 3);
        setting.points.length >= 3 && this.check_(event, setting);
      }
    }
    MOUSEOVER(event: JQueryMouseEventObject): void {
      var setting: SettingInterface = this.stock(event.data);
      setting.target = <HTMLAnchorElement>event.currentTarget;
    }
    MOUSEOUT(event: JQueryMouseEventObject): void {
      var setting: SettingInterface = this.stock(event.data);
      setting.target = null;
    }

    speed(points: { pageX: number; pageY: number; timeStamp: number; }[]): boolean {
      if (points.length < 3) { return false; }
      var speed1, time1, speed2, time2;
      time1 = points[0].timeStamp - points[1].timeStamp;
      speed1 = parseInt(String(Math.pow(points[0].pageX - points[1].pageX, 2) + Math.pow(points[0].pageY - points[1].pageY, 2) / (time1 || 1)), 10);
      time2 = points[1].timeStamp - points[2].timeStamp;
      speed2 = parseInt(String(Math.pow(points[1].pageX - points[2].pageX, 2) + Math.pow(points[1].pageY - points[2].pageY, 2) / (time2 || 1)), 10);

      var speed = 1000 > time1 && 1000 > time2 ? [speed1 - speed2, speed1] : [];
      switch (true) {
        case !speed.length:
          break;
        case -50 > speed[0] && 200 > speed[1]:
        case -50 < speed[0] && 50 > speed[0] && -50 < speed[1] && 50 > speed[1]:
          return true;
      }
      return false;
    }
    check_(event: JQueryMouseEventObject, setting: SettingInterface): void {
      switch (true) {
        case setting.volume >= setting.limit:
        case setting.points.length < 3:
        case setting.points[2].pageX === event.pageX:
        case setting.interval ? new Date().getTime() - setting.timeStamp < setting.interval : false:
          return;
        default:
          var check = () => {
            var url: string = this.getURL_(setting, <HTMLElement>event.currentTarget);
            url = url.replace(/#.*/, '');
            switch (true) {
              case setting.target !== event.currentTarget:
              case setting.check ? !!Util.fire(setting.check, event.currentTarget, [url]) : this.loaded_[url]:
              case !setting.ajax.crossDomain && (setting.target.protocol !== window.location.protocol || setting.target.host !== window.location.host):
                return;
            }
            this.drive_(event, setting);
          }
          if (0 && Worker && URL && URL.createObjectURL && Blob) {
            var job;
            job = [
              'var test = ' + this.speed.toString() + ';',
              'onmessage = function(event) {postMessage(test(event.data));self.close();};'
            ];
            var worker = new Worker(URL.createObjectURL(new Blob(job, { type: "text/javascript" })));;
            worker.onmessage = (event) => {
              event.data && check();
              worker.terminate();
            };
            worker.onerror = (event) => {
              worker.terminate();
            };
            worker.postMessage(setting.points);
          } else {
            if (this.speed(setting.points)) {
              check();
            }
          }
      }
    }

    drive_(event: JQueryMouseEventObject, setting: SettingInterface): void {
      setting.xhr && setting.xhr.readyState < 4 && setting.xhr.abort();
      this.loaded_[this.getURL_(setting, <HTMLElement>event.currentTarget).replace(/#.*/, '')] = true;
      ++setting.volume;
      setting.timeStamp = event.timeStamp;

      jQuery.data(<HTMLElement>event.currentTarget, setting.nss.data, 'preload');

      if (setting.lock) {
        jQuery.data(<HTMLElement>event.currentTarget, setting.nss.data, 'lock');
        jQuery(<HTMLElement>event.currentTarget)
        .one(setting.nss.click, event => {
          // `this` is Model instance
          if (jQuery.data(<HTMLElement>event.currentTarget, setting.nss.data)) {
            // Behavior when using the lock
            var timer = Math.max(setting.lock - new Date().getTime() + event.data, 0);
            jQuery.data(<HTMLElement>event.currentTarget, setting.nss.data, 'click');
            if (timer) {
              setTimeout(() => {
                'click' === jQuery.data(<HTMLElement>event.currentTarget, setting.nss.data) && this.click_(setting, event);
                jQuery.removeData(<HTMLElement>event.currentTarget, setting.nss.data);
              }, timer);
              event.preventDefault();
            }
          }
        });
      }
      this.preload_(event);
    }

    preload_(event: JQueryMouseEventObject): void {
      var setting: SettingInterface = this.stock(event.data),
          host = setting.balance.host && setting.balance.host(),
          that = this;

      var ajax = jQuery.extend(true, {}, setting.ajax, {
            beforeSend: function (jqXHR: JQueryXHR, ajaxSetting: JQueryAjaxSettings) {
              jqXHR.setRequestHeader('X-Preload', 'true');

              Util.fire(setting.ajax.beforeSend, this, [jqXHR, ajaxSetting]);
            },
            success: function (...args: any[]) {
              time = new Date().getTime() - time;
              Util.fire(setting.ajax.success, this, args);

              that.loaded_[url] = true;

              if (arguments[2].status === 304 || time <= setting.skip) {
                setting.volume -= Number(!!setting.volume);
                setting.timeStamp = 0;
              }
              if ('click' === jQuery.data(<Element>event.currentTarget, setting.nss.data)) {
                that.click_(setting, event);
              }
              jQuery.removeData(<Element>event.currentTarget, setting.nss.data);
            },
            error: function (...args: any[]) {
              Util.fire(setting.ajax.error, this, args);

              setting.volume -= Number(!!setting.volume);
              setting.timeStamp = 0;
              jQuery.removeData(<Element>event.currentTarget, setting.nss.data);
            }
          },
          host && setting.balance.ajax);
      var query: any = setting.query;
      if (query) {
        query = query.split('=');
        query = encodeURIComponent(query[0]) + (query.length > 0 ? '=' + encodeURIComponent(query[1]) : '');
      }
      var url = this.getURL_(setting, <HTMLElement>event.currentTarget);
      url = host ? url.replace('//[^/]+', '//' + host) : url;
      ajax.url = url.replace(/([^#]+)(#[^\s]*)?$/, '$1' + (query ? (url.match(/\?/) ? '&' : '?') + query : '') + '$2');
      var time = new Date().getTime();
      setting.xhr = jQuery.ajax(ajax);
      setting.xhr.host = host;
      jQuery.when &&
      jQuery.when(setting.xhr)
      .done((<any>setting.ajax).done)
      .fail((<any>setting.ajax).fail)
      .always((<any>setting.ajax).always);
    }

    click_(setting, event): void {
      var target = event.currentTarget;
      setting.xhr && setting.xhr.readyState < 4 && setting.xhr.abort();
      jQuery(event.currentTarget).removeData(setting.nss.data);
      if (jQuery(document).find(event.currentTarget).length) {
        jQuery(document)
        .unbind(setting.nss.click)
        .one(setting.nss.click, (event) => {
          if (!event.isDefaultPrevented()) {
            window.location.href = setting.encode ? Util.canonicalizeUrl(target.href) : target.href;
            if (setting.encode) { window.location.href = this.getURL_(setting, <HTMLElement>event.currentTarget); }
          }
        });
        jQuery(event.currentTarget).click();
      }
      event.preventDefault();
    }

    getURL_(setting: SettingInterface, element: HTMLElement): string {
      var url;
      switch (element.tagName.toLowerCase()) {
        case 'a':
        case 'link':
          url = (<HTMLAnchorElement>element).href;
          break;
        case 'script':
        case 'img':
        case 'iframe':
          url = (<HTMLImageElement>element).src;
          break;
      }
      return setting.encode ? Util.canonicalizeUrl(url) : url;
    }

  }

}
