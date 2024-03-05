import { Injectable } from "@angular/core";
import { BaseService, CRUDService, APIConstant } from "@app-core";
import { Observable } from "rxjs";
import { User } from "@app-models";

@Injectable()
export class ProfileService extends CRUDService<User> {
  constructor(private _baseService: BaseService) {
    super(_baseService, "profile");
  }

  getProfiles(): Observable<User[]> {
    return this._baseService.get<User[]>(`${APIConstant.profile}`);
  }

  updateProfile(profileId: number, profile: User): Observable<any> {
    return this._baseService.patch<any>(
      `${APIConstant.profile}/${profileId}`,
      profile
    );
  }

  changePassword(changePasswordData: any): Observable<any> {
    return this._baseService.post(
      `${APIConstant.changepassword}`,
      changePasswordData
    );
  }

  deleteProfile(profileId: number): Observable<any> {
    return this._baseService.patch<any>(
      `${APIConstant.profile}/delete/${profileId}`,
      null
    );
  }

  removePicture(profileId: number): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.profile}/profilepic/delete/${profileId}`,
      null
    );
  }

  removeLogo(profileId: number): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.profile}/logo/delete/${profileId}`,
      null
    );
  }

  addStaffUser(locationId: number, userData: User): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.admin}/location/${locationId}`,
      userData
    );
  }

  getRoles(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.admin}/roles`);
  }

  getLocations(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.location}`);
  }

  getBusinessTypes(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.admin}/businessTypes`);
  }
}
