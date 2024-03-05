import { Observable } from 'rxjs';

export interface IBaseService {
    get<T>(url: string): Observable<T>;
    getWithResponse<T>(url: string): Observable<T>;
    post<T>(url: string, data: any): Observable<T>;
    put<T>(url: string, data: any): Observable<T>;
    delete<T>(url: string): Observable<T>;
}