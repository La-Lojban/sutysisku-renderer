import events from './events';

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;

export default function morph(newNode: Element, oldNode: Element): void {
  const nodeType = newNode.nodeType;
  const nodeName = newNode.nodeName;

  if (nodeType === ELEMENT_NODE) copyAttrs(newNode, oldNode);

  if ([TEXT_NODE, COMMENT_NODE].includes(nodeType) && oldNode.nodeValue !== newNode.nodeValue)
    oldNode.nodeValue = newNode.nodeValue;

  // Some DOM nodes are weird
  // https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
  if (nodeName === 'INPUT') updateInput(newNode as HTMLInputElement, oldNode as HTMLInputElement);
  else if (nodeName === 'OPTION') updateOption(newNode as HTMLOptionElement, oldNode as HTMLOptionElement);
  else if (nodeName === 'TEXTAREA') updateTextarea(newNode as HTMLTextAreaElement, oldNode as HTMLTextAreaElement);

  copyEvents(newNode, oldNode);
}

function copyAttrs(newNode: Element, oldNode: Element) {
  const oldAttrs = oldNode.attributes;
  const newAttrs = newNode.attributes;

  for (const attr of Array.from(newAttrs)) {
    let attrName = attr.name;
    const attrNamespaceURI = attr.namespaceURI;
    const attrValue = attr.value;
    if (attrNamespaceURI) {
      attrName = attr.localName || attrName;
      const fromValue = oldNode.getAttributeNS(attrNamespaceURI, attrName);
      if (fromValue !== attrValue) {
        oldNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
      }
    } else {
      if (!oldNode.hasAttribute(attrName)) {
        oldNode.setAttribute(attrName, attrValue);
      } else {
        const fromValue = oldNode.getAttribute(attrName);
        if (fromValue !== attrValue) {
          // apparently values are always cast to strings, ah well
          if (attrValue === 'null' || attrValue === 'undefined') {
            oldNode.removeAttribute(attrName);
          } else {
            oldNode.setAttribute(attrName, attrValue);
          }
        }
      }
    }
  }

  // Remove any extra attributes found on the original DOM element that
  // weren't found on the target element.
  for (const attr of Array.from(oldAttrs)) {
    if (attr.specified !== false) {
      let attrName = attr.name;
      const attrNamespaceURI = attr.namespaceURI;

      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        if (!newNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          oldNode.removeAttributeNS(attrNamespaceURI, attrName);
        }
      } else {
        if (!newNode.hasAttributeNS(null, attrName)) {
          oldNode.removeAttribute(attrName);
        }
      }
    }
  }
}

function copyEvents(newNode: Element, oldNode: Element) {
  for (const ev of events) {
    if ((newNode as any)[ev]) {
      // if new element has a whitelisted attribute
      (oldNode as any)[ev] = (newNode as any)[ev]; // update existing element
    } else if ((oldNode as any)[ev]) {
      // if existing element has it and new one doesnt
      (oldNode as any)[ev] = undefined; // remove it from existing element
    }
  }
}

function updateOption(newNode: HTMLOptionElement, oldNode: HTMLOptionElement) {
  updateAttribute(newNode, oldNode, 'selected');
}

// The "value" attribute is special for the <input> element since it sets the
// initial value. Changing the "value" attribute without changing the "value"
// property will have no effect since it is only used to the set the initial
// value. Similar for the "checked" attribute, and "disabled".
function updateInput(newNode: HTMLInputElement, oldNode: HTMLInputElement) {
  const newValue = newNode.value;
  const oldValue = oldNode.value;

  updateAttribute(newNode, oldNode, 'checked');
  updateAttribute(newNode, oldNode, 'disabled');

  // The "indeterminate" property can not be set using an HTML attribute.
  // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox
  if (newNode.indeterminate !== oldNode.indeterminate) {
    oldNode.indeterminate = newNode.indeterminate;
  }

  // Persist file value since file inputs can't be changed programatically
  if (oldNode.type === 'file') return;

  if (newValue !== oldValue) {
    oldNode.setAttribute('value', newValue);
    oldNode.value = newValue;
  }

  if (newValue === 'null') {
    oldNode.value = '';
    oldNode.removeAttribute('value');
  }

  if (!newNode.hasAttributeNS(null, 'value')) {
    oldNode.removeAttribute('value');
  } else if (oldNode.type === 'range') {
    // this is so elements like slider move their UI thingy
    oldNode.value = newValue;
  }
}

function updateTextarea(newNode: HTMLTextAreaElement, oldNode: HTMLTextAreaElement) {
  const newValue = newNode.value;
  if (newValue !== oldNode.value) {
    oldNode.value = newValue;
  }

  if (oldNode.firstChild && oldNode.firstChild.nodeValue !== newValue) {
    // Needed for IE. Apparently IE sets the placeholder as the
    // node value and vise versa. This ignores an empty update.
    if (newValue === '' && oldNode.firstChild.nodeValue === oldNode.placeholder) {
      return;
    }

    oldNode.firstChild.nodeValue = newValue;
  }
}

function updateAttribute(newNode: Element, oldNode: Element, name: string) {
  if ((newNode as any)[name] !== (oldNode as any)[name]) {
    (oldNode as any)[name] = (newNode as any)[name];
    if ((newNode as any)[name]) {
      oldNode.setAttribute(name, '');
    } else {
      oldNode.removeAttribute(name);
    }
  }
}
