import { ElArg, H } from '../common/types';
import { isNode } from './predicates';

export const h: H = (primer: HTMLElement | string, ...args: ElArg[]) => {
  const isInputHTMLElement = primer instanceof HTMLElement;
  let targetHTML: HTMLElement;
  let id: string | undefined;
  if (isInputHTMLElement) {
    targetHTML = document.createElement(primer.tagName);
  } else {
    const parts = primer.split(/(?=[#.])/);
    id = parts.find((element) => element.startsWith('#'))?.replace('#', '');
    const tagName = parts.find((element) => /^[a-z]/.test(element));
    targetHTML = document.createElement(tagName ?? 'div');
    if (id) targetHTML.id = id;
    const classes = parts.filter((element) => element.startsWith('.')).map((i) => i.replace(/^\./, ''));
    if (classes.length > 0) targetHTML.className = classes.join(' ');
  }

  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string' || typeof arg === 'number') {
      targetHTML.appendChild(document.createTextNode(arg.toString()));
    } else if (isNode(arg)) {
      targetHTML.appendChild(arg);
    } else {
      try {
        for (const [key, value] of Object.entries(arg)) {
          if (value == null) continue;
          if (value instanceof Function) {
            targetHTML.addEventListener(key as keyof HTMLElementEventMap, value as EventListenerOrEventListenerObject);
            continue;
          }
          switch (key) {
            case 'class':
            case 'className':
              targetHTML.className = (
                targetHTML.className +
                ' ' +
                (Array.isArray(value) ? value.filter(Boolean).join(' ') : String(value))
              ).trim();
              break;
            case 'attributes':
              for (const [attr, attrValue] of Object.entries(value)) {
                if (attrValue != null) targetHTML.setAttribute(attr, attrValue);
              }
              break;
            case 'style':
              if (typeof value === 'string') {
                targetHTML.setAttribute('style', value);
              } else {
                Object.assign(targetHTML.style, value);
              }
              break;
            case 'src':
              if (targetHTML instanceof HTMLImageElement) targetHTML.src = String(value);
              break;
            case 'alt':
              if (targetHTML instanceof HTMLImageElement) targetHTML.alt = String(value);
              break;
            case 'href':
              if (targetHTML instanceof HTMLAnchorElement) targetHTML.href = String(value);
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
              if (key === 'id' && (isInputHTMLElement || targetHTML.id)) continue;
              (targetHTML as any)[key] = String(value);
          }
        }
      } catch (error) {
        console.error(error);
        return targetHTML;
      }
    }
  }

  return targetHTML;
};
