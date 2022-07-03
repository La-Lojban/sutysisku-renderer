declare type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;
declare type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<{
        [Q in P]: T[P];
    }, {
        -readonly [Q in P]: T[P];
    }, P>;
}[keyof T];
export declare type HScriptKeys = 'id' | 'class' | 'className' | 'addClass' | 'removeClass' | 'attributes' | 'style' | 'appendChildren' | 'children';
export declare type WritableNodeKeys = Pick<HTMLElement, WritableKeys<Node>>;
export interface VDOMElement extends HTMLElement {
    actualize?: (arg0: Document) => HTMLElement;
}
export declare type VDOMElementOrNull = VDOMElement | null;
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
export declare type SpecialAttrs = 'selected' | 'checked' | 'disabled';
export declare type SpecialWidgets = 'OPTION' | 'SELECT' | 'TEXTAREA' | 'INPUT';
export {};
