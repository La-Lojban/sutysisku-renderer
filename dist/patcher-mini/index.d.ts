export default function patchDOM(oldTree: Element | string | null | undefined, newTree: Element, options?: {
    childrenOnly: boolean;
}): Element | null | undefined;
