import { Injectable } from "@angular/core";
import { BaseService, CRUDService, APIConstant } from "@app-core";
import { Observable } from "rxjs";
import { Activity } from "@app-models";
import "jspdf-autotable";

@Injectable()
export class ActivityService {
  CSV_EXTENSION: ".CSV";
  lines = [];
  linesR = [];
  CSVData = { header: Array, rows: Array };
  constructor(private baseService: BaseService) {}
  getActivities(): Observable<Activity[]> {
    return this.baseService.get<Activity[]>(`${APIConstant.activity}`);
  }
  updateComment(id: number, data): Observable<any> {
    return this.baseService.patch<any>(
      `${APIConstant.booking}/comment/${id}`,
      data
    );
  }
  downloadFile(data, filename, columns) {
    let csvData = this.ConvertToCSV(data, columns);

    let blob = new Blob(["\ufeff" + csvData], {
      type: "text/csv;charset=utf-8;",
    });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser =
      navigator.userAgent.indexOf("Safari") != -1 &&
      navigator.userAgent.indexOf("Chrome") == -1;
    if (isSafariBrowser) {
      //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }
  ConvertToCSV(objArray, headerList) {
    let array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    let str = "";
    let row = "S.No,";

    for (let index in headerList) {
      row += headerList[index] + ",";
    }
    row = row.slice(0, -1);
    str += row + "\r\n";
    for (let i = 0; i < array.length; i++) {
      let line = i + 1 + "";
      for (let index in headerList) {
        let head = headerList[index];

        line += "," + array[i][head];
      }
      str += line + "\r\n";
    }
    return str;
  }
  //File upload function
  async changeListener(files: FileList) {
    this.lines = [];
    this.linesR = [];
    return new Promise<{ header: Array<any>; rows: Array<any> }>((resolve) => {
      if (files && files.length > 0) {
        let file: File = files.item(0);
        let reader: FileReader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
          let csv: any = reader.result;
          let allTextLines = [];
          allTextLines = csv.split(/\r|\n|\r/);

          //Table Headings
          let headers = allTextLines[0].split(";");
          let data = headers;
          let tarr = [];
          for (let j = 0; j < headers.length; j++) {
            tarr.push(data[j]);
          }
          //Pusd headinf to array variable
          this.lines.push(tarr);

          // Table Rows
          let tarrR = [];
          //Create formdata object
          var myFormData = new FormData();
          let arrl = allTextLines.length;
          let rows = [];

          for (let i = 1; i < arrl; i++) {
            rows.push(allTextLines[i].split(";"));
            if (allTextLines[i] != "") {
              // Save file data into formdata varibale
              myFormData.append("data" + i, allTextLines[i]);
            }
          }

          for (let j = 0; j < arrl; j++) {
            tarrR.push(rows[j]);
            tarrR = tarrR.filter(function (i) {
              return i != "";
            });

            // Begin assigning parameters
          }
          //Push rows to array variable
          this.linesR.push(tarrR);

          resolve({ header: this.lines, rows: this.linesR });
        };
      }
    });
  }
}
