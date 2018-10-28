import { resolve, reject } from 'rsvp';

export default class PromiseToken {
  constructor(promise) {
    this._isCancelled = false;
    this._isFlushed = false;
    this._cbs = [];
    this.promise = resolve(promise)
      .then(
        (v) => { return this._flush(true, v); },
        (e) => { return this._flush(false, e); }
      );
  }

  _flush(shouldResolve, value) {
    if (this.isCancelled) {
      return;
    }

    let chain = shouldResolve ? resolve(value) : reject(value);
    let cbs = this._cbs;

    for (let i = 0; i < cbs.length; i+=2) {
      chain = chain.then(cbs[i], cbs[i + 1]);
    }

    this._chain = chain;
    cbs.length = 0;
    this._isFlushed = true;
  }

  then(success, fail) {
    if (this.isDestroyed) {
      throw new Error('Cannot .then a destroyed PromiseToken');
    }
    if (!this.isCancelled && !this._isFlushed) {
      this._cbs.push(success, fail);
    }
    if (this._isFlushed) {
      return this._chain.then(success, fail);
    }

    return this;
  }

  destroy() {
    this.isDestroyed = true;
    this.cancel();
    this._cbs = null;
    this.promise = null;
  }

  cancel() {
    this._isCancelled = true;
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
