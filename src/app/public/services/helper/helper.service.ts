import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Socket } from "ngx-socket-io";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class HelperService {
  animal: string;
  name: string;
  dialogRef: any;

  constructor(
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private socket: Socket
  ) {}

  reserveSpot(refresh: boolean) {
    this.socket.emit("Booking", refresh);
  }

  waitList(refresh: boolean, userId: any) {
    this.socket.emit("waitList", refresh, userId);
  }

  isRefresh() {
    return this.socket.fromEvent("Booking").pipe(map((data) => data));
  }

  isRefreshWaitList() {
    return this.socket.fromEvent("waitList").pipe(map((data) => data));
  }

  bbBookSpot(refresh: boolean) {
    this.socket.emit("BbBooking", refresh);
  }

  bbWaitList(refresh: boolean, userId: any) {
    this.socket.emit("BbWaitList", refresh, userId);
  }

  bbBooking_isRefresh() {
    return this.socket.fromEvent("BbBooking").pipe(map((data) => data));
  }

  bbBooking_isRefreshWaitList() {
    return this.socket.fromEvent("BbWaitList").pipe(map((data) => data));
  }

  private docId() {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
  public openDialog(content, width?, val?): void {
    this.dialogRef = this.dialog.open(content, {
      width: width || "300px",
      maxHeight: "300px",

      data: val || {},
    });

    this.dialogRef.afterClosed().subscribe((result) => {});
  }

  public closeModal() {
    this.dialogRef.close();
  }

  public openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
