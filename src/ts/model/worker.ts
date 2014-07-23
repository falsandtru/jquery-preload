/// <reference path="../define.ts"/>

/* MODEL */

interface Worker {
  close(): Worker
}
module MODULE {
  export class WorkerManager {
    constructor(mode: string = 'FIFO', limit: number = 3) {
      try {
        this.limit = limit;
        var worker = this.work('self.close()');
        if (1 !== this.count) { throw 'error' }
        worker.terminate();
        if (0 !== this.count) { throw 'error' }
      } catch (e) {
        this.limit = limit = 0;
      }
      switch (mode = mode.toUpperCase()) {
        case 'FILO':
        case 'LIFO':
          this.abortable_ = false;
          break;
        case 'FIFO':
        case 'LILO':
        default:
          this.abortable_ = true;
          break;
      }
    }

    count: number = 0
    limit: number
    workers_: { [index: string]: Worker } = {}
    workerGroup_: {
      [index: string]: {
        worker: { [index: string]: Worker }
        count: number
        limit: number
      }
    }
    abortable_: boolean
    worker_(job: string[]): Worker {
      return new Worker(URL.createObjectURL(new Blob(job, { type: "text/javascript" })));
    }
    uuid_():string {
      // version 4
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16).toUpperCase();
      });
    }
    clean_(uuid: string, tag: string): void {
      delete this.workers_[uuid];
      this.count && --this.count
      if (tag && this.workerGroup_[tag].count) {
        delete this.workerGroup_[tag].worker[uuid];
        --this.workerGroup_[tag].count;
      }
    }
    abort_(uuid: string, tag: string): void {
      this.clean_(uuid, tag);
    }
    defineClose_(worker: Worker, uuid: string, tag: string): void {
      Object.defineProperty(worker, 'close', {
        enumerable: true,
        configurable: true,
        writable: true,
        value: function () {
          this.clean_(uuid, tag);
          this.postMessage('WM:CLOSE:' + uuid);
        }
      });
    }
    defineTerminate_(worker: Worker, uuid: string, tag: string): void {
      Object.defineProperty(worker, '__terminate__', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: worker.terminate
      });
      worker.terminate = () => {
        this.clean_(uuid, tag);
        worker['__terminate__']();
      };
    }
    
    work(job: string): Worker
    work(job: Function): Worker
    work(job: string[]): Worker
    work(job: Function[]): Worker
    work(job: string, tag: string, limit?: number): Worker
    work(job: Function, tag: string, limit?: number): Worker
    work(job: string[], tag: string, limit?: number): Worker
    work(job: Function[], tag: string, limit?: number): Worker
    work(job: any, tag?: string, limit: number = this.limit): Worker {
      if (!(job instanceof Array)) {
        job = [job];
      }
      if ('function' === typeof job[0]) {
        var regexp = /^[^{]*\{|\}[^}]*$/g;
        for (var i = job.length; i--;) {
          job[i] = job[i].toString().replace(regexp, '');
        }
      }
      //job.push(';self.addEventListener("message", function(e) {"WM:CLOSE:' + uuid + '" === e.data && self.close();}, false);');
      var uuid = this.uuid_(),
          worker = this.worker_(job);
      this.workers_[uuid] = worker;
      ++this.count;
      if (tag) {
        this.workerGroup_[tag] = this.workerGroup_[tag] || {
          worker: {},
          limit: Math.min(limit, this.limit),
          count: 0
        };
        this.workerGroup_[tag].worker[uuid] = worker;
        ++this.workerGroup_[tag].count;
      }

      //this.defineClose_(worker, uuid, tag);
      this.defineTerminate_(worker, uuid, tag);
      return worker;
    }

  }
  // 短縮登録
  export var WM = new WorkerManager();
}
