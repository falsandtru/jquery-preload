/// <reference path="../define.ts"/>
/// <reference path="../model/main.ts"/>

/* CONTROLLER */

module MODULE {
  export class ControllerFunction implements FunctionInterface {

    enable(): any {
      M.state_ = State.ready;
      return this;
    }

    disable(): any {
      M.state_ = State.lock;
      return this;
    }
  }
}
