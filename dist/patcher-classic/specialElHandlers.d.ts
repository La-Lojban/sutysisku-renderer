declare const _default: {
    OPTION: (fromEl: HTMLElement, toEl: HTMLElement) => void;
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: (fromEl: HTMLElement, toEl: HTMLElement) => void;
    TEXTAREA: (fromEl: HTMLElement, toEl: HTMLElement) => void;
    SELECT: (fromEl: HTMLElement, toEl: HTMLElement) => void;
};
export default _default;
