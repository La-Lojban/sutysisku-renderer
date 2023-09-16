"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNode = void 0;
var isNode = function (value) { return !!value && typeof value.nodeType === 'number'; };
exports.isNode = isNode;
