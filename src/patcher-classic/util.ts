import { NS_XHTML } from '../common/constants';
import { DOCUMENT_FRAGMENT_NODE } from '../common/constants';

export function amendAttributes(fromNode: HTMLElement, toNode: HTMLElement): void {
  // document-fragments dont have attributes so lets not do anything
  if ([toNode.nodeType, fromNode.nodeType].includes(DOCUMENT_FRAGMENT_NODE)) return;

  // amend attributes on original DOM element
  for (const attr of Array.from(toNode.attributes)) {
    let attrName = attr.name;
    const attrNamespaceURI = attr.namespaceURI;
    const attrValue = attr.value;

    if (attrNamespaceURI) {
      attrName = attr.localName ?? attrName;
      const fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);

      if (fromValue !== attrValue) {
        if (attr.prefix === 'xmlns') {
          attrName = attr.name; // It's not allowed to set an attribute with the XMLNS namespace without specifying the `xmlns` prefix
        }
        fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
      }
    } else {
      const fromValue = fromNode.getAttribute(attrName);

      if (fromValue !== attrValue) {
        fromNode.setAttribute(attrName, attrValue);
      }
    }
  }

  // Remove any extra attributes found on the original DOM element that
  // weren't found on the target element.
  for (const attr of Array.from(fromNode.attributes)) {
    let attrName = attr.name;
    const attrNamespaceURI = attr.namespaceURI;

    if (attrNamespaceURI) {
      attrName = attr.localName ?? attrName;

      if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
        fromNode.removeAttributeNS(attrNamespaceURI, attrName);
      }
    } else {
      if (!toNode.hasAttribute(attrName)) {
        fromNode.removeAttribute(attrName);
      }
    }
  }
}

/**
 * Returns true if two node's names are the same.
 *
 * NOTE: We don't bother checking `namespaceURI` because you will never find two HTML elements with the same
 *       nodeName and different namespace URIs.
 * @return {boolean}
 */
export function compareNodeNames(fromEl: HTMLElement, toEl: HTMLElement): boolean {
  const fromNodeName = fromEl.nodeName;
  const toNodeName = toEl.nodeName;

  if (fromNodeName === toNodeName) return true;

  const fromCodeStart = fromNodeName.charCodeAt(0);
  const toCodeStart = toNodeName.charCodeAt(0);

  // If the target element is a virtual DOM node or SVG node then we may
  // need to normalize the tag name before comparing. Normal HTML elements that are
  // in the "http://www.w3.org/1999/xhtml"
  // are converted to upper case
  if (fromCodeStart <= 90 && toCodeStart >= 97) {
    // from is upper and to is lower
    return fromNodeName === toNodeName.toUpperCase();
  } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
    // to is upper and from is lower
    return toNodeName === fromNodeName.toUpperCase();
  }

  return false;
}

/**
 * Create an element, optionally with a known namespace URI.
 *
 * @param {string} name the element name, e.g. 'div' or 'svg'
 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
 * its `xmlns` attribute or its inferred namespace.
 *
 * @return {HTMLElement}
 */
export function createElementNS(name: string, namespaceURI: string | null): HTMLElement {
  return [NS_XHTML, null].includes(namespaceURI)
    ? document.createElement(name)
    : (document.createElementNS(namespaceURI, name) as HTMLElement);
}

/**
 * Copies the children of one DOM element to another DOM element
 */
export function moveChildren(fromEl: HTMLElement, toEl: HTMLElement) {
  let curChild = fromEl.firstChild;
  while (curChild) {
    const nextChild = curChild.nextSibling;
    toEl.appendChild(curChild);
    curChild = nextChild;
  }
  return toEl;
}
