import { HelperService } from "../services/helper/helper.service";
import { Router } from "@angular/router";
import * as firebase from "firebase/app";
import {
  ScrollToService,
  ScrollToConfigOptions,
} from "@nicky-lenaers/ngx-scroll-to";
import "firebase/firestore";
import { Location } from "@angular/common";
import { ApiService } from "../services/api/api.service";
import { UserAuthService } from "@app-core";
import { EmployeechatService } from "./employeechat.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-employeechat",
  templateUrl: "./employeechat.component.html",
  styleUrls: ["./employeechat.component.css"],
})
export class EmployeechatComponent implements OnInit {
  title: string = "Chat App";
  isSuperAdmin: boolean = false;
  isStoreSupport: boolean = false;
  showFiller: boolean = false;
  users: Array<any>;
  public messages: Array<any> = [];
  temp: any;
  showMessages = false;
  message: string = "";

  userFilter = { name: "" };

  constructor(
    private userAuthService: UserAuthService,
    private helper: HelperService,
    private router: Router,
    private _scrollToService: ScrollToService,
    private location: Location,
    public api: ApiService,
    public apis: EmployeechatService,
    db: AngularFirestore
  ) {}
  showChat = true;

  ngOnInit() {
    this.isSuperAdmin = this.userAuthService.isSuperAdmin();
    this.isStoreSupport = this.userAuthService.isStoreSupport();

    this.getAllUsers();
  }
  getAllUsers() {
    const vv = localStorage.getItem("uid");
    const locationId = localStorage.getItem("locationId");

    this.api.setCurrentUser(localStorage.getItem("uid"));

    if (this.isStoreSupport == true) {
      this.apis.getBusinessProfiles().subscribe((data: any[]) => {
        this.users = data;
      });
    } else if (this.isStoreSupport == false) {
      this.apis
        .getOwnerProfiles(parseInt(locationId))
        .subscribe((data: any) => {
          this.users = [];
          this.selectUser({
            id: data.id,
            uid: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: "Admin",
          });
        });
    }
  }
  open(list) {
    this.helper.openDialog(list);
  }
  logoutModal(c) {
    this.location.back();
  }
  logout() {
    this.api.clearData();
    this.router.navigate(["/login"]).then(() => this.helper.closeModal());
  }
  closeModal() {
    this.helper.closeModal();
  }
  /* Main Code Logic */
  toggleMessages() {
    this.showMessages = !this.showMessages;
  }
  //Selecting A User from the list (onclick)  to talk
  async selectUser(user) {
    try {
      this.helper.closeModal();
    } catch (e) {}
    if (this.api.currentUser.conversations == undefined) {
      //means user has no conversations.
      this.api.currentUser.conversations = [];
    }
    let convo = [...this.api.currentUser.conversations];
    let find = convo.find((item) => item.uid == user.uid); // Check If Its the same person who user has talked to before,
    if (find) {
      // Conversation Found
      this.api.getChat(find.chatId).subscribe((m) => {
        this.temp = m;

        this.api.chat = this.temp[0];
        this.messages =
          this.api.chat.messages == undefined ? [] : this.api.chat.messages;
        this.showMessages = true;
        setTimeout(() => {
          this.triggerScrollTo();
        }, 1000);
        return;
      });
    } else {
      /* User is talking to someone for the very first time. */
      this.api.addNewChat().then(async () => {
        // Now we will let both the users know of the following chatId reference
        const usd = {
          uid: user.id,
          name: user.firstName + user.lastName,
          email: user.email,
        };
        let b = await this.api.addConvo(usd);
        if (this.isStoreSupport) {
          this.selectUser({
            id: user.id,
            uid: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: "Admin",
          });
        }
      });
    }
  }
  /* Sending a  Message */
  sendMessage() {
    if (this.message == "") {
      alert("Enter message");
      return;
    }
    let msg = {
      senderId: this.api.currentUser.uid,
      senderName: this.api.currentUser.name,
      timestamp: new Date(),
      content: this.message,
    };
    this.message = "";
    this.messages.push(msg);
    this.api.pushNewMessage(this.messages).then(() => {});
  }
  //Scroll to the bottom
  public triggerScrollTo() {
    const config: ScrollToConfigOptions = {
      target: "destination",
    };
    this._scrollToService.scrollTo(config);
  }
  //Server Timestamp
  get timestamp() {
    return firebase.default.firestore.FieldValue.serverTimestamp();
  }
}
