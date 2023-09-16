"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COMPONENT_OPTIONS = exports.DEFAULT_STORE_OPTIONS = exports.NS_XHTML = exports.COMMENT_NODE = exports.TEXT_NODE = exports.DOCUMENT_FRAGMENT_NODE = exports.ELEMENT_NODE = void 0;
exports.ELEMENT_NODE = 1;
exports.DOCUMENT_FRAGMENT_NODE = 11;
exports.TEXT_NODE = 3;
exports.COMMENT_NODE = 8;
exports.NS_XHTML = 'http://www.w3.org/1999/xhtml';
exports.DEFAULT_STORE_OPTIONS = {
    eventKey: 'sutysisku-event',
    path: [],
};
exports.DEFAULT_COMPONENT_OPTIONS = {
    eventKeys: ['sutysisku-event'],
    // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-pattern
    afterRender: function (_a) { },
};
