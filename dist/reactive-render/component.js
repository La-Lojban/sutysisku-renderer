"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../common/constants");
var patcher_mini_1 = require("../patcher-mini");
function createJsonObjectFromDotPath(oldState, path, value) {
    if (oldState === void 0) { oldState = {}; }
    if (path === void 0) { path = []; }
    var currentObj = oldState;
    if (path.length === 0)
        return value;
    for (var i = 0; i < path.length - 1; i++) {
        var key = path[i];
        currentObj[key] = {};
        currentObj = currentObj[key];
    }
    currentObj[path[path.length - 1]] = value;
    return oldState;
}
var Component = /** @class */ (function () {
    function Component(element, newElementClosure, options) {
        if (options === void 0) { options = constants_1.DEFAULT_COMPONENT_OPTIONS; }
        var _this = this;
        this.previousState = {};
        this.newStateAmendments = {};
        this.render = function (_a) {
            var _b, _c;
            var detail = _a.detail;
            if (detail.property !== undefined && detail.eventKey !== undefined) {
                _this.newStateAmendments[detail.eventKey] = createJsonObjectFromDotPath((_b = _this.newStateAmendments[detail.eventKey]) !== null && _b !== void 0 ? _b : {}, (_c = detail.path) === null || _c === void 0 ? void 0 : _c.concat([detail.property]), detail.value);
            }
            if (_this.debounce)
                window.cancelAnimationFrame(_this.debounce);
            _this.debounce = window.requestAnimationFrame(function () { return __awaiter(_this, void 0, void 0, function () {
                var n;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.newElementClosure()];
                        case 1:
                            n = _a.sent();
                            (0, patcher_mini_1.default)(this.element, n);
                            setTimeout(function () {
                                var _a;
                                if (_this.options.afterRender && detail.eventKey !== undefined)
                                    _this.options.afterRender({
                                        eventKey: detail.eventKey,
                                        newStateAmendments: structuredClone(_this.newStateAmendments[detail.eventKey]),
                                        previousState: structuredClone(_this.previousState[detail.eventKey]),
                                    });
                                if (detail.property !== undefined && detail.target !== undefined && detail.eventKey !== undefined) {
                                    _this.previousState[detail.eventKey] = createJsonObjectFromDotPath(_this.previousState[detail.eventKey], (_a = detail.path) !== null && _a !== void 0 ? _a : [], structuredClone(detail.target));
                                    delete _this.newStateAmendments[detail.eventKey];
                                }
                            }, 0);
                            return [2 /*return*/];
                    }
                });
            }); });
        };
        this.element = element;
        this.newElementClosure = newElementClosure;
        this.debounce = null;
        this.options = options;
        this.startReactiveSyncing();
    }
    Component.prototype.startReactiveSyncing = function () {
        var _this = this;
        this.options.eventKeys.forEach(function (eventKey) {
            _this.previousState[eventKey] = {};
            // this.newStateAmendments[eventKey] = {};
            document.addEventListener(eventKey, _this.render);
        });
        this.render({ detail: {} });
    };
    return Component;
}());
exports.default = (function (elem, template, options) {
    return new Component(elem, template, options);
});
