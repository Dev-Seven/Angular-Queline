import { BaseAuditable } from "./base-auditable";

export class DocumentDetails extends BaseAuditable {
  id: number;
  path: string;
  name: string;
  contentType: string;
  extension: string;
  title: string;
  alternative: string;
  imageType: string;

  pictureId?: number;
  documentName?: string;
}
