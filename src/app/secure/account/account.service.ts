import { Injectable } from "@angular/core";
import { BaseService, CRUDService, APIConstant } from "@app-core";
import { Observable } from "rxjs";
import { Location, LocationInput } from "@app-models"


@Injectable()
export class AccountService extends CRUDService<Location> {
  constructor(private _baseService: BaseService) {
    super(_baseService, "location");
  }

  getLocationsByCompany(businessOwnerId: number): Observable<Location[]> {
    return this._baseService.get<Location[]>(
      `${APIConstant.location}/admin/${businessOwnerId}`
    );
  }

  activateStore(locationId: number): Observable<any> {
    return this._baseService.get<any>(
      `${APIConstant.location}/activate/${locationId}`
    );
  }

  changeTheme(locationId: number, themeId: string): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.location}/theme/${locationId}/${themeId}`,
      null
    );
  }

  enableLocationInput(locationInputId: number): Observable<any> {
    return this._baseService.get<any>(
      `${APIConstant.locationInput}/enable/${locationInputId}`
    );
  }

  enableBranding(locationId: number): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.location}/branding/${locationId}`,
      null
    );
  }

  enableChatting(locationId: number): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.location}/chatting/${locationId}`,
      null
    );
  }

  enableWaitlistSound(adminId: number): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.admin}/waitlistSound/${adminId}`,
      null
    );
  }
  enableBookingSound(adminId: number): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.admin}/bookingSound/${adminId}`,
      null
    );
  }

  enableStoreBooking(locationId: number): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.location}/storeBooking/${locationId}`,
      null
    );
  }

  deleteLocationInput(locationInputId: number): Observable<any> {
    return this._baseService.patch<any>(
      `${APIConstant.locationInput}/delete/${locationInputId}`,
      null
    );
  }

  deleteLocation(locationId: number): Observable<any> {
    return this._baseService.patch<any>(
      `${APIConstant.location}/delete/${locationId}`,
      null
    );
  }

  getLocationInputById(locationInputId: number): Observable<LocationInput> {
    return this._baseService.get<LocationInput>(
      `${APIConstant.locationInput}/${locationInputId}`
    );
  }

  editLocationInput(
    locationInputId: number,
    locationInput: LocationInput
  ): Observable<any> {
    return this._baseService.patch<any>(
      `${APIConstant.locationInput}/${locationInputId}`,
      locationInput
    );
  }

  addLocationInput(locationInput: LocationInput): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.locationInput}`,
      locationInput
    );
  }

  getLocationInputType(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.locationInput}/types`);
  }

  getRoles(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.admin}/roles`);
  }

  getBusinessTypes(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.admin}/businessTypes`);
  }

  getThemes(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.location}/themes`);
  }

  getStatus(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.calendar}/status`);
  }

  getWeekDays(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.calendar}/week`);
  }

  addFeedback(feedback): Observable<any> {
    return this._baseService.post<any>(`${APIConstant.feedback}`, feedback);
  }
  removeFeedback(feedbackId): Observable<any> {
    return this._baseService.patch<any>(
      `${APIConstant.feedback}/delete/${feedbackId}`,
      null
    );
  }

  removeLogo(locationId: number): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.location}/image/delete/${locationId}`,
      null
    );
  }

  getOpeningHours(locationId: number): Observable<any> {
    return this._baseService.get<any>(
      `${APIConstant.calendar}/location/${locationId}`
    );
  }
  saveOpeningHours(calendarId, data): Observable<any> {
    return this._baseService.patch<any>(
      `${APIConstant.calendar}/${calendarId}`,
      data
    );
  }

  getBusinessSports(data): Observable<any> {
    return this._baseService.post<any>(`${APIConstant.businessDetails}`, data);
  }

  upgradeBusinessPlan(data): Observable<any> {
    return this._baseService.post<any>(
      `${APIConstant.upgradeBusinessPlan}`,
      data
    );
  }

  downgradeBusinessPlan(id): Observable<any> {
    return this._baseService.get<any>(
      `${APIConstant.downgradeBusinessPlan}/${id}`
    );
  }
  getSMScount(email): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.sms_count}/${email}`);
  }

  getInquiries(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.inquiry}`);
  }

  addSpots(data): Observable<any> {
    return this._baseService.post<any>(`${APIConstant.addSpots}`, data);
  }
  addSms(data): Observable<any> {
    return this._baseService.post<any>(`${APIConstant.addSms}`, data);
  }

  getOrderList(id): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.getOrderList}/${id}`);
  }
  getOrder(id): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.getOrder}/${id}`);
  }
  // Business-Booking Services :-Added By Tushar

  getBbCalendarByLocationId(locationId: number): Observable<any> {
    return this._baseService.get<any>(
      `${APIConstant.bb_calender}/location/${locationId}`
    );
  }
  getBbStatus(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.bb_calender}/status`);
  }

  createBbCalendar(data): Observable<any> {
    return this._baseService.post<any>(`${APIConstant.bb_calender}`, data);
  }
  getBbWeekDays(): Observable<any> {
    return this._baseService.get<any>(`${APIConstant.bb_calender}/week`);
  }
  getBbOpeningHours(locationId: number): Observable<any> {
    return this._baseService.get<any>(
      `${APIConstant.bb_calender}/location/${locationId}`
    );
  }
  saveBbOpeningHours(bb_calendarId, data): Observable<any> {
    return this._baseService.patch<any>(
      `${APIConstant.bb_calender}/${bb_calendarId}`,
      data
    );
  }

  deleteBbcalenderdata(bb_calendarId): Observable<any> {
    return this._baseService.patch<any>(
      `${APIConstant.bb_calender}/location/delete/${bb_calendarId}`,
      { bb_calendarId }
    );
  }
  getBbBookingsByLocationId(locationId: number): Observable<any> {
    return this._baseService.get<any>(
      `${APIConstant.bb_booking}/location/${locationId}`
    );
  }

  checkInBbBooking(bbBookingId: number): Observable<any> {
    return this._baseService.put(
      `${APIConstant.bb_booking}/checkIn/${bbBookingId}`,
      null
    );
  }
  checkOutBbBooking(bbBookingId: number): Observable<any> {
    return this._baseService.put(
      `${APIConstant.bb_booking}/checkOut/${bbBookingId}`,
      null
    );
  }
}
