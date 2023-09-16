import { StoreOptions } from './types';

function dispatchCustomEvent<T>({
  eventKey,
  target,
  property,
  value,
  path,
}: {
  eventKey: string;
  target: T;
  property: keyof T;
  value?: any;
  path: StoreOptions['path'];
}) {
  const event = new CustomEvent(eventKey, {
    bubbles: true,
    cancelable: true,
    detail: {
      eventKey,
      target: structuredClone(target),
      property,
      value,
      path: path ?? [],
    },
  });
  document.dispatchEvent(event);
}

function getElement(elem?: string | Element | null): Element | null {
  return elem ? (typeof elem === 'string' ? document.querySelector(elem) : elem) : null;
}

export { dispatchCustomEvent, getElement };
