import { RecursiveObject, StoreOptions } from '../common/types';
import { dispatchCustomEvent } from '../common/functions';
import { DEFAULT_STORE_OPTIONS } from '../common/constants';

const proxyCache = new WeakMap();
function createDeepOnChangeProxy<T extends RecursiveObject>(
  target: T,
  onChange: (target: T) => void,
  options: StoreOptions,
): T {
  return new Proxy(target, {
    get(target: T, property: keyof T) {
      const item = target[property];
      // if (property === 'update') {
      //   return function (value: Partial<T>) {
      //     for (const key in value) {
      //       (target as any)[key] = value[key];
      //     }
      //     onChange(target);
      //     // return item;
      //   };
      // }
      if (item && typeof item === 'object') {
        if (proxyCache.has(item)) return proxyCache.get(item);
        const proxy = createDeepOnChangeProxy<any>(item, onChange, options);
        proxyCache.set(item, proxy);
        return proxy;
      }
      return item;
    },
    set(target: T, property: keyof T, value: any) {
      if (target[property] instanceof Function) {
        return true;
      }
      if (target[property] !== value) {
        onChange(target);
      }
      target[property] = value;
      return true;
    },
    deleteProperty(target: T, property: keyof T): boolean {
      delete target[property];
      onChange(target);
      return true;
    },
  });
}

function store<T extends RecursiveObject>(data: T, options: StoreOptions = DEFAULT_STORE_OPTIONS): T {
  if (options.localCacheKey) data = { ...data, ...JSON.parse(localStorage.getItem(options.localCacheKey) ?? '{}') };
  return createDeepOnChangeProxy<T>(
    data,
    (target: T) => {
      dispatchCustomEvent(options.eventKey);
      if (options.localCacheKey) localStorage.setItem(options.localCacheKey, JSON.stringify(target));
    },
    options,
  );
}

export default store;
