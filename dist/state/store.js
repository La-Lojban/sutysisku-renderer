"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var functions_1 = require("../common/functions");
var constants_1 = require("../common/constants");
var proxyCache = new WeakMap();
function createDeepOnChangeProxy(target, onChange, options) {
    return new Proxy(target, {
        get: function (target, property) {
            var _a;
            var item = target[property];
            // if (property === 'update') {
            //   return function (value: Partial<T>) {
            //     for (const key in value) {
            //       (target as any)[key] = value[key];
            //     }
            //     onChange(target);
            //     // return item;
            //   };
            // }
            if (item && typeof item === 'object') {
                if (proxyCache.has(item))
                    return proxyCache.get(item);
                var proxy = createDeepOnChangeProxy(item, onChange, __assign(__assign({}, options), { path: ((_a = options.path) !== null && _a !== void 0 ? _a : []).concat([property.toString()]) }));
                proxyCache.set(item, proxy);
                return proxy;
            }
            return item;
        },
        set: function (target, property, value) {
            if (target[property] instanceof Function) {
                return true;
            }
            if (target[property] !== value) {
                onChange({ target: target, property: property, value: value, path: options.path });
            }
            target[property] = value;
            return true;
        },
        deleteProperty: function (target, property) {
            delete target[property];
            onChange({ target: target, property: property, path: options.path });
            return true;
        },
    });
}
function store(data, options) {
    var _a;
    if (options === void 0) { options = constants_1.DEFAULT_STORE_OPTIONS; }
    if (options.localCacheKey)
        data = __assign(__assign({}, data), JSON.parse((_a = localStorage.getItem(options.localCacheKey)) !== null && _a !== void 0 ? _a : '{}'));
    return createDeepOnChangeProxy(data, function (_a) {
        var _b;
        var target = _a.target, property = _a.property, value = _a.value, path = _a.path;
        (0, functions_1.dispatchCustomEvent)({ eventKey: options.eventKey, target: target, property: property, value: value, path: path });
        if (options.localCacheKey && (path !== null && path !== void 0 ? path : []).length === 0) {
            localStorage.setItem(options.localCacheKey, JSON.stringify(__assign(__assign({}, target), (_b = {}, _b[property] = value, _b))));
        }
    }, options);
}
exports.default = store;
