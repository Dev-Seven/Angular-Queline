import { Injectable, Optional } from "@angular/core";
import { BaseService } from "./base.service";
import { Observable } from "rxjs";
import { ICrud } from "../interface";
import { APIConstant } from "../constant";
import { ServerFiltering, PagedResult } from "@app-models";
import { CommonUtility } from "../utilities";

export class CRUDService<T> implements ICrud<T> {
  className: string = "";
  constructor(
    private baseService: BaseService,
    @Optional() name: string = "master"
  ) {
    this.className = name;
  }

  private typeOf(): string {
    return this.className;
  }

  get(): Observable<T[]> {
    return this.baseService.get<T[]>(`${APIConstant[this.typeOf()]}`);
  }

  getById(id: number): Observable<T> {
    return this.baseService.get<T>(`${APIConstant[this.typeOf()]}/${id}`);
  }

  getPagedData(query: ServerFiltering): Observable<PagedResult<T>> {
    const queryString = CommonUtility.getFilterObjectToString({ ...query });
    return this.baseService.get<PagedResult<T>>(
      `${APIConstant[this.typeOf()]}?${queryString}`
    );
  }

  add(data: T): Observable<T> {
    return this.baseService.post<T>(`${APIConstant[this.typeOf()]}`, data);
  }

  update(id: number, data: T): Observable<T> {
    return this.baseService.patch<T>(
      `${APIConstant[this.typeOf()]}/${id}`,
      data
    );
  }

  remove(id: number): Observable<any> {
    return this.baseService.delete<any>(`${APIConstant[this.typeOf()]}/${id}`);
  }

  toggleActivate(id: number, isActive: boolean): Observable<any> {
    return this.baseService.put<any>(
      `${APIConstant[this.typeOf()]}/activate/${id}/${isActive}`,
      null
    );
  }
}
