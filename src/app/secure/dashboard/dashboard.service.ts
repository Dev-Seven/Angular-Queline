import { Injectable } from "@angular/core";
import { BaseService, APIConstant } from "@app-core";
import { Observable } from "rxjs";
import {
  WaittimeChartParameter,
  WaittimeChart,
  DashboardCounts,
  SpotData,
  BbBookingCount,
} from "@app-models";

@Injectable()
export class DashboardService {
  constructor(private baseService: BaseService) {}

  getDashboardCounts(locationId: number): Observable<DashboardCounts> {
    return this.baseService.get<DashboardCounts>(
      `${APIConstant.booking}/day/${locationId}`
    );
  }
  getBbBookingDashboardCounts(locationId: number): Observable<BbBookingCount> {
    return this.baseService.get<BbBookingCount>(
      `${APIConstant.bb_booking}/location/summary/${locationId}`
    );
  }

  getWaittimeChartData(
    businessOwnerId: number,
    parameter: WaittimeChartParameter
  ): Observable<WaittimeChart[]> {
    return this.baseService.put<WaittimeChart[]>(
      `${APIConstant.booking}/date/${businessOwnerId}`,
      parameter
    );
  }

  getWaittimeChartDatamonthly(
    businessOwnerId: number,
    parameter: WaittimeChartParameter
  ): Observable<WaittimeChart[]> {
    return this.baseService.put<WaittimeChart[]>(
      `${APIConstant.booking}/date/${businessOwnerId}`,
      parameter
    );
  }

  getWaittimeChartDataYearly(
    businessOwnerId: number,
    parameter: WaittimeChartParameter
  ): Observable<WaittimeChart[]> {
    return this.baseService.put<WaittimeChart[]>(
      `${APIConstant.booking}/date/${businessOwnerId}`,
      parameter
    );
  }

  getWaittimeChartDataDay(
    businessOwnerId: number,
    parameter: WaittimeChartParameter
  ): Observable<WaittimeChart[]> {
    return this.baseService.put<WaittimeChart[]>(
      `${APIConstant.booking}/date/${businessOwnerId}`,
      parameter
    );
  }

  getSpotData(locationId: number): Observable<SpotData[]> {
    return this.baseService.get<SpotData[]>(
      `${APIConstant.booking}/today/${locationId}`
    );
  }

  checkIn(id: number, partySize: number): Observable<any> {
    return this.baseService.put<any>(
      `${APIConstant.booking}/checkin/${id}/${partySize}`,
      null
    );
  }

  checkOut(id: number): Observable<any> {
    return this.baseService.put<any>(
      `${APIConstant.booking}/checkout/${id}`,
      null
    );
  }

  skip(id: number): Observable<any> {
    return this.baseService.put<any>(`${APIConstant.booking}/skip/${id}`, null);
  }

  cancel(id: number): Observable<any> {
    return this.baseService.put<any>(
      `${APIConstant.booking}/cancel/${id}`,
      null
    );
  }

  updatePartySize(id: number, partySize: number): Observable<any> {
    return this.baseService.patch<any>(`${APIConstant.booking}/${id}`, {
      partySize: partySize,
    });
  }

  updateComment(id: number, data): Observable<any> {
    return this.baseService.patch<any>(
      `${APIConstant.booking}/comment/${id}`,
      data
    );
  }
  updateBooking(id: number, data): Observable<any> {
    return this.baseService.patch<any>(`${APIConstant.booking}/${id}`, data);
  }

  getStatus(): Observable<any> {
    return this.baseService.get<any>(`${APIConstant.booking}/status`);
  }
}
