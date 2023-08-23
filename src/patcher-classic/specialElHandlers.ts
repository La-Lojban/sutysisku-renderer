import { SpecialAttrs, VDOMElementOrNull } from '../common/types';
function syncBooleanAttrProp(fromEl: HTMLElement, toEl: HTMLElement, name: SpecialAttrs) {
  const toElAttrValue = toEl.getAttribute(name);
  if (fromEl.getAttribute(name) !== toElAttrValue) {
    if (toElAttrValue) {
      fromEl.setAttribute(name, '');
    } else {
      fromEl.removeAttribute(name);
    }
  }
}

export default {
  OPTION: function (fromEl: HTMLElement, toEl: HTMLElement) {
    let parentNode: VDOMElementOrNull = fromEl.parentNode as VDOMElementOrNull;
    if (parentNode) {
      let parentName = parentNode.nodeName.toUpperCase();
      if (parentName === 'OPTGROUP') {
        parentNode = parentNode.parentNode as VDOMElementOrNull;
        if (parentNode) parentName = parentNode?.nodeName.toUpperCase();
      }
      if (parentNode && parentName === 'SELECT' && !parentNode.hasAttribute('multiple')) {
        if (
          (fromEl as HTMLOptionElement).hasAttribute('selected') &&
          !(toEl as HTMLOptionElement).hasAttribute('selected')
        ) {
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
  INPUT: function (fromEl: HTMLElement, toEl: HTMLElement) {
    syncBooleanAttrProp(fromEl, toEl, 'checked');
    syncBooleanAttrProp(fromEl, toEl, 'disabled');

    if ((fromEl as HTMLInputElement).value !== (toEl as HTMLInputElement).value) {
      (fromEl as HTMLInputElement).value = (toEl as HTMLInputElement).value;
    }

    if (!toEl.hasAttribute('value')) fromEl.removeAttribute('value');
  },

  TEXTAREA: function (fromEl: HTMLElement, toEl: HTMLElement) {
    const newValue = (toEl as HTMLTextAreaElement).value;
    if ((fromEl as HTMLTextAreaElement).value !== newValue) (fromEl as HTMLTextAreaElement).value = newValue;

    const firstChild = fromEl.firstChild;
    if (firstChild) {
      // Needed for IE. Apparently IE sets the placeholder as the
      // node value and vise versa. This ignores an empty update.
      const oldValue = firstChild.nodeValue;

      if (oldValue == newValue || (!newValue && oldValue == (fromEl as HTMLTextAreaElement).placeholder)) return;

      firstChild.nodeValue = newValue;
    }
  },
  SELECT: function (fromEl: HTMLElement, toEl: HTMLElement) {
    if (!toEl.hasAttribute('multiple')) {
      let selectedIndex = -1;
      let i = 0;
      // We have to loop through children of fromEl, not toEl since nodes can be moved
      // from toEl to fromEl directly when morphing.
      // At the time this special handler is invoked, all children have already been morphed
      // and appended to / removed from fromEl, so using fromEl here is safe and correct.
      let curChild = fromEl.firstChild as VDOMElementOrNull;
      let optgroup;
      let nodeName: string;
      while (curChild) {
        nodeName = curChild?.nodeName?.toUpperCase();
        if (nodeName === 'OPTGROUP') {
          optgroup = curChild;
          curChild = optgroup.firstChild as VDOMElementOrNull;
        } else {
          if (nodeName === 'OPTION') {
            if (curChild.hasAttribute('selected')) {
              selectedIndex = i;
              break;
            }
            i++;
          }
          curChild = curChild.nextSibling as VDOMElementOrNull;
          if (!curChild && optgroup) {
            curChild = optgroup.nextSibling as VDOMElementOrNull;
            optgroup = null;
          }
        }
      }

      (fromEl as HTMLSelectElement).selectedIndex = selectedIndex;
    }
  },
};
