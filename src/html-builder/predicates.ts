export const isNode = (value: unknown): value is Node => !!value && typeof (value as Node).nodeType === 'number';
