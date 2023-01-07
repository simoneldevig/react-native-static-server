/**
 * Simple listeneable data Emitter.
 * The implementation is adopted from `@dr.pogodin/react-utils`.
 * Docs: https://dr.pogodin.studio/docs/react-utils/docs/api/classes/Emitter
 */
export default class Emitter {
  listeners: Function[];

  /**
   * Creates a new Emitter.
   */
  constructor() {
    this.listeners = [];
  }

  /**
   * Returns "true" if any listener is connected; "false" otherwise.
   * @return {boolean}
   */
  get hasListeners() {
    return !!this.listeners.length;
  }

  /**
   * Adds `listener` if it is not already connected.
   * @param {function} listener
   * @return {function} Unsubscribe function.
   */
  addListener(listener: Function) {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
    return () => this.removeListener(listener);
  }

  /**
   * Calls every connected listener with the given arguments.
   * @param  {...any} args
   */
  emit(...args: any[]) {
    const {listeners} = this;
    for (let i = 0; i < listeners.length; ++i) {
      listeners[i](...args);
    }
  }

  /**
   * Removes specified `listener`, if connected.
   * @param {function} listener
   */
  removeListener(listener: Function) {
    const idx = this.listeners.indexOf(listener);
    if (idx >= 0) this.listeners.splice(idx, 1);
  }
}
