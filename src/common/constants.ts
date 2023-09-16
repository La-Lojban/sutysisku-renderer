import { StoreOptions } from './types';

export const ELEMENT_NODE = 1;
export const DOCUMENT_FRAGMENT_NODE = 11;
export const TEXT_NODE = 3;
export const COMMENT_NODE = 8;
export const NS_XHTML = 'http://www.w3.org/1999/xhtml';
export const DEFAULT_STORE_OPTIONS: StoreOptions = {
  eventKey: 'sutysisku-event',
  path: [],
};
export const DEFAULT_COMPONENT_OPTIONS = {
  eventKeys: ['sutysisku-event'],
  // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-pattern
  afterRender: ({}) => {},
};
