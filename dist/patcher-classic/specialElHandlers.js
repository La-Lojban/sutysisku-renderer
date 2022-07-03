"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function syncBooleanAttrProp(fromEl, toEl, name) {
    var toElAttrValue = toEl.getAttribute(name);
    if (fromEl.getAttribute(name) !== toElAttrValue) {
        if (toElAttrValue) {
            fromEl.setAttribute(name, '');
        }
        else {
            fromEl.removeAttribute(name);
        }
    }
}
exports.default = {
    OPTION: function (fromEl, toEl) {
        var parentNode = fromEl.parentNode;
        if (parentNode) {
            var parentName = parentNode.nodeName.toUpperCase();
            if (parentName === 'OPTGROUP') {
                parentNode = parentNode.parentNode;
                if (parentNode)
                    parentName = parentNode === null || parentNode === void 0 ? void 0 : parentNode.nodeName.toUpperCase();
            }
            if (parentNode && parentName === 'SELECT' && !parentNode.hasAttribute('multiple')) {
                if (fromEl.hasAttribute('selected') &&
                    !toEl.hasAttribute('selected')) {
                    // Workaround for MS Edge bug where the 'selected' attribute can only be
                    // removed if set to a non-empty value:
                    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12087679/
                    fromEl.setAttribute('selected', 'selected');
                    fromEl.removeAttribute('selected');
                }
                // We have to reset select element's selectedIndex to -1, otherwise setting
                // fromEl.selected using the syncBooleanAttrProp below has no effect.
                // The correct selectedIndex will be set in the SELECT special handler below.
                parentNode.setAttribute('selectedIndex', '-1');
            }
        }
        syncBooleanAttrProp(fromEl, toEl, 'selected');
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function (fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'checked');
        syncBooleanAttrProp(fromEl, toEl, 'disabled');
        if (fromEl.value !== toEl.value) {
            fromEl.value = toEl.value;
        }
        if (!toEl.hasAttribute('value'))
            fromEl.removeAttribute('value');
    },
    TEXTAREA: function (fromEl, toEl) {
        var newValue = toEl.value;
        if (fromEl.value !== newValue)
            fromEl.value = newValue;
        var firstChild = fromEl.firstChild;
        if (firstChild) {
            // Needed for IE. Apparently IE sets the placeholder as the
            // node value and vise versa. This ignores an empty update.
            var oldValue = firstChild.nodeValue;
            if (oldValue == newValue || (!newValue && oldValue == fromEl.placeholder))
                return;
            firstChild.nodeValue = newValue;
        }
    },
    SELECT: function (fromEl, toEl) {
        var _a;
        if (!toEl.hasAttribute('multiple')) {
            var selectedIndex = -1;
            var i = 0;
            // We have to loop through children of fromEl, not toEl since nodes can be moved
            // from toEl to fromEl directly when morphing.
            // At the time this special handler is invoked, all children have already been morphed
            // and appended to / removed from fromEl, so using fromEl here is safe and correct.
            var curChild = fromEl.firstChild;
            var optgroup = void 0;
            var nodeName = void 0;
            while (curChild) {
                nodeName = (_a = curChild === null || curChild === void 0 ? void 0 : curChild.nodeName) === null || _a === void 0 ? void 0 : _a.toUpperCase();
                if (nodeName === 'OPTGROUP') {
                    optgroup = curChild;
                    curChild = optgroup.firstChild;
                }
                else {
                    if (nodeName === 'OPTION') {
                        if (curChild.hasAttribute('selected')) {
                            selectedIndex = i;
                            break;
                        }
                        i++;
                    }
                    curChild = curChild.nextSibling;
                    if (!curChild && optgroup) {
                        curChild = optgroup.nextSibling;
                        optgroup = null;
                    }
                }
            }
            fromEl.selectedIndex = selectedIndex;
        }
    },
};
