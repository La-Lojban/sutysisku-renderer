"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveChildren = exports.createElementNS = exports.compareNodeNames = exports.amendAttributes = void 0;
var constants_1 = require("../common/constants");
var constants_2 = require("../common/constants");
function amendAttributes(fromNode, toNode) {
    var _a, _b;
    // document-fragments dont have attributes so lets not do anything
    if ([toNode.nodeType, fromNode.nodeType].includes(constants_2.DOCUMENT_FRAGMENT_NODE))
        return;
    // amend attributes on original DOM element
    for (var _i = 0, _c = Array.from(toNode.attributes); _i < _c.length; _i++) {
        var attr = _c[_i];
        var attrName = attr.name;
        var attrNamespaceURI = attr.namespaceURI;
        var attrValue = attr.value;
        if (attrNamespaceURI) {
            attrName = (_a = attr.localName) !== null && _a !== void 0 ? _a : attrName;
            var fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
            if (fromValue !== attrValue) {
                if (attr.prefix === 'xmlns') {
                    attrName = attr.name; // It's not allowed to set an attribute with the XMLNS namespace without specifying the `xmlns` prefix
                }
                fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
            }
        }
        else {
            var fromValue = fromNode.getAttribute(attrName);
            if (fromValue !== attrValue) {
                fromNode.setAttribute(attrName, attrValue);
            }
        }
    }
    // Remove any extra attributes found on the original DOM element that
    // weren't found on the target element.
    for (var _d = 0, _e = Array.from(fromNode.attributes); _d < _e.length; _d++) {
        var attr = _e[_d];
        var attrName = attr.name;
        var attrNamespaceURI = attr.namespaceURI;
        if (attrNamespaceURI) {
            attrName = (_b = attr.localName) !== null && _b !== void 0 ? _b : attrName;
            if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
                fromNode.removeAttributeNS(attrNamespaceURI, attrName);
            }
        }
        else {
            if (!toNode.hasAttribute(attrName)) {
                fromNode.removeAttribute(attrName);
            }
        }
    }
}
exports.amendAttributes = amendAttributes;
/**
 * Returns true if two node's names are the same.
 *
 * NOTE: We don't bother checking `namespaceURI` because you will never find two HTML elements with the same
 *       nodeName and different namespace URIs.
 * @return {boolean}
 */
function compareNodeNames(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;
    if (fromNodeName === toNodeName)
        return true;
    var fromCodeStart = fromNodeName.charCodeAt(0);
    var toCodeStart = toNodeName.charCodeAt(0);
    // If the target element is a virtual DOM node or SVG node then we may
    // need to normalize the tag name before comparing. Normal HTML elements that are
    // in the "http://www.w3.org/1999/xhtml"
    // are converted to upper case
    if (fromCodeStart <= 90 && toCodeStart >= 97) {
        // from is upper and to is lower
        return fromNodeName === toNodeName.toUpperCase();
    }
    else if (toCodeStart <= 90 && fromCodeStart >= 97) {
        // to is upper and from is lower
        return toNodeName === fromNodeName.toUpperCase();
    }
    return false;
}
exports.compareNodeNames = compareNodeNames;
/**
 * Create an element, optionally with a known namespace URI.
 *
 * @param {string} name the element name, e.g. 'div' or 'svg'
 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
 * its `xmlns` attribute or its inferred namespace.
 *
 * @return {HTMLElement}
 */
function createElementNS(name, namespaceURI) {
    return [constants_1.NS_XHTML, null].includes(namespaceURI)
        ? document.createElement(name)
        : document.createElementNS(namespaceURI, name);
}
exports.createElementNS = createElementNS;
/**
 * Copies the children of one DOM element to another DOM element
 */
function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
        var nextChild = curChild.nextSibling;
        toEl.appendChild(curChild);
        curChild = nextChild;
    }
    return toEl;
}
exports.moveChildren = moveChildren;
