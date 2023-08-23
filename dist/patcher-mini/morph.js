"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("./events");
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
function morph(newNode, oldNode) {
    var nodeType = newNode.nodeType;
    var nodeName = newNode.nodeName;
    if (nodeType === ELEMENT_NODE)
        copyAttrs(newNode, oldNode);
    if ([TEXT_NODE, COMMENT_NODE].includes(nodeType) && oldNode.nodeValue !== newNode.nodeValue)
        oldNode.nodeValue = newNode.nodeValue;
    // Some DOM nodes are weird
    // https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
    if (nodeName === 'INPUT')
        updateInput(newNode, oldNode);
    else if (nodeName === 'OPTION')
        updateOption(newNode, oldNode);
    else if (nodeName === 'TEXTAREA')
        updateTextarea(newNode, oldNode);
    copyEvents(newNode, oldNode);
}
exports.default = morph;
function copyAttrs(newNode, oldNode) {
    var oldAttrs = oldNode.attributes;
    var newAttrs = newNode.attributes;
    for (var _i = 0, _a = Array.from(newAttrs); _i < _a.length; _i++) {
        var attr = _a[_i];
        var attrName = attr.name;
        var attrNamespaceURI = attr.namespaceURI;
        var attrValue = attr.value;
        if (attrNamespaceURI) {
            attrName = attr.localName || attrName;
            var fromValue = oldNode.getAttributeNS(attrNamespaceURI, attrName);
            if (fromValue !== attrValue) {
                oldNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
            }
        }
        else {
            if (!oldNode.hasAttribute(attrName)) {
                oldNode.setAttribute(attrName, attrValue);
            }
            else {
                var fromValue = oldNode.getAttribute(attrName);
                if (fromValue !== attrValue) {
                    // apparently values are always cast to strings, ah well
                    if (attrValue === 'null' || attrValue === 'undefined') {
                        oldNode.removeAttribute(attrName);
                    }
                    else {
                        oldNode.setAttribute(attrName, attrValue);
                    }
                }
            }
        }
    }
    // Remove any extra attributes found on the original DOM element that
    // weren't found on the target element.
    for (var _b = 0, _c = Array.from(oldAttrs); _b < _c.length; _b++) {
        var attr = _c[_b];
        if (attr.specified !== false) {
            var attrName = attr.name;
            var attrNamespaceURI = attr.namespaceURI;
            if (attrNamespaceURI) {
                attrName = attr.localName || attrName;
                if (!newNode.hasAttributeNS(attrNamespaceURI, attrName)) {
                    oldNode.removeAttributeNS(attrNamespaceURI, attrName);
                }
            }
            else {
                if (!newNode.hasAttributeNS(null, attrName)) {
                    oldNode.removeAttribute(attrName);
                }
            }
        }
    }
}
function copyEvents(newNode, oldNode) {
    for (var _i = 0, events_2 = events_1.default; _i < events_2.length; _i++) {
        var ev = events_2[_i];
        if (newNode[ev]) {
            // if new element has a whitelisted attribute
            oldNode[ev] = newNode[ev]; // update existing element
        }
        else if (oldNode[ev]) {
            // if existing element has it and new one doesnt
            oldNode[ev] = undefined; // remove it from existing element
        }
    }
}
function updateOption(newNode, oldNode) {
    updateAttribute(newNode, oldNode, 'selected');
}
// The "value" attribute is special for the <input> element since it sets the
// initial value. Changing the "value" attribute without changing the "value"
// property will have no effect since it is only used to the set the initial
// value. Similar for the "checked" attribute, and "disabled".
function updateInput(newNode, oldNode) {
    var newValue = newNode.value;
    var oldValue = oldNode.value;
    updateAttribute(newNode, oldNode, 'checked');
    updateAttribute(newNode, oldNode, 'disabled');
    // The "indeterminate" property can not be set using an HTML attribute.
    // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox
    if (newNode.indeterminate !== oldNode.indeterminate) {
        oldNode.indeterminate = newNode.indeterminate;
    }
    // Persist file value since file inputs can't be changed programatically
    if (oldNode.type === 'file')
        return;
    if (newValue !== oldValue) {
        oldNode.setAttribute('value', newValue);
        oldNode.value = newValue;
    }
    if (newValue === 'null') {
        oldNode.value = '';
        oldNode.removeAttribute('value');
    }
    if (!newNode.hasAttributeNS(null, 'value')) {
        oldNode.removeAttribute('value');
    }
    else if (oldNode.type === 'range') {
        // this is so elements like slider move their UI thingy
        oldNode.value = newValue;
    }
}
function updateTextarea(newNode, oldNode) {
    var newValue = newNode.value;
    if (newValue !== oldNode.value) {
        oldNode.value = newValue;
    }
    if (oldNode.firstChild && oldNode.firstChild.nodeValue !== newValue) {
        // Needed for IE. Apparently IE sets the placeholder as the
        // node value and vise versa. This ignores an empty update.
        if (newValue === '' && oldNode.firstChild.nodeValue === oldNode.placeholder) {
            return;
        }
        oldNode.firstChild.nodeValue = newValue;
    }
}
function updateAttribute(newNode, oldNode, name) {
    if (newNode[name] !== oldNode[name]) {
        oldNode[name] = newNode[name];
        if (newNode[name]) {
            oldNode.setAttribute(name, '');
        }
        else {
            oldNode.removeAttribute(name);
        }
    }
}
