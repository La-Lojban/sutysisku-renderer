"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.h = void 0;
var predicates_1 = require("./predicates");
var h = function (primer) {
    var _a;
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var isInputHTMLElement = primer instanceof HTMLElement;
    var targetHTML;
    var id;
    if (isInputHTMLElement) {
        targetHTML = document.createElement(primer.tagName);
    }
    else {
        var parts = primer.split(/(?=[#.])/);
        id = (_a = parts.find(function (element) { return element.startsWith('#'); })) === null || _a === void 0 ? void 0 : _a.replace('#', '');
        var tagName = parts.find(function (element) { return /^[a-z]/.test(element); });
        targetHTML = document.createElement(tagName !== null && tagName !== void 0 ? tagName : 'div');
        if (id)
            targetHTML.id = id;
        var classes = parts.filter(function (element) { return element.startsWith('.'); }).map(function (i) { return i.replace(/^\./, ''); });
        if (classes.length > 0)
            targetHTML.className = classes.join(' ');
    }
    for (var _b = 0, args_1 = args; _b < args_1.length; _b++) {
        var arg = args_1[_b];
        if (!arg)
            continue;
        if (typeof arg === 'string' || typeof arg === 'number') {
            targetHTML.appendChild(document.createTextNode(arg.toString()));
        }
        else if ((0, predicates_1.isNode)(arg)) {
            targetHTML.appendChild(arg);
        }
        else {
            try {
                for (var _c = 0, _d = Object.entries(arg); _c < _d.length; _c++) {
                    var _e = _d[_c], key = _e[0], value = _e[1];
                    if (value == null)
                        continue;
                    if (value instanceof Function) {
                        targetHTML.addEventListener(key, value);
                        continue;
                    }
                    switch (key) {
                        case 'class':
                        case 'className':
                            targetHTML.className = (targetHTML.className +
                                ' ' +
                                (Array.isArray(value) ? value.filter(Boolean).join(' ') : String(value))).trim();
                            break;
                        case 'attributes':
                            for (var _f = 0, _g = Object.entries(value); _f < _g.length; _f++) {
                                var _h = _g[_f], attr = _h[0], attrValue = _h[1];
                                if (attrValue != null)
                                    targetHTML.setAttribute(attr, attrValue);
                            }
                            break;
                        case 'style':
                            if (typeof value === 'string') {
                                targetHTML.setAttribute('style', value);
                            }
                            else {
                                Object.assign(targetHTML.style, value);
                            }
                            break;
                        case 'src':
                            if (targetHTML instanceof HTMLImageElement)
                                targetHTML.src = String(value);
                            break;
                        case 'alt':
                            if (targetHTML instanceof HTMLImageElement)
                                targetHTML.alt = String(value);
                            break;
                        case 'href':
                            if (targetHTML instanceof HTMLAnchorElement)
                                targetHTML.href = String(value);
                            break;
                        // case 'innerText':
                        //   targetHTML.innerText = String(value);
                        //   break;
                        // case 'innerHTML':
                        //   targetHTML.innerHTML = String(value);
                        //   break;
                        // case 'textContent':
                        //   targetHTML.textContent = String(value);
                        //   break;
                        default:
                            if (key === 'id' && (isInputHTMLElement || targetHTML.id))
                                continue;
                            targetHTML[key] = String(value);
                    }
                }
            }
            catch (error) {
                console.error(error);
                return targetHTML;
            }
        }
    }
    return targetHTML;
};
exports.h = h;
