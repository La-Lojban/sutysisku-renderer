import { RecursiveObject, StoreOptions } from '../common/types';
declare function store<T extends RecursiveObject>(data: T, options?: StoreOptions): T;
export default store;
