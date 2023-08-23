import { DEFAULT_COMPONENT_OPTIONS } from '../common/constants';
import { ComponentOptions, RenderTemplate } from '../common/types';
import patchDOM from '../patcher-mini';

class Component {
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
      document.addEventListener(eventKey, this.render);
    });

    this.render();
  }

  render = () => {
    if (this.debounce) window.cancelAnimationFrame(this.debounce);

    this.debounce = window.requestAnimationFrame(async () => {
      // this.element = await this.newElementClosure();
      console.log('prepatch', new Date().getTime());
      const n = await this.newElementClosure();
      console.log('afterpatch', new Date().getTime());
      patchDOM(this.element, n);
      if (this.options.afterRender) this.options.afterRender();
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
