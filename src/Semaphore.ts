import { Barrier } from './Barrier';

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

  get ready() { return this._ready; }

  setReady(ready: boolean) {
    const bool = !!ready;
    if (this._ready !== bool) {
      this._ready = bool;
      if (bool && !this._draining) this._drainQueue();
    }
  }

  /**
   * Waits until the semaphore is ready, and marks it as non-ready (seizes it).
   * @return {Promise}
   */
  async seize() {
    await this.waitReady();
    this.setReady(false);
  }

  async waitReady() {
    if (!this._ready || this._queue.length) {
      const barrier = new Barrier();
      this._queue.push(barrier);
      await <Promise<any>>barrier;
      this._queue.shift();
    }
  }

  // Private members below this point.

  /**
   * If semaphore is ready, it releases the next barrier in the queue, if any,
   * and reschedules itself for a call in the next event loop iteration.
   * Otherwise, it breaks the queue draining loop, which will be restarted
   * the next time the semaphore is set ready.
   */
  _drainQueue() {
    if (this._ready && this._queue.length) {
      this._queue[0].resolve();

      // Re-schedules itself for the next event loop iteration.
      if (this._queue.length) {
        setTimeout(this._drainQueue.bind(this));
        this._draining = true;
        return; // Exit here to avoid the drain loop termination below.
      }
    }

    // Cleans up for the drain loop termination.
    this._draining = false;
  }

  // "true" when the drain queue process is running (and thus no need to start
  // a new one).
  _draining = false;

  // The array of barriers set for each async code flow awaiting for
  // the Semaphore to become ready.
  _queue: Barrier[] = [];

  _ready;
}
