import { StoreOptions } from './types';
export declare const ELEMENT_NODE = 1;
export declare const DOCUMENT_FRAGMENT_NODE = 11;
export declare const TEXT_NODE = 3;
export declare const COMMENT_NODE = 8;
export declare const NS_XHTML = "http://www.w3.org/1999/xhtml";
export declare const DEFAULT_STORE_OPTIONS: StoreOptions;
export declare const DEFAULT_COMPONENT_OPTIONS: {
    eventKeys: string[];
    afterRender: ({}: {}) => void;
};
