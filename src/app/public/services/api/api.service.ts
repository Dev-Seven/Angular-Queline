import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { map, take } from "rxjs/operators";
import { Observable, forkJoin } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

export interface Chat {
  chatId: any;
  chatType: string;
  messages: Array<Message>;
}

export interface Message {
  senderId: string;
  senderName: string;
  content: string;

  timestamp?: Date;
}
export interface UserConvo {
  uid: string;
  name: string;
  chatId: string;
  timestamp?: Date;
}
export interface User {
  uid: string;
  name: string;
  email: string;

  locationId: any;
  uniqueid: string;
  conversations?: Array<any>;
}

@Injectable({
  providedIn: "root",
})
export class ApiService {
  adminSupport: User;
  constructor(private afs: AngularFirestore, private http: HttpClient) {}

  private temp: any;
  public currentUser: User;
  public otherUser;
  public messages = [];
  public chat: Chat = {
    chatId: "",
    chatType: "",
    messages: [],
  };
  conversationId;

  createUser(uid, data) {
    this.afs
      .doc("users/" + uid)
      .valueChanges()
      .subscribe((resp) => {
        if (resp == undefined) {
          let fireUser = {
            uid: uid,
            name: data.name,
            email: "",
            phone: "",
            locationId: data.locationId,
            uniqueid: data.uniqueid,
          };
          if (data.email != undefined) {
            fireUser.email = data.email;
          }
          if (data.phone != undefined) {
            fireUser.phone = data.phone;
          }
          return this.afs.doc("users/" + uid).set(fireUser);
        } else {
          this.temp = resp;
          this.currentUser = this.temp;
          return true;
        }
      });
  }

  updateUser(id, data) {
    return this.afs.doc("users/" + id).update(data);
  }
  public getUsersa() {
    this.afs
      .collection<any>("usersa")
      .valueChanges()
      .subscribe((resp) => {
        if (resp) {
          let admins = resp.filter(
            (admin) =>
              admin.uniqueId === "support" &&
              admin.locationId == this.currentUser.locationId
          );
          this.adminSupport = admins[0];
        }
      });
  }

  setCurrentUser(uid) {
    localStorage.setItem("uid", uid);
    this.afs
      .doc("users/" + uid)
      .valueChanges()
      .subscribe(
        (resp) => {
          this.temp = resp;
          this.currentUser = this.temp;
        },
        (err) => {}
      );
  }

  public getCurrentUser() {
    this.afs
      .doc("users/" + localStorage.getItem("uid"))
      .valueChanges()
      .subscribe((resp) => {
        if (resp == undefined) {
          this.setCurrentUser(localStorage.getItem("uid"));
        } else {
          this.temp = resp;
          this.currentUser = this.temp;
          return true;
        }
      });
  }

  public getUsers() {
    const locationId = localStorage.getItem("locationId");

    return this.http.get(
      `${environment.serverPath}api/user/location/${locationId}`
    );
  }

  public getBusinessOwner() {
    const locationQrId = localStorage.getItem("locationQrId");

    return this.http.get(
      `${environment.serverPath}api/location/qr/${locationQrId}`
    );
  }
  public getSupport() {
    return this.http.get(
      `${environment.serverPath}api/admin/support/${localStorage.getItem(
        "businessAdminId"
      )}`
    );
  }

  getChat(chatId) {
    return this.afs
      .collection("conversations", (ref) => ref.where("chatId", "==", chatId))
      .valueChanges();
  }

  refreshCurrentUser() {
    this.afs
      .collection("users/" + localStorage.getItem("uid"))
      .valueChanges()
      .subscribe((data) => {
        this.temp = data;
        this.currentUser = this.temp;
      });
  }

  async addConvo(user) {
    let userMsg = {
      name: user.name,
      uid: user.uid,
      chatId: this.chat.chatId,
      uniqueid: user.uniqueid,
    };
    let otherMsg = {
      name: this.currentUser.name,
      uid: this.currentUser.uid,
      chatId: this.chat.chatId,
      uniqueid: this.currentUser.uniqueid,
    };

    let myReference = this.afs.doc("users/" + this.currentUser.uid);

    let otherReference = this.afs.doc("users/" + user.uid);

    myReference.get().subscribe((d: any) => {
      let c = d.data();

      if (!c.conversations) {
        c.conversations = [];
      }
      c.conversations.push(userMsg);
      return myReference.update({ conversations: c.conversations });
    });

    otherReference.get().subscribe((d: any) => {
      let c = d.data();

      if (!c.conversations) {
        c.conversations = [];
      }
      c.conversations.push(otherMsg);
      return otherReference.update({ conversations: c.conversations });
    });
  }

  addNewChat() {
    const chatId = this.afs.createId();

    return this.afs
      .doc("conversations/" + chatId)
      .set({
        chatId: chatId,
        chatType: "Personal",
        messages: [],
      })
      .then(() => {
        this.chat = {
          chatId: chatId,
          chatType: "Personal",
          messages: [],
        };
      });
  }
  addNewPublicChat() {
    try {
      const chatId = localStorage.getItem("locationId");

      return this.afs
        .doc("publicconversations/" + chatId)
        .set({
          chatId: chatId,
          chatType: "Public",
          messages: [],
        })
        .then((res) => {
          this.chat = {
            chatId: chatId,
            chatType: "Public",
            messages: [],
          };
        })
        .catch((ex) => {});
    } catch (ex) {}
  }
  getPublicChat() {
    const chatId = localStorage.getItem("locationId");

    const storeId = localStorage.getItem("uid");

    return this.afs
      .collection("publicconversations", (ref) =>
        ref.where("chatId", "==", chatId)
      )
      .valueChanges();
  }
  pushNewPublicMessage(list) {
    const chatId = localStorage.getItem("locationId");

    return this.afs
      .doc("publicconversations/" + chatId)
      .update({ messages: list });
  }
  addNewAdminChat(chatId) {
    return this.afs
      .doc("conversations/" + chatId)
      .set({
        chatId: chatId,
        chatType: "Group",
        messages: [],
      })
      .then(() => {
        this.chat = {
          chatId: chatId,
          chatType: "Group",
          messages: [],
        };
      });
  }
  pushNewMessage(list) {
    return this.afs
      .doc("conversationsa/" + this.chat.chatId)
      .update({ messages: list });
  }

  pushNewMessagec2c(list) {
    return this.afs
      .doc("conversations/" + this.chat.chatId)
      .update({ messages: list });
  }

  pushNewMessageb2c(list) {
    return this.afs
      .doc("conversations/" + this.chat.chatId)
      .update({ messages: list });
  }

  pushNewMessagec2b(list) {
    return this.afs
      .doc("conversations/" + this.chat.chatId)
      .update({ messages: list });
  }

  clearData() {
    localStorage.clear();
    this.messages = [];
    this.currentUser = {
      conversations: [],
      name: "",
      email: "",
      uid: "",
      locationId: "",
      uniqueid: "",
    };
    this.chat = null;
    this.temp = null;
  }
}
