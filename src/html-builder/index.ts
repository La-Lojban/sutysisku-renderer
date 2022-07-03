import patchDOM from '../patcher-mini';
import { WritableNodeKeys } from '../common/types';

export function amend(oldEl: HTMLElement, json: { [key: string]: any }): void {
  render.bind({ amend: true })(oldEl, json);
}

export function render(
  this: void | { amend?: boolean },
  primer: HTMLElement | string,
  json: { [key: string]: any },
): HTMLElement {
  let targetHTML: HTMLElement;

  const isInputHTMLElement = primer instanceof HTMLElement;
  if (isInputHTMLElement) {
    targetHTML = (primer as HTMLElement).cloneNode(true) as HTMLElement;
  } else {
    targetHTML = document.createElement((primer as string) ?? 'div');
  }

  try {
    for (const key of Object.keys(json)) {
      const value = json[key];
      if (value === null) continue;
      switch (key) {
        case 'id':
          if (isInputHTMLElement) continue;
          else targetHTML[key] = value;
          break;
        case 'class':
        case 'className':
          targetHTML.className = Array.isArray(value) ? (value as string[]).filter(Boolean).join(' ') : value;
          break;
        case 'addClass':
          targetHTML.classList.add(...(!Array.isArray(value) ? (value as string).split(' ') : value).filter(Boolean));
          break;
        case 'removeClass':
          targetHTML.classList.remove(
            ...(!Array.isArray(value) ? (value as string).split(' ') : value).filter(Boolean),
          );
          break;
        case 'attributes':
          for (const attr of Object.keys(value)) if (value[attr] !== null) targetHTML.setAttribute(attr, value[attr]);
          break;
        case 'style':
          for (const attr of Object.keys(value))
            if (value[attr] !== null) targetHTML.style.setProperty(attr, value[attr]);
          break;
        case 'appendChildren':
          if (Array.isArray(value)) (value as Node[]).filter(Boolean).forEach((sub) => targetHTML.appendChild(sub));
          else if (value !== null) targetHTML.appendChild(value);
          break;
        case 'children':
          if (Array.isArray(value)) targetHTML.replaceChildren(...(value as Node[]).filter(Boolean));
          else if (value !== null) targetHTML.replaceChildren(value);
          break;
        default:
          targetHTML[key as keyof WritableNodeKeys] = value;
      }
    }
  } catch (error) {
    return targetHTML as HTMLElement;
  }

  if (isInputHTMLElement && this?.amend) {
    patchDOM(primer, targetHTML);
    return primer;
  }

  return targetHTML as HTMLElement;
}
