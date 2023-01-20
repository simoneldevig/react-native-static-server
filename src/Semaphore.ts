import {Barrier} from './Barrier';

/**
 * Implements a simple semaphore for async code logic.
 *
 * The implementation is adopted from `@dr.pogodin/react-utils`, with private
 * fields replaced by underscore-prefixed public fields to avoid issues with
 * React Native, for which see:
 * https://github.com/birdofpreyru/react-native-static-server/issues/6
 * https://github.com/birdofpreyru/react-native-static-server/issues/9
 *
 * Docs: https://dr.pogodin.studio/docs/react-utils/docs/api/classes/Semaphore
 */
export default class Semaphore {
  constructor(ready: boolean) {
    this._ready = !!ready;
  }

  get ready() {
    return this._ready;
  }

  setReady(ready: boolean) {
    const bool = !!ready;
    if (this._ready !== bool) {
      this._ready = bool;
      if (bool && !this._draining && this._queue.length) this._drainQueue();
    }
  }

  /**
   * Waits until the semaphore is ready, and marks it as non-ready (seizes it).
   * @return {Promise}
   */
  async seize() {
    return this.waitReady(true);
  }

  async waitReady(seize = false) {
    if (!this._ready || this._queue.length) {
      const barrier: Barrier<void> = new Barrier();
      this._queue.push(barrier);
      await (<Promise<any>>barrier);
      if (seize) this._ready = false;
      this._drainLock!.resolve();
    } else if (seize) this._ready = false;
  }

  // Private members below this point.

  /**
   * If semaphore is ready, it releases the next barrier in the queue, if any,
   * and reschedules itself for a call in the next event loop iteration.
   * Otherwise, it breaks the queue draining loop, which will be restarted
   * the next time the semaphore is set ready.
   */
  async _drainQueue() {
    this._draining = true;
    while (this._ready && this._queue.length) {
      this._drainLock = new Barrier();
      this._queue[0].resolve();
      await this._drainLock; // eslint-disable-line no-await-in-loop
      this._queue.shift();
    }
    this._draining = false;
    this._drainLock = null;
  }

  // "true" when the drain queue process is running (and thus no need to start
  // a new one).
  _draining = false;

  // Each time a Promise from drain queue is resolved this drainLock is set
  // to block further queue draining until the promise resolution handler
  // (.seize() or .waitReady()) unlocks it, thus confirming it is fine
  // to continue the draining. This is specifically important for .seize(),
  // which should have a chance to switch semaphore state to non-ready prior
  // to next Promise in the queue being unlocked.
  _drainLock: Barrier<void> | null = null;

  // The array of barriers set for each async code flow awaiting for
  // the Semaphore to become ready.
  _queue: Barrier<void>[] = [];

  _ready;
}
