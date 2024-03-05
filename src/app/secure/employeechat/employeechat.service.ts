import { Injectable } from "@angular/core";
import { BaseService, CRUDService, APIConstant } from "@app-core";
import { Observable } from "rxjs";
import { Location, LocationInput, User } from "@app-models";

@Injectable()
export class EmployeechatService extends CRUDService<Location>{

    constructor(private _baseService: BaseService) {
        super(_baseService, "location");
    }

    getBusinessProfiles(): Observable<User[]> {
        return this._baseService.get<User[]>(`${APIConstant.profile}`);
    }
  
  
    getOwnerProfiles(locationId): Observable<User> {
        return this._baseService.get<User>(`${APIConstant.profile}/location/${locationId}`);
    }
}