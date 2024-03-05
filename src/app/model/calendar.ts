import { FormArray, FormControl, FormGroup } from "@angular/forms";

export class Calendar {
  id?: number;
  locationId?: number;
  weekDay: string;
  status: string;
  time: Time[];
  isDeleted?: boolean;
}
export class BbCalendar {
  locationId?: number;
  weekDay: string;
  status: string;
  slotMin: string;
  startDate: string;
  endDate: string;
  maxPartySize: number;
  bbTime: BbTime[];
}

export class SlotConfig {
  slotHours: string;
  slotMinutes: string;
  slotPreparation: string = "0";
  timeArr: Array<object> = [{ startTime: "", endTime: "" }];
}

export class Time {
  calendarId?: number;
  openTime: string;
  closeTime: string;
  isDeleted?: boolean;
}
export class BbTime {
  openTime: string;
  closeTime: string;
  bbSlot: Slot[];
}
export class Slot {
  id: number;
  bbTimeId: number;
  slotDuration: string;
}
