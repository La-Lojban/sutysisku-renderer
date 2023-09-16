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
    path?: string[];
};
export type ChangedProperty = {
    eventKey: string;
    target: RecursiveObject;
    property: string;
    value?: any;
    path: StoreOptions['path'];
};
export type ComponentOptions = {
    eventKeys: string[];
    afterRender: (t: {
        eventKey: string;
        previousState: RecursiveObject;
        newStateAmendments: RecursiveObject;
    }) => void;
};
export type Primitive = string | number | boolean;
export type RecursiveObject = {
    [key: string | symbol]: Primitive | Array<RecursiveObject> | RecursiveObject | undefined;
};
export type ElAttr = Record<string, unknown>;
export type ElChild = string | number | Node;
export type ElArg = ElChild | Partial<ElAttr> | null | undefined | false | SvgArg;
type HtmlKey = keyof HTMLElementTagNameMap;
export type H = {
    <K extends HtmlKey>(tagName: K, ...args: ElArg[]): HTMLElementTagNameMap[K];
    (tagName: string, ...args: ElArg[]): HTMLElement;
};
type SvgKey = keyof SVGElementTagNameMap;
export type SvgAttr = Record<string, unknown>;
export type SvgArg = SvgAttr | Node;
export type S = {
    <K extends SvgKey>(tagName: K, ...args: SvgArg[]): SVGElementTagNameMap[K];
};
export type RenderTemplate = () => Element | Promise<Element>;
export {};
