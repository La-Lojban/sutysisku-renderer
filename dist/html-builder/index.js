"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = exports.amend = void 0;
var patcher_mini_1 = require("../patcher-mini");
function amend(oldEl, json) {
    render.bind({ amend: true })(oldEl, json);
}
exports.amend = amend;
function render(primer, json) {
    var _a, _b;
    var _c;
    var targetHTML;
    var isInputHTMLElement = primer instanceof HTMLElement;
    if (isInputHTMLElement) {
        targetHTML = primer.cloneNode(true);
    }
    else {
        targetHTML = document.createElement((_c = primer) !== null && _c !== void 0 ? _c : 'div');
    }
    try {
        for (var _i = 0, _d = Object.keys(json); _i < _d.length; _i++) {
            var key = _d[_i];
            var value = json[key];
            if (value === null)
                continue;
            switch (key) {
                case 'id':
                    if (isInputHTMLElement)
                        continue;
                    else
                        targetHTML[key] = value;
                    break;
                case 'class':
                case 'className':
                    targetHTML.className = Array.isArray(value) ? value.filter(Boolean).join(' ') : value;
                    break;
                case 'addClass':
                    (_a = targetHTML.classList).add.apply(_a, (!Array.isArray(value) ? value.split(' ') : value).filter(Boolean));
                    break;
                case 'removeClass':
                    (_b = targetHTML.classList).remove.apply(_b, (!Array.isArray(value) ? value.split(' ') : value).filter(Boolean));
                    break;
                case 'attributes':
                    for (var _e = 0, _f = Object.keys(value); _e < _f.length; _e++) {
                        var attr = _f[_e];
                        if (value[attr] !== null)
                            targetHTML.setAttribute(attr, value[attr]);
                    }
                    break;
                case 'style':
                    for (var _g = 0, _h = Object.keys(value); _g < _h.length; _g++) {
                        var attr = _h[_g];
                        if (value[attr] !== null)
                            targetHTML.style[attr] = value[attr];
                    }
                    break;
                case 'appendChildren':
                    if (Array.isArray(value))
                        value.filter(Boolean).forEach(function (sub) { return targetHTML.appendChild(sub); });
                    else if (value !== null)
                        targetHTML.appendChild(value);
                    break;
                case 'children':
                    if (Array.isArray(value))
                        targetHTML.replaceChildren.apply(targetHTML, value.filter(Boolean));
                    else if (value !== null)
                        targetHTML.replaceChildren(value);
                    break;
                default:
                    targetHTML[key] = value;
            }
        }
    }
    catch (error) {
        return targetHTML;
    }
    if (isInputHTMLElement && (this === null || this === void 0 ? void 0 : this.amend)) {
        (0, patcher_mini_1.default)(primer, targetHTML);
        return primer;
    }
    return targetHTML;
}
exports.render = render;
