type Resolver = (value?: any) => void;
type Rejecter = (error: Error) => void;

/**
 * Barrier is just a Promise which has resolve and reject exposed as instance
 * methods.
 *
 * The implementation is adopted from `@dr.pogodin/react-utils`, with private
 * fields replaced by underscore-prefixed public fields to avoid issues with
 * React Native, for which see:
 * https://github.com/birdofpreyru/react-native-static-server/issues/6
 * https://github.com/birdofpreyru/react-native-static-server/issues/9
 *
 * Docs: https://dr.pogodin.studio/docs/react-utils/docs/api/classes/Barrier
 */
export class Barrier extends Promise<any> {
  _resolve: Resolver;

  _resolved = false;

  _reject: Rejecter;

  _rejected = false;

  constructor(executor?: Function) {
    let resolveRef: Resolver;
    let rejectRef: Rejecter;
    super((resolve, reject) => {
      resolveRef = (value: any) => {
        resolve(value);
        this._resolved = true;
      };
      rejectRef = (error: Error) => {
        reject(error);
        this._rejected = true;
      };
      if (executor) executor(resolveRef, rejectRef);
    });
    this._resolve = resolveRef!;
    this._reject = rejectRef!;
  }

  get resolve() {
    return this._resolve;
  }

  get resolved() {
    return this._resolved;
  }

  get reject() {
    return this._reject;
  }

  get rejected() {
    return this._rejected;
  }

  then(onFulfilled: any, onRejected: any) {
    const res = <Barrier>super.then(onFulfilled, onRejected);
    res._resolve = this._resolve;
    res._reject = this._reject;
    return res;
  }
}
