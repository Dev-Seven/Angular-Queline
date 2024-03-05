import { UploadType } from "@app-enums";
import { DocumentDetails } from "./document-details";

export class FileConfiguration {
  completeAllCallback?: () => void;
  completeCallback?: (response: DocumentDetails) => any;
  type?: string;
  itemAlias?: string;
  maxAllowedFile?: number;
  addingFileCallback?: () => void;
  onWhenAddingFileFailed?: () => void;
}

export class UploadParameters {
  type: UploadType;
  id: string;
  [key: string]: string | number;
}
