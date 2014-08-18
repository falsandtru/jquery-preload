/// <reference path="../define.ts"/>
/// <reference path="_template.ts"/>

/* CONTROLLER */

module MODULE.CONTROLLER {
  export class Main extends Template implements ControllerInterface {

    constructor(public model_: ModelInterface) {
      super(model_);
    }

    PRELOAD(event: JQueryEventObject): void {
      this.model_.PRELOAD(event);
    }
    CLICK(event: JQueryMouseEventObject): void {
      this.model_.CLICK(event);
    }
    MOUSEMOVE(event: JQueryMouseEventObject): void {
      this.model_.MOUSEMOVE(event);
    }
    MOUSEOVER(event: JQueryMouseEventObject): void {
      this.model_.MOUSEOVER(event);
    }
    MOUSEOUT(event: JQueryMouseEventObject): void {
      this.model_.MOUSEOUT(event);
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

}
