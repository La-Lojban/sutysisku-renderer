export interface VDOMElement extends HTMLElement {
  actualize?: (arg0: Document) => HTMLElement;
}

export type VDOMElementOrNull = VDOMElement | null;

export interface PatchDOMOptions {
  getNodeKey?: (node: HTMLElement) => string | undefined;
  onBeforeNodeAdded?: (node: HTMLElement) => HTMLElement;
  onNodeAdded?: (node: HTMLElement) => HTMLElement;
  onBeforeElUpdated?: (fromEl: HTMLElement, toEl: HTMLElement) => boolean;
  onElUpdated?: (el: HTMLElement) => void;
  onBeforeNodeDiscarded?: (node: HTMLElement) => boolean;
  onNodeDiscarded?: (node: HTMLElement) => void;
  onBeforeElChildrenUpdated?: (fromEl: HTMLElement, toEl: HTMLElement) => boolean;
  childrenOnly?: boolean;
}

export type SpecialAttrs = 'selected' | 'checked' | 'disabled';

export type SpecialWidgets = 'OPTION' | 'SELECT' | 'TEXTAREA' | 'INPUT';

export type StoreOptions = {
  localCacheKey?: string;
  eventKey: string;
};

export type ComponentOptions = {
  eventKeys: string[];
  afterRender?: () => void;
};

export type Primitive = string | number | boolean;
export type RecursiveObject = {
  [key: string | symbol]: Primitive | Array<RecursiveObject> | RecursiveObject | undefined;
};

// type ValueOf<T> = T[keyof T];
// type AllKeys<T> = T extends any ? keyof T : never;

// type HTMLElementUnion = HTMLElement | HTMLInputElement; // ValueOf<HTMLElementTagNameMap>;

// type ElAttrKey = 'attributes' | 'events' | 'style' | 'class' | 'className' | 'innerHTML' | 'textContent' | AllKeys<HTMLElementUnion>;

export type ElAttr = Record<string, unknown>;

export type ElChild = string | number | Node;

export type ElArg = ElChild | Partial<ElAttr> | null | undefined | false;

type HtmlKey = keyof HTMLElementTagNameMap;

export type H = {
  <K extends HtmlKey>(tagName: K, ...args: ElArg[]): HTMLElementTagNameMap[K];
  (tagName: string, ...args: ElArg[]): HTMLElement;
};

export type RenderTemplate = () => Element | Promise<Element>;
