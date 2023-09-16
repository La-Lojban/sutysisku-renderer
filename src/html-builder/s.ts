export const svgNs = 'http://www.w3.org/2000/svg';

import { S, SvgArg } from '../common/types';
import { isNode } from './predicates';

export const s: S = (tagName, ...args: SvgArg[]) => {
  const element = document.createElementNS(svgNs, tagName);
  for (const arg of args) {
    if (!arg) continue;
    if (isNode(arg)) {
      element.appendChild(arg);
    } else {
      try {
        for (const [key, value] of Object.entries(arg)) {
          if (value == null) continue;
          element.setAttribute(key, value as string);
        }
      } catch (error) {
        console.error(error);
        return element;
      }
    }
  }

  return element;
};
