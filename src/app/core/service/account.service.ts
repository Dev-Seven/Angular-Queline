import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseService } from "./base.service";
import { APIConstant } from "../constant";
import { Location } from "@app-models";

@Injectable()
export class AccountService {
  constructor(private baseService: BaseService) {}

  logout(): Observable<any> {
    return this.baseService.post(`${APIConstant.logout}`, null);
  }
  getLocationsByCompany(businessOwnerId: number): Observable<Location[]> {
    return this.baseService.get<Location[]>(
      `${APIConstant.location}/admin/${businessOwnerId}`
    );
  }
}
