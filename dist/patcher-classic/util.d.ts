export declare function amendAttributes(fromNode: HTMLElement, toNode: HTMLElement): void;
/**
 * Returns true if two node's names are the same.
 *
 * NOTE: We don't bother checking `namespaceURI` because you will never find two HTML elements with the same
 *       nodeName and different namespace URIs.
 * @return {boolean}
 */
export declare function compareNodeNames(fromEl: HTMLElement, toEl: HTMLElement): boolean;
/**
 * Create an element, optionally with a known namespace URI.
 *
 * @param {string} name the element name, e.g. 'div' or 'svg'
 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
 * its `xmlns` attribute or its inferred namespace.
 *
 * @return {HTMLElement}
 */
export declare function createElementNS(name: string, namespaceURI: string | null): HTMLElement;
/**
 * Copies the children of one DOM element to another DOM element
 */
export declare function moveChildren(fromEl: HTMLElement, toEl: HTMLElement): HTMLElement;
