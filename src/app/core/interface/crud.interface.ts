import { Observable } from "rxjs";
import { ServerFiltering, PagedResult } from "@app-models";

export interface ICrud<T> {
    get: () => Observable<T[]>;
    getPagedData: (query: ServerFiltering) => Observable<PagedResult<T>>
    getById: (id: number) => Observable<T>;
    add: (data: T) => Observable<T>;
    update: (id: number, data: T) => Observable<T>;
    remove: (id: number) => Observable<boolean> | Observable<string>;
}
