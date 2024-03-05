import { Component, OnInit } from "@angular/core";
import { HelperService } from "../services/helper/helper.service";
import { ApiService } from "../services/api/api.service";
import { Router } from "@angular/router";
import * as firebase from "firebase/app";
import {
  ScrollToService,
  ScrollToConfigOptions,
} from "@nicky-lenaers/ngx-scroll-to";
import "firebase/firestore";
import { Location } from "@angular/common";
import { PublicService } from "../public.service";
import { APIConstant } from "@app-core";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-chatdashboard",
  templateUrl: "./chatdashboard.component.html",
  styleUrls: ["./chatdashboard.component.css"],
})
export class ChatdashboardComponent implements OnInit {
  title: string = "Chat App";

  showFiller: boolean = false;
  users: Array<any>;
  userss: Array<any>;

  public messages: Array<any> = [];
  temp: any;
  showMessages = false;
  message: string = "";
  companyLogo: string = null;
  basePath: string = APIConstant.basePath + "api/";
  locationQrsId: string;
  locationId;
  userFilter = { name: "" };
  isPublicChat: boolean;
  storeName: string;
  userIdStorate;
  isStoreSupport: boolean;
  currentChatID = null;
  constructor(
    private helper: HelperService,
    private notificationService: ToastrService,
    private router: Router,
    private _scrollToService: ScrollToService,
    private location: Location,
    private publicService: PublicService,
    public api: ApiService
  ) {
    this.isPublicChat = false;
    this.userIdStorate = Number(localStorage.getItem("uid"));
    this.isStoreSupport = false;
  }
  showChat = true;
  deviceUser: string = "";
  deviceToken: string = "";

  ngOnInit() {
    this.deviceToken = localStorage.getItem("deviceToken");

    this.getAllUsers();
    this.GetLocationData();
  }

  async getAllUsers() {
    const locationQrId = localStorage.getItem("locationQrId");
    this.locationQrsId = locationQrId;

    this.api.getCurrentUser();

    this.api.getUsersa();
    this.api.getUsers().subscribe((data: any[]) => {
      data = data.filter((item) => item.id !== this.userIdStorate);

      this.users = data;
    });

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
    this.router.navigate(["/login"]).then(() => this.helper.closeModal());
  }

  closeModal() {
    this.helper.closeModal();
  }

  toggleMessages() {
    this.showMessages = !this.showMessages;
  }

  async selectPublicRoom() {
    this.isStoreSupport = false;

    this.isPublicChat = true;
    this.api.getPublicChat().subscribe((m) => {
      try {
        this.temp = m;

        this.api.chat = this.temp[0];
        if (this.api.chat != null) {
          if (this.isStoreSupport == false) {
            this.messages =
              this.api.chat.messages == undefined ? [] : this.api.chat.messages;
          }
        } else {
          this.api.addNewPublicChat().then(async () => {});
        }
        this.showMessages = true;
        setTimeout(() => {
          this.triggerScrollTo();
        }, 1000);
        return;
      } catch (ex) {
        this.api.addNewPublicChat().then(async () => {});
      }
    });
  }
  async selectBusinessUser() {
    var userId = localStorage.getItem("locationId");
    this.isStoreSupport = true;

    userId = this.api.adminSupport.uid;

    await this.selectUser({
      username: "Support",
      email: "Support",
      phone: "",
      id: userId,
      uid: userId,
    });
  }

  selectPrivateUser(user) {
    if (this.api.currentUser.conversations == undefined) {
      document.getElementById("divClick").click();
    }

    this.isStoreSupport = false;
    this.selectUser(user);
  }

  async selectUser(user) {
    let currentUserId;
    if (user.id !== undefined) {
      currentUserId = user.id;
    } else {
      currentUserId = user.uid;
    }
    if (this.isStoreSupport) {
      this.publicService
        .getSupportDeviceToken(currentUserId)
        .subscribe((result) => {
          this.deviceUser = result.firstName + " " + result.lastName;
          this.deviceToken = result.admin_deviceToken;
        });
    } else {
      this.publicService
        .getUserDeviceToken(currentUserId)
        .subscribe((result) => {
          this.deviceUser = result.uniqueid;
          this.deviceToken = result.deviceToken;
        });
    }

    var userId = localStorage.getItem("locationId");

    this.isPublicChat = false;
    try {
      this.helper.closeModal();
    } catch (e) {}

    if (this.api.currentUser.conversations == undefined) {
      this.api.currentUser.conversations = [];
    }
    let convo = [...this.api.currentUser.conversations];

    let find = null;
    if (typeof user.uid !== "undefined") {
      find = convo.find((item) => item.uid == user.uid);
    } else {
      find = convo.find((item) => item.uid == user.id);
    }

    if (find) {
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
        let usd = {
          uid: "",

          name: "",
          email: "",
          uniqueid: "",
        };
        if (user.uniqueid != undefined) {
          usd.uniqueid = user.uniqueid;
        } else {
          usd.uniqueid = "Support";
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
        if (this.isStoreSupport == true) {
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
        }
      });
    }
  }

  sendMessage() {
    if (this.message == "") {
      alert("Enter message");
      return;
    }

    let msg = {
      senderId: this.api.currentUser.uid,
      senderName: this.api.currentUser.name,
      senderUniqueId: this.api.currentUser.uniqueid,

      timestamp: new Date(),
      content: this.message,
    };

    this.messages.push(msg);

    this.api.pushNewMessagec2b(this.messages).then(() => {});

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

  sendPublicMessage() {
    if (this.message == "") {
      alert("Enter message");
      return;
    }

    let msg = {
      senderId: this.api.currentUser.uid,
      senderName: this.api.currentUser.name,
      senderUniqueId: this.api.currentUser.uniqueid,
      timestamp: new Date(),
      content: this.message,
    };

    this.message = "";

    this.messages.push(msg);

    if (this.isPublicChat) {
      this.api.pushNewPublicMessage(this.messages).then(() => {});
    } else {
      this.api.pushNewMessageb2c(this.messages).then(() => {});
    }
  }

  sendImage(image) {
    let msg = {
      senderId: this.api.currentUser.uid,
      senderName: this.api.currentUser.name,
      senderUniqueId: this.api.currentUser.uniqueid,
      timestamp: new Date(),
      content: image,
    };

    this.message = "";

    this.messages.push(msg);

    if (this.isPublicChat) {
      this.api.pushNewPublicMessage(this.messages).then(() => {});
    } else {
      if (this.isStoreSupport) {
        this.api.pushNewMessagec2b(this.messages).then(() => {});
      } else {
        this.api.pushNewMessagec2c(this.messages).then(() => {});
      }
    }
  }

  public triggerScrollTo() {
    const config: ScrollToConfigOptions = {
      target: "destination",
    };
    this._scrollToService.scrollTo(config);
  }

  get timestamp() {
    return firebase.default.firestore.FieldValue.serverTimestamp();
  }

  fileChangeEvent(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const max_size = 204800;
      const allowed_types = ["image/png", "image/jpeg"];

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
          const img_height = rs.currentTarget["height"];
          const img_width = rs.currentTarget["width"];

          const imgBase64Path = e.target.result;
          this.sendImage(imgBase64Path);
        };
      };

      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  removeImage() {}

  private GetLocationData() {
    this.publicService
      .locationDataByQr(this.locationQrsId)
      .subscribe((result) => {
        this.locationQrsId = result.id;
        this.locationId = result.id;
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
}
