import { Injectable } from "@angular/core";
import { CommonConstant } from "../constant";
import { CommonUtility } from "../utilities";
import { User, BrowserUser } from "@app-models";

@Injectable()
export class UserAuthService {
  constructor() {}

  saveToken(token: string) {
    window.localStorage.setItem(CommonConstant.token, token);
  }

  saveUser(user: User) {
    window.localStorage.setItem(CommonConstant.user, JSON.stringify(user));
  }

  saveCompanyName(companyname: string) {
    window.localStorage.setItem(CommonConstant.companyname, companyname);
  }

  saveLocation(locationname: string) {
    window.localStorage.setItem(CommonConstant.locationname, locationname);
  }

  saveLocationLogo(logo: string) {
    window.localStorage.setItem(CommonConstant.locationlogo, logo);
  }

  getToken(): string {
    return window.localStorage.getItem(CommonConstant.token);
  }

  getBrowserUser(): BrowserUser {
    const user = window.localStorage.getItem(CommonConstant.user);
    if (!CommonUtility.isEmpty(user)) {
      return JSON.parse(user);
    }
    return null;
  }
  getCompanyName(): string {
    return window.localStorage.getItem(CommonConstant.companyname);
  }
  getLocationName(): string {
    return window.localStorage.getItem(CommonConstant.locationname);
  }
  getLocationLogo(): string {
    return window.localStorage.getItem(CommonConstant.locationlogo);
  }

  getUser(): User {
    const user = window.localStorage.getItem(CommonConstant.user);
    if (!CommonUtility.isEmpty(user)) {
      return JSON.parse(user);
    }
  }

  isSuperAdmin(): boolean {
    const user = this.getUser();
    if (user && user.role === "System Admin") {
      return true;
    } else {
      return false;
    }
  }

  isBusinessAdmin(): boolean {
    const user = this.getUser();
    if (user && user.role === "Business Owner") {
      return true;
    } else {
      return false;
    }
  }

  isManager(): boolean {
    const user = this.getUser();
    if (user && user.role === "Manager") {
      return true;
    } else {
      return false;
    }
  }

  isStoreSupport(): boolean {
    const user = this.getUser();
    if (user && user.role === "Support") {
      return true;
    } else {
      return false;
    }
  }

  isLoggedIn(): boolean {
    return !CommonUtility.isNull(this.getToken());
  }

  loggedOut(): void {
    window.localStorage.clear();
  }
}
