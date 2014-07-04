/// <reference path="../define.ts"/>
/// <reference path="../model/main.ts"/>
/// <reference path="_template.ts"/>
/// <reference path="function.ts"/>
/// <reference path="method.ts"/>

/* CONTROLLER */

module MODULE {
  export class ControllerMain extends ControllerTemplate implements ControllerInterface {

    PRELOAD(event: JQueryEventObject): void {
      M.PRELOAD(event);
    }
    CLICK(event: JQueryMouseEventObject): void {
      M.CLICK(event);
    }
    MOUSEMOVE(event: JQueryMouseEventObject): void {
      M.MOUSEMOVE(event);
    }
    MOUSEOVER(event: JQueryMouseEventObject): void {
      M.MOUSEOVER(event);
    }
    MOUSEOUT(event: JQueryMouseEventObject): void {
      M.MOUSEOUT(event);
    }

    // CONTROLLERが監視する内部イベントを登録
    OBSERVE() { }

    //内部イベント
    static EVENTS = {
    }

    // プラグインに登録されるプロパティ
    static PROPERTIES = []

    // プラグインが実行するイベント名
    static TRIGGERS = { }

    // CONTROLLERの待ち受けるイベントに登録されるハンドラ
    HANDLERS = { }

  }
  // 短縮登録
  export var Controller = ControllerMain;
  export var C = new Controller();
}
