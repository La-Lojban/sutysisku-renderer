import { StoreOptions } from '../common/types';
import { dispatchCustomEvent } from '../common/functions';
import { DEFAULT_STORE_OPTIONS } from '../common/constants';

class Setter {
  data: any;
  constructor(
    data: any,
    setters: Record<string, (data: any, ...args: any[]) => any>,
    options: StoreOptions = DEFAULT_STORE_OPTIONS,
  ) {
    // Get store type
    this.data = {
      get() {
        return structuredClone(data);
      },
      set() {
        return true;
      },
    };

    for (const fn in setters) {
      if (typeof setters[fn] !== 'function') continue;
      Object.defineProperty(Setter.prototype, fn, {
        value: function (...args: any[]) {
          setters[fn](this.data, ...args);
          dispatchCustomEvent(options.eventKey);
        },
        writable: true,
        enumerable: false,
        configurable: true,
      });
    }
  }
}

function setter(data: object = {}, setters = {}, options: StoreOptions = DEFAULT_STORE_OPTIONS): Setter {
  return new Setter(data, setters, options);
}

export default setter;
