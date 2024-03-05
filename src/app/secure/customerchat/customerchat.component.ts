import { Component, OnInit } from "@angular/core";
import { HelperService } from "../services/helper/helper.service";
import { Router } from "@angular/router";
import * as firebase from "firebase/app";
import {
  ScrollToService,
  ScrollToConfigOptions,
} from "@nicky-lenaers/ngx-scroll-to";
import "firebase/firestore";
import { APIConstant } from "@app-core";
import { Location } from "@angular/common";
import { ApiService } from "../services/api/api.service";
import { PublicService } from "src/app/public/public.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-customerchat",
  templateUrl: "./customerchat.component.html",
  styleUrls: ["./customerchat.component.css"],
})
export class CustomerchatComponent implements OnInit {
  title: string = "Chat App";
  basePath: string = APIConstant.basePath + "api/";
  showFiller: boolean = false;
  users: Array<any>;
  userss: Array<any>;

  userIdStorate;
  public messages: Array<any> = [];
  temp: any;
  showMessages = false;
  message: string = "";
  locationQrsId: string;
  userFilter = { name: "" };
  isPublicChat: boolean;
  constructor(
    private helper: HelperService,
    private router: Router,
    private notificationService: ToastrService,
    private _scrollToService: ScrollToService,
    private location: Location,
    public api: ApiService,
    private publicService: PublicService
  ) {
    this.isPublicChat = false;
  }
  showChat = true;
  currentChatID = null;
  companyLogo: string = null;
  deviceUser: string = "";
  storeName: string;
  deviceToken: string = "";

  ngOnInit() {
    this.deviceToken = localStorage.getItem("deviceToken");
    this.getAllUsers();
    this.GetLocationData();
  }
  // code for fetching lat,long from location
  private GetLocationData() {
    this.publicService
      .locationDataByQr(this.locationQrsId)
      .subscribe((result) => {
        this.locationQrsId = result.id;

        if (result.businessAdmin.profilepic !== null) {
          this.companyLogo =
            this.basePath +
            "admin/files/profilepic/" +
            result.businessAdmin.profilepic;
        } else {
          this.companyLogo = null;
        }
        this.storeName = result.businessAdmin.companyName;
      });
  }
  // Run at the start to populate the list.
  getAllUsers() {
    const locationQrId = localStorage.getItem("locationQrId");
    this.locationQrsId = locationQrId;
    this.api.getCurrentUser();
    this.api.getUsers();
    this.api.getBusinessOwner().subscribe((datas: any[]) => {
      this.userss = [];
    });
  }
  open(list) {
    this.helper.openDialog(list);
  }
  logoutModal(c) {
    this.location.back();
  }
  logout() {
    this.api.clearData();
  }
  closeModal() {
    this.helper.closeModal();
  }

  /* Main Code Logic */
  toggleMessages() {
    this.showMessages = !this.showMessages;
  }
  async selectPublicRoom() {
    this.isPublicChat = true;
    this.api.getPublicChat().subscribe((m) => {
      try {
        this.temp = m;
        this.api.chat = this.temp[0];
        if (this.api.chat != null) {
          this.messages =
            this.api.chat.messages == undefined ? [] : this.api.chat.messages;
        } else {
          this.api.addNewPublicChat().then(async () => {});
        }
        this.showMessages = true;
        setTimeout(() => {
          this.triggerScrollTo(); //scroll to bottom
        }, 1000);
        return;
      } catch (ex) {
        this.api.addNewPublicChat().then(async () => {});
      }
    });
  }
  async selectBusinessUser() {
    var userId = localStorage.getItem("businessAdminId");
    await this.selectUser({
      username: "Business Admin",
      email: "Business Admin",
      phone: "",
      id: userId,
      uid: userId,
    });
  }
  //Selecting A User from the list (onclick)  to talk
  async selectUser(user) {
    let currentUserId;

    if (user.id !== undefined) {
      currentUserId = user.id;
    } else {
      currentUserId = user.uid;
    }

    this.publicService.getUserDeviceToken(currentUserId).subscribe((result) => {
      this.deviceUser = result.uniqueid;
      this.deviceToken = result.deviceToken;
    });

    this.isPublicChat = false;

    try {
      this.helper.closeModal();
    } catch (e) {}

    if (this.api.currentUser.conversations == undefined) {
      //means user has no conversations.
      this.api.currentUser.conversations = [];
    }
    let convo = [...user.conversations]; //spread operators for ensuring type Array.
    let find = convo.find((item) => item.uid == this.api.currentUser.uid);
    // Check If Its the same person who user has talked to before,
    if (find) {
      // Conversation Found
      this.currentChatID = find.chatId;
      this.api.getChat(find.chatId).subscribe((m) => {
        this.temp = m;
        let currentChatWindow = this.temp.find(
          (item) => item.chatId == this.currentChatID
        );
        if (
          this.isPublicChat == false &&
          (currentChatWindow != undefined || this.currentChatID == null)
        ) {
          this.api.chat = this.temp[0];
          this.messages =
            this.api.chat.messages == undefined ? [] : this.api.chat.messages;
          this.showMessages = true;
          setTimeout(() => {
            this.triggerScrollTo();
          }, 1000);
          return;
        }
      });
    } else {
      this.api.addNewChat().then(async () => {
        // This will create a chatId Instance.
        // Now we will let both the users know of the following chatId reference
        let usd = {
          uid: "",
          name: "",
          email: "",
          uniqueid: "",
        };
        if (user.uniqueid != undefined) {
          usd.uniqueid = user.uniqueid;
        }

        if (user.id != undefined) {
          usd.uid = user.id;
        } else {
          usd.uid = user.uid;
        }

        if (user.name != undefined) {
          usd.name = user.name;
        }
        if (user.email != undefined) {
          usd.email = user.email;
        }
        let b = await this.api.addConvo(usd);
        let chatId = this.api.chat.chatId;
        this.currentChatID = this.api.chat.chatId;
        this.api.getChat(chatId).subscribe((m) => {
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
      });
    }
  }
  /* Sending a  Message */
  sendMessage() {
    // If message string is empty
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
    this.api.pushNewMessageb2c(this.messages).then(() => {});
    // added pushnotification code by nikunj on 31-05-2021 1:08 PM
    if (this.deviceToken != "") {
      this.publicService
        .sendPushNotification({
          deviceUser: this.deviceUser,
          deviceToken: this.deviceToken,
          message: this.message,
        })
        .subscribe((result) => {});
    }
    //empty message
    this.message = "";
  }
  /* Sending a  Message */
  sendPublicMessage() {
    if (this.message == "") {
      alert("Enter message");
      return;
    }
    //set the message object
    let msg = {
      senderId: this.api.currentUser.uid,
      senderName: this.api.currentUser.name,
      timestamp: new Date(),
      content: this.message,
    };
    this.message = "";
    this.messages.push(msg);
    this.api.pushNewPublicMessage(this.messages).then(() => {});
  }
  /* Sending a  Message */
  sendImage(image) {
    //set the message object
    let msg = {
      senderId: this.api.currentUser.uid,
      senderName: this.api.currentUser.name,

      timestamp: new Date(),
      content: image,
    };
    this.message = "";
    this.messages.push(msg);
    if (this.isPublicChat) {
      this.api.pushNewPublicMessage(this.messages).then(() => {});
    } else {
      this.api.pushNewMessageb2c(this.messages).then(() => {});
    }
  }
  //Scroll to the bottom
  public triggerScrollTo() {
    const config: ScrollToConfigOptions = {
      target: "destination",
    };
    this._scrollToService.scrollTo(config);
  }
  // Firebase Server Timestamp
  get timestamp() {
    return firebase.default.firestore.FieldValue.serverTimestamp();
  }
  //FileUpload
  fileChangeEvent(fileInput: any) {
    // this.imageError = null;
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
}
