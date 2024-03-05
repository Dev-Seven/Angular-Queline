export class SendFeedBack {
  rating: number;
  feedbackIds: Array<number>;
}

export class FeedbackData {
  id: number;
  businessAdminId: number;
  feedback: string;
  points: number;
  isDeleted: boolean;
}
