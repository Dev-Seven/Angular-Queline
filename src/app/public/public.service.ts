import { Injectable } from "@angular/core";
import { BaseService, APIConstant } from "@app-core";
import {
  User,
  EndUser,
  SendFeedBack,
  Booking,
  BbBookingUser,
} from "@app-models";
import { Observable } from "rxjs";

@Injectable()
export class PublicService {
  constructor(private baseService: BaseService) {}

  signup(data: User): Observable<any> {
    return this.baseService.post(`${APIConstant.signup}`, data);
  }
  signupForLtPlan(data: User): Observable<any> {
    return this.baseService.post(
      `${APIConstant.signupForLtPlan}/${data.couponCode}`,
      data
    );
  }

  signin(loginData: any): Observable<any> {
    return this.baseService.post(`${APIConstant.signin}`, loginData);
  }

  verify(activationkey: any): Observable<any> {
    return this.baseService.post(
      `${APIConstant.verify}/${activationkey}`,
      activationkey
    );
  }

  forgot(forgotData: any): Observable<any> {
    return this.baseService.post(
      `${APIConstant.forgot}/${forgotData.email}`,
      forgotData
    );
  }

  forgotPassword(forgotPasswordData: any): Observable<any> {
    return this.baseService.post(
      `${APIConstant.forgotpassword}`,
      forgotPasswordData
    );
  }

  endUserSignUp(data: EndUser): Observable<any> {
    return this.baseService.post(`${APIConstant.user}/signup`, data);
  }

  endUserSignIn(data: EndUser): Observable<any> {
    return this.baseService.post(`${APIConstant.user}/signin`, data);
  }

  endUserUpdate(id: number, data: EndUser): Observable<any> {
    return this.baseService.patch(`${APIConstant.user}/${id}`, data);
  }

  endUserById(id: number): Observable<any> {
    return this.baseService.get(`${APIConstant.user}/${id}`);
  }

  locationDataByQr(qrCode: string): Observable<any> {
    return this.baseService.get(`${APIConstant.location}/qr/${qrCode}`);
  }

  getWaitlist(qrCode: string): Observable<any> {
    return this.baseService.get(`${APIConstant.location}/waitlist/${qrCode}`);
  }

  booking(data: Booking): Observable<any> {
    return this.baseService.post(`${APIConstant.booking}/book`, data);
  }

  locationData(id: number): Observable<any> {
    return this.baseService.get(`${APIConstant.location}/user/${id}`);
  }

  getChatUsers(location): Observable<any> {
    return this.baseService.get(`${APIConstant.chatUsers}/${location}`);
  }

  bookingData(id: number): Observable<any> {
    return this.baseService.get(`${APIConstant.booking}/${id}`);
  }

  getWaitlistData(id: number): Observable<any> {
    return this.baseService.get(`${APIConstant.booking}/waitlistdata/${id}`);
  }

  cancelBooking(id: number): Observable<any> {
    return this.baseService.put(`${APIConstant.booking}/cancel/${id}`, null);
  }

  cancelALlBooking(id: number): Observable<any> {
    return this.baseService.put(
      `${APIConstant.bb_booking}/cancelall/${id}`,
      null
    );
  }

  reReserveBooking(id: number): Observable<any> {
    return this.baseService.patch(`${APIConstant.booking}/rebook/${id}`, null);
  }

  addfeedback(bookingId: number, data: SendFeedBack): Observable<any> {
    return this.baseService.post(
      `${APIConstant.booking}/feedback/${bookingId}`,
      data
    );
  }

  getfeedbackList(): Observable<any> {
    return this.baseService.get(`${APIConstant.feedback}`);
  }

  getfeedbackListByLocation(locationId: number): Observable<any> {
    return this.baseService.get(
      `${APIConstant.feedback}/location/${locationId}`
    );
  }

  getAverageTime(id: number): Observable<any> {
    return this.baseService.post(
      `${APIConstant.booking}/getAverageTime/${id}`,
      null
    );
  }

  sendPushNotification(data: any): Observable<any> {
    return this.baseService.post(`${APIConstant.pushNotificattion}`, data);
  }

  getUserDeviceToken(id: any): Observable<any> {
    return this.baseService.get(`${APIConstant.getUserDeviceToken}/${id}`);
  }

  getSupportDeviceToken(id: any): Observable<any> {
    return this.baseService.get(`${APIConstant.getSupportDeviceToken}/${id}`);
  }

  getAdminDeviceToken(id: any): Observable<any> {
    return this.baseService.get(`${APIConstant.getAdminDeviceToken}/${id}`);
  }

  getBbCalendarByLocationId(locationId: number): Observable<any> {
    return this.baseService.get<any>(
      `${APIConstant.bb_calender}/location/${locationId}`
    );
  }
  getBbAllBookingByLocationId(id: number): Observable<any> {
    return this.baseService.get<any>(
      `${APIConstant.bb_booking}/location/${id}`
    );
  }
  getBbBookingByLocationId(id: number): Observable<any> {
    return this.baseService.get<any>(`${APIConstant.bb_booking}/${id}`);
  }
  bbBooking(data: BbBookingUser): Observable<any> {
    return this.baseService.post(`${APIConstant.bb_booking}/book`, data);
  }
  cancelBbBooking(id: number): Observable<any> {
    return this.baseService.put(`${APIConstant.bb_booking}/cancel/${id}`, null);
  }
  getBookedSlots(locatioId: number, slotId: number): Observable<any> {
    return this.baseService.get(
      `${APIConstant.bb_booking}/location/${locatioId}/${slotId}`
    );
  }

  slotBooking(id: number, data: any): Observable<any> {
    return this.baseService.patch<any>(
      `${APIConstant.bb_slot}/book/${id}`,
      data
    );
  }
}
