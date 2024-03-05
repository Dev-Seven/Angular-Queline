import { FeedbackData } from "./feedback";
import { Location } from "./location";
import { BookingDetails, EndUser } from "./user";

export class WaittimeChartParameter {
  fromDate: string;
  toDate: string;
}

export class WaittimeChart {
  date: string;
  data: Array<WaittimeChartLocationData>;
}

export class BbBookingCount {
  totalCounts: number;
  scheduledCounts: number;
}

export class WaittimeChartLocationData {
  locationName: string;
  avgWaitTime: number;
}

export class DashboardCounts {
  totalVisits: number;
  waitListedGuests: number;
  averageWaitingTime: number;
  totalMonthlyVisits: number;
  averageRating: number;
  averageRatingToday: number;
}

export class SpotData {
  id: number;
  spotId: number;
  locationId: number;
  userId: number;
  userName: string;
  bookingTime: Date;
  checkInTime: string;
  checkOutTime: string;
  partySize: number;
  status: string;
  waitTime: number;
  currentWaitTime: number;
  rating: number;
  feedback: FeedbackData[];
  isDeleted: boolean;
  userLongitude: string;
  userLatitude: string;
  comment: string;
  bookingDetails: BookingDetails[];
  user: EndUser;
  location: Location;
}

export class SpotDataUser {
  name: string;
  email: string;
  phone: string;
}
