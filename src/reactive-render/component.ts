import { DEFAULT_COMPONENT_OPTIONS } from '../common/constants';
import { ChangedProperty, ComponentOptions, RecursiveObject, RenderTemplate, StoreOptions } from '../common/types';
import patchDOM from '../patcher-mini';

function createJsonObjectFromDotPath<T extends RecursiveObject>(
  oldState: T = {} as T,
  path: StoreOptions['path'] = [],
  value: any,
) {
  let currentObj = oldState;
  if (path.length === 0) return value;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    (currentObj as any)[key as keyof T] = {};
    currentObj = (currentObj as any)[key];
  }

  (currentObj as any)[path[path.length - 1]] = value;

  return oldState;
}

class Component {
  previousState: { [key: string]: RecursiveObject } = {};
  newStateAmendments: { [key: string]: RecursiveObject } = {};
  element: Element | string;
  newElementClosure: RenderTemplate;
  debounce: number | null;
  options: ComponentOptions;

  constructor(
    element: Element | string,
    newElementClosure: RenderTemplate,
    options: ComponentOptions = DEFAULT_COMPONENT_OPTIONS,
  ) {
    this.element = element;
    this.newElementClosure = newElementClosure;
    this.debounce = null;
    this.options = options;

    this.startReactiveSyncing();
  }

  startReactiveSyncing() {
    this.options.eventKeys.forEach((eventKey) => {
      this.previousState[eventKey] = {};
      // this.newStateAmendments[eventKey] = {};
      document.addEventListener(eventKey, this.render as any);
    });

    this.render({ detail: {} });
  }

  render = ({ detail }: { detail: Partial<ChangedProperty> }) => {
    if (detail.property !== undefined && detail.eventKey !== undefined) {
      this.newStateAmendments[detail.eventKey] = createJsonObjectFromDotPath(
        this.newStateAmendments[detail.eventKey] ?? {},
        detail.path?.concat([detail.property]),
        detail.value,
      );
    }

    if (this.debounce) window.cancelAnimationFrame(this.debounce);

    this.debounce = window.requestAnimationFrame(async () => {
      // this.element = await this.newElementClosure();
      const n = await this.newElementClosure();
      patchDOM(this.element, n);
      setTimeout(() => {
        if (this.options.afterRender && detail.eventKey !== undefined)
          this.options.afterRender({
            eventKey: detail.eventKey,
            newStateAmendments: structuredClone(this.newStateAmendments[detail.eventKey]),
            previousState: structuredClone(this.previousState[detail.eventKey]),
          });
        if (detail.property !== undefined && detail.target !== undefined && detail.eventKey !== undefined) {
          this.previousState[detail.eventKey] = createJsonObjectFromDotPath(
            this.previousState[detail.eventKey],
            detail.path ?? [],
            structuredClone(detail.target),
          );
          delete this.newStateAmendments[detail.eventKey];
        }
      }, 0);

      // Array.from(document.querySelectorAll(`[data-command]`)).forEach((element) => {
      //   const attribute = element.getAttribute(`[data-command]`);
      //   const value = element.getAttribute(`[data-command-value]`);
      //   if (attribute) {
      //     if (value !== null) {
      //       (element as any)[attribute] = value;
      //     }
      //   }
      // });
    });
  };
}

export default (elem: Element | string, template: RenderTemplate, options: ComponentOptions) =>
  new Component(elem, template, options);
