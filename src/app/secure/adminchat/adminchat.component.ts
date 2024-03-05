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
import { AdminchatService } from "./adminchat.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { PublicService } from "src/app/public/public.service";

@Component({
  selector: "app-adminchat",
  templateUrl: "./adminchat.component.html",
  styleUrls: ["./adminchat.component.css"],
})
export class AdminchatComponent implements OnInit {
  title: string = "Chat App";
  isSuperAdmin: boolean = false;
  isBusinessOwner: boolean = false;
  showFiller: boolean = false;
  users: Array<any>;
  public messages: Array<any> = [];
  temp: any;
  showMessages = false;
  message: string = "";
  deviceUser: string = "";
  deviceToken: string = "";

  userFilter = { name: "" };
  public availableUsers: Array<any> = [];

  constructor(
    private userAuthService: UserAuthService,
    private notificationService: ToastrService,
    private helper: HelperService,
    private router: Router,
    private _scrollToService: ScrollToService,
    private location: Location,
    public api: ApiService,
    public apis: AdminchatService,
    db: AngularFirestore,
    private publicService: PublicService
  ) {}
  showChat = true;

  ngOnInit() {
    this.isSuperAdmin = this.userAuthService.isSuperAdmin();
    this.isBusinessOwner = this.userAuthService.isBusinessAdmin();
    this.getAllUsers();
  }
  // Run at the start to populate the list.
  getAllUsers() {
    this.api.setCurrentUser(localStorage.getItem("uid"));
    if (this.isSuperAdmin == true) {
      this.apis.getBusinessProfiles().subscribe((data: any[]) => {
        this.users = data;
      });
    } else if (this.isBusinessOwner == true) {
      this.apis.getOwnerProfiles().subscribe((data: any) => {
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
    let currentUserId;
    if (user.id !== undefined) {
      currentUserId = user.id;
    } else {
      currentUserId = user.uid;
    }
    this.publicService
      .getAdminDeviceToken(currentUserId)
      .subscribe((result) => {
        this.deviceUser = result.firstName + " " + result.lastName;
        this.deviceToken = result.deviceToken;
      });
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
      let convoFind = convo.find((item) => item.chatId == user.chatId);
      this.api.getChat(convoFind.chatId).subscribe((m) => {
        this.temp = m;
        this.api.chat = this.temp[0];
        this.messages =
          this.api.chat.messages == undefined ? [] : this.api.chat.messages;
        this.showMessages = true;
        setTimeout(() => {
          this.triggerScrollTo(); //scroll to bottom
        }, 1000);
        return;
      });
    } else {
      /* User is talking to someone for the very first time. */
      this.api.addNewChat().then(async () => {
        // This will create a chatId Instance.
        // Now we will let both the users know of the following chatId reference
        const usd = {
          uid: user.id,
          name: user.firstName + user.lastName,
          email: user.email,
        };
        let b = await this.api.addConvo(usd);
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
    this.messages.push(msg);
    this.api.pushNewMessage(this.messages).then(() => {});
    if (this.deviceToken != "") {
      this.publicService
        .sendPushNotification({
          deviceUser: this.deviceUser,
          deviceToken: this.deviceToken,
          message: this.message,
        })
        .subscribe((result) => {});
    }
    this.message = "";
  }
  //Scroll to the bottom
  public triggerScrollTo() {
    const config: ScrollToConfigOptions = {
      target: "destination",
    };
    this._scrollToService.scrollTo(config);
  }
  // Firebase Server Timestamp
  gettimestamp() {
    return firebase.default.firestore.FieldValue.serverTimestamp();
  }
  //Image upload
  fileChangeEvent(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      // Size Filter Bytes
      const max_size = 204800;
      if (fileInput.target.files[0].size > max_size) {
        "Maximum size allowed is " + max_size / 1000 + "Mb";
        this.notificationService.error("Maximum image size is 2 MB");
        return false;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = (rs) => {
          const imgBase64Path = e.target.result;
          this.sendImage(imgBase64Path);
        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }
  /* Sending a  Message */
  sendImage(image) {
    let msg = {
      senderId: this.api.currentUser.uid,
      senderName: this.api.currentUser.name,
      timestamp: new Date(),
      content: image,
    };
    this.message = "";
    this.messages.push(msg);
    this.api.pushNewMessage(this.messages).then(() => {});
  }
}
