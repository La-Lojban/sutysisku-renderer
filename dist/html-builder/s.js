"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s = exports.svgNs = void 0;
exports.svgNs = 'http://www.w3.org/2000/svg';
var predicates_1 = require("./predicates");
var s = function (tagName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var element = document.createElementNS(exports.svgNs, tagName);
    for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
        var arg = args_1[_a];
        if (!arg)
            continue;
        if ((0, predicates_1.isNode)(arg)) {
            element.appendChild(arg);
        }
        else {
            try {
                for (var _b = 0, _c = Object.entries(arg); _b < _c.length; _b++) {
                    var _d = _c[_b], key = _d[0], value = _d[1];
                    if (value == null)
                        continue;
                    element.setAttribute(key, value);
                }
            }
            catch (error) {
                console.error(error);
                return element;
            }
        }
    }
    return element;
};
exports.s = s;
