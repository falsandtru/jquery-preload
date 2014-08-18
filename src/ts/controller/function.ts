/// <reference path="../define.ts"/>

/* CONTROLLER */

module MODULE.CONTROLLER {
  var M: ModelInterface
  var C: ControllerInterface

  export class ControllerFunction implements FunctionInterface {

    constructor(controller: ControllerInterface, model: ModelInterface) {
      M = model;
      C = controller;
    }

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
