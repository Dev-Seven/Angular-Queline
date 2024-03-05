import { Injectable } from '@angular/core';
import { BaseService, APIConstant } from "@app-core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ContactusService {

  constructor(private baseService: BaseService) { }

  saveInquiry(data): Observable<any> {
    return this.baseService.post<any>(`${APIConstant.inquiry}`, data)
}
}
