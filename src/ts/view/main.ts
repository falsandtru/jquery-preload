/// <reference path="../define.ts"/>
/// <reference path="../model/main.ts"/>
/// <reference path="_template.ts"/>

/* VIEW */

module MODULE {
  export class ViewMain extends ViewTemplate implements ViewInterface {

    OBSERVE(): ViewInterface {
      return this;
    }
    RELEASE(): ViewInterface {
      return this;
    }

    //内部イベント
    static EVENTS = {
      BIND: M.NAME
    }

    // VIEWにする要素を選択/解除する
    BIND(uuid: string, event?: Event): ViewInterface {
      var setting = M.stock(uuid);
      this.UNBIND(uuid, event);
      this.CONTEXT
      .bind(setting.nss.event, uuid, this.HANDLERS.PRELOAD);

      event &&
      this.CONTEXT
      .find(<Element>event.currentTarget).add(this.CONTEXT.filter(<Element>event.currentTarget))
      .find(setting.link).filter(setting.filter)
      .bind(setting.nss.click, uuid, this.HANDLERS.CLICK)
      .bind(setting.nss.mouseover, uuid, this.HANDLERS.MOUSEOVER)
      .bind(setting.nss.mousemove, uuid, this.HANDLERS.MOUSEMOVE)
      .bind(setting.nss.mouseout, uuid, this.HANDLERS.MOUSEOUT);
      return this;
    }
    UNBIND(uuid: string, event?: Event): ViewInterface {
      var setting = M.stock(uuid);
      this.CONTEXT
        .unbind(setting.nss.event);

      event &&
      this.CONTEXT
      .find(<Element>event.currentTarget).add(this.CONTEXT.filter(<Element>event.currentTarget))
      .find(setting.link).filter(setting.filter)
      .unbind(setting.nss.click)
      .unbind(setting.nss.mouseover)
      .unbind(setting.nss.mousemove)
      .unbind(setting.nss.mouseout);
      return this;
    }

    RESET(setting: SettingInterface): ViewInterface {
      this.CONTEXT.trigger(setting.nss.event);
      return this;
    }

    // プラグインが実行するイベント名
    static TRIGGERS = { }

    // VIEWの待ち受けるイベントに登録されるハンドラ
    HANDLERS = {
      PRELOAD(event: JQueryEventObject): void {
        C.PRELOAD(event);
      },
      CLICK(event: JQueryMouseEventObject): void {
        C.CLICK(event);
      },
      MOUSEMOVE(event: JQueryMouseEventObject): void {
        C.MOUSEMOVE(event);
      },
      MOUSEOVER(event: JQueryMouseEventObject): void {
        C.MOUSEOVER(event);
      },
      MOUSEOUT(event: JQueryMouseEventObject): void {
        C.MOUSEOUT(event);
      }
    }
    
  }
  // 短縮登録
  export var View = ViewMain;
  export var V = new View();
}
