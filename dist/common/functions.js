"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElement = exports.dispatchCustomEvent = void 0;
function dispatchCustomEvent(_a) {
    var eventKey = _a.eventKey, target = _a.target, property = _a.property, value = _a.value, path = _a.path;
    var event = new CustomEvent(eventKey, {
        bubbles: true,
        cancelable: true,
        detail: {
            eventKey: eventKey,
            target: structuredClone(target),
            property: property,
            value: value,
            path: path !== null && path !== void 0 ? path : [],
        },
    });
    document.dispatchEvent(event);
}
exports.dispatchCustomEvent = dispatchCustomEvent;
function getElement(elem) {
    return elem ? (typeof elem === 'string' ? document.querySelector(elem) : elem) : null;
}
exports.getElement = getElement;
