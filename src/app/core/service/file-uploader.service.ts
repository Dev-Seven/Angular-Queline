import { FileUploader } from "ng2-file-upload";
import { APIConstant } from "../constant";
import { CommonConstant } from "../constant";
import { CommonUtility } from "../utilities";
import { FileConfiguration, UploadParameters } from "@app-models";
import { UploadType } from "@app-enums";

export enum FileType {
  image = "image",
  pdf = "pdf",
  word = "word",
}

const types: { [key: string]: string[] } = {
  [FileType.image]: ["image/png", "image/jpg", "image/jpeg"],
  [FileType.pdf]: ["application/pdf"],
  [FileType.word]: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export class FileUploaderService {
  uploader: FileUploader;

  constructor(options: FileConfiguration) {
    this.uploader = new FileUploader({
      url: "",
      itemAlias: options.itemAlias,
      headers: [{ name: "Accept", value: "*/*" }],

      maxFileSize: 25 * 1024 * 1024,
      allowedMimeType: ["image/png", "image/jpg", "image/jpeg"],
    });

    this.uploader.onBeforeUploadItem = (item) => {
      item.withCredentials = false;
    };

    this.uploader.onWhenAddingFileFailed = (item) => {
      if (options.onWhenAddingFileFailed) {
        options.onWhenAddingFileFailed();
      }
    };

    if (options.type) {
      this.uploader.setOptions({ allowedMimeType: types[options.type] });
    }

    if (options.completeAllCallback) {
      this.uploader.onCompleteAll = () => {
        options.completeAllCallback();
      };
    }

    if (options.completeCallback) {
      this.uploader.onCompleteItem = (item, response, status, header) => {
        if (status === 200) {
          options.completeCallback(JSON.parse(response));
        } else {
          options.completeCallback(null);
        }
      };
    }

    if (options.maxAllowedFile) {
      this.uploader.onAfterAddingFile = (f) => {
        if (this.uploader.queue.length > options.maxAllowedFile) {
          this.uploader.removeFromQueue(this.uploader.queue[0]);
        }

        if (options.addingFileCallback) {
          options.addingFileCallback();
        }
      };
    }
  }

  uploadFiles(parameters: UploadParameters): void {
    let url = "";

    switch (parameters["type"]) {
      case UploadType.ProfilePic:
        url = `${APIConstant.profile}/profilepic/${parameters["id"]}`;
        break;

      case UploadType.CompanyLogo:
        url = `${APIConstant.profile}/logo/${parameters["id"]}`;
        break;
      case UploadType.LocationLogo:
        url = `${APIConstant.location}/image/${parameters["id"]}`;
        break;
    }

    this.uploader.setOptions({ url });
    this.uploader.uploadAll();
  }

  hasFile(): boolean {
    return !CommonUtility.isEmpty(this.uploader.queue);
  }

  addUploadedItem(result: FileUploader) {
    this.uploader.clearQueue();
    this.uploader.addToQueue([result.queue[0]._file]);
  }

  clearQueue() {
    this.uploader.clearQueue();
  }
}
