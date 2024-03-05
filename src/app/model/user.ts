import { FeedbackComponent } from "../secure/dashboard/feedback/feedback.component";
import { FeedbackData } from "./feedback";
import { Location } from "./location";

export class User {
  id: number;
  firstName: string;
  lastName: string;
  companyName?: string;
  couponCode?: string;
  email: string;
  phone?: string;
  profilepic?: string;
  logo?: string;
  role: string;
  password?: string;
  reportTo?: number;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  dob?: Date;
  isDeleted: false;
  twilio: {
    sid:string,
    authtoken:string,
    phonenumber:string,
  };
  balance: {
    accountSid: string,
    balance: string,
    currency: string
  };
  businessEmail: string;
  businessType: string;
  privacyPolicy: string;
  website: string;
  feedback: FeedbackData[];
  bookingSound: boolean;
  waitlistSound;
  parameterEmail: string;
  locationAdmin?: Array<Location>;
}

export class UserLogin {
  email: string;
  password: string;
  deviceToken: string = null;
}

export class VerifyLink {
  activateKey: string;
}

export class Forgot {
  email: string;
}

export class ForgotPassword {
  email: string;
  password: string;
  cpassword: string;
}

export class ChangePassword {
  password: string;
  npassword: string;
}

export class BrowserUser {
  ".expires": Date;
  ".issued": Date;
  access_token: string;
  expires_in: number;
  permissions: string;
  token_type: string;
  tokenId: string;
  user: string;
}

export class EndUser {
  name: string;
  email: string;
  phone: string;
  deviceToken: string;
  userDetails: UserInput[];
}

export class UserInput {
  userId: number;
  locationInputId: number;
  value: string;
}

export class BookingUser extends EndUser {
  locationId: number;
  userId: number;
  partySize: number;
  deviceToken: string;
  bookingDetails: BookingDetails[];
}
export class BbBookingUser extends EndUser {
  locationId: number;
  userId: number;
  partySize: number;
  bookingDate: string;
  slotId: string;
  deviceToken: string;
  bookingDetails: BookingDetails[];
  slotDuration: string;
}

export class Booking {
  locationId: number;
  userId: number;
  bookingDetails: BookingDetails[];
}

export class BookingDetails {
  bookingId: number;
  locationInputId: number;
  value: string;
}

export class Role {
  name: string;
}
