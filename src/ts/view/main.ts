/// <reference path="../define.ts"/>
/// <reference path="../model/main.ts"/>
/// <reference path="_template.ts"/>

/* VIEW */

module MODULE.VIEW {
  var C: ControllerInterface

  export class Main extends Template implements ViewInterface {

    constructor(public model_: ModelInterface, public controller_: ControllerInterface, context: ContextInterface, uuid) {
      super(model_, controller_, context, uuid);
      C = controller_;
    }

    OBSERVE(uuid: string): ViewInterface {
      var setting = this.model_.stock(uuid);
      this.CONTEXT.bind(setting.nss.event, uuid, this.PRELOAD);
      return this;
    }
    RELEASE(uuid: string): ViewInterface {
      var setting = this.model_.stock(uuid);
      this.CONTEXT.unbind(setting.nss.event);
      return this;
    }

    //内部イベント
    static EVENTS = {
      BIND: NAME
    }

    // VIEWにする要素を選択/解除する
    BIND(uuid: string, event?: Event): ViewInterface {
      var setting = this.model_.stock(uuid);
      this.UNBIND(uuid, event);

      event &&
      this.CONTEXT
      .find(<Element>event.currentTarget).add(this.CONTEXT.filter(<Element>event.currentTarget))
      .find(setting.link).filter(setting.filter)
      .bind(setting.nss.click, uuid, this.CLICK)
      .bind(setting.nss.mouseover, uuid, this.MOUSEOVER)
      .bind(setting.nss.mousemove, uuid, this.MOUSEMOVE)
      .bind(setting.nss.mouseout, uuid, this.MOUSEOUT);
      return this;
    }
    UNBIND(uuid: string, event?: Event): ViewInterface {
      var setting = this.model_.stock(uuid);

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
    PRELOAD(event: JQueryEventObject): void {
      C.PRELOAD(event);
    }
    CLICK(event: JQueryMouseEventObject): void {
      C.CLICK(event);
    }
    MOUSEMOVE(event: JQueryMouseEventObject): void {
      C.MOUSEMOVE(event);
    }
    MOUSEOVER(event: JQueryMouseEventObject): void {
      C.MOUSEOVER(event);
    }
    MOUSEOUT(event: JQueryMouseEventObject): void {
      C.MOUSEOUT(event);
    }
    
  }

}
