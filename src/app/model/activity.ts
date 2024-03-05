import { FeedbackData } from "./feedback";

export class Activity {
  id: number;
  locationId: number;
  userId: number;
  username: string;
  email?: string;
  phone?: string;
  visits: number;
  companyName: string;
  location: string;
  lastVisited: Date;
  userLongitude: string;
  userLatitude: string;
  locationLongitude: string;
  locationLatitude: string;
  comment: string;
  feedback: FeedbackData[];
  rating: number;
}
