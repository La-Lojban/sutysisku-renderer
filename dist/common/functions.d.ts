import { StoreOptions } from './types';
declare function dispatchCustomEvent<T>({ eventKey, target, property, value, path, }: {
    eventKey: string;
    target: T;
    property: keyof T;
    value?: any;
    path: StoreOptions['path'];
}): void;
declare function getElement(elem?: string | Element | null): Element | null;
export { dispatchCustomEvent, getElement };
