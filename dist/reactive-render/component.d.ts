import { ChangedProperty, ComponentOptions, RecursiveObject, RenderTemplate } from '../common/types';
declare class Component {
    previousState: {
        [key: string]: RecursiveObject;
    };
    newStateAmendments: {
        [key: string]: RecursiveObject;
    };
    element: Element | string;
    newElementClosure: RenderTemplate;
    debounce: number | null;
    options: ComponentOptions;
    constructor(element: Element | string, newElementClosure: RenderTemplate, options?: ComponentOptions);
    startReactiveSyncing(): void;
    render: ({ detail }: {
        detail: Partial<ChangedProperty>;
    }) => void;
}
declare const _default: (elem: Element | string, template: RenderTemplate, options: ComponentOptions) => Component;
export default _default;
