import { Calendar } from "./calendar";
import { User } from "./user";

export class Location {
  id: number;
  name: string;
  contact: string;
  longitude: string;
  latitude: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  timeZone: string;
  businessAdminId: number;
  businessAdmin: User;
  qrCodeURL: string;
  waitTime: number;
  language: string;
  isActive: boolean;
  checkInUrl: string;
  waitListUrl: string;
  isPublicWaitList: boolean;
  isAllowCheckIn: boolean;
  isEmailRequired: boolean;
  isNameRequired: boolean;
  isPartySizeRequired: boolean;
  isPhoneRequired: boolean;
  locationInput: LocationInput[];
  partySize: number;
  theme: string;
  branding: boolean;
  chatting: boolean;
  addLogo: boolean;
  image: string;
  calendar: Calendar[];
  storeBooking: boolean;
}

export class LocationInput {
  id: number;
  locationId: number;
  availableFor: string;
  name: string;
  label: string;
  isDeleted: boolean;
  availability: string;
  defaultInput: string;
  placeholder: string;
  type: string;
  required: boolean;
  enabled: boolean;
  options: string;
  preselect: boolean;
  multiple: boolean;
  defaultValue: string[];
}

export class LocationInputType {
  name: string;
}
