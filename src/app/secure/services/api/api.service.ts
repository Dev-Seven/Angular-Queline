import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
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
  public users;
  conversationId;

  /* USERS */
  createUser(uid, data) {
    return this.afs.doc("usersa/" + uid).set({
      uid: uid,
      name: data.name,
      email: data.email,
    });
  }
  updateUser(id, data) {
    return this.afs.doc("usersa/" + id).update(data);
  }
  setCreateCurrentUser(uid, data) {
    localStorage.setItem("uid", uid);

    this.afs
      .doc("usersa/" + uid)
      .valueChanges()
      .subscribe(
        (resp) => {
          if (resp == undefined) {
            this.afs.doc("usersa/" + uid).set({
              uid: uid,
              name: data.name,
              email: data.email,
              locationId: data.locationId,
              uniqueId: data.uniqueId,
            });
          }
          this.temp = resp;
          this.currentUser = this.temp;
        },
        (err) => {
          this.afs.doc("usersa/" + uid).set({
            uid: uid,
            name: data.name,
            email: data.email,
          });
        }
      );
  }
  setCurrentUser(uid) {
    localStorage.setItem("uid", uid);
    this.afs
      .doc("usersa/" + uid)
      .valueChanges()
      .subscribe(
        (resp) => {
          this.temp = resp;
          this.currentUser = this.temp;
        },
        (err) => {}
      );
  }
  getCurrentUser() {
    this.afs
      .doc("usersa/" + localStorage.getItem("uid"))
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
  public getUsersa() {
    const locationId = localStorage.getItem("locationId");
    return this.http.get(
      `${environment.serverPath}api/user/location/${locationId}`
    );
  }
  public getUsers() {
    this.afs
      .collection<any>("users")
      .valueChanges()
      .subscribe((resp) => {
        if (resp) {
          this.users = resp.filter(
            (user) => user.locationId === this.currentUser.locationId
          );
        }
      });
  }
  public getBusinessOwner() {
    const locationQrId = localStorage.getItem("locationQrId");
    return this.http.get(
      `${environment.serverPath}api/location/qr/${locationQrId}`
    );
  }
  refreshCurrentUser() {
    this.afs
      .collection("usersa/" + localStorage.getItem("uid"))
      .valueChanges()
      .subscribe((data) => {
        this.temp = data;
        this.currentUser = this.temp;
      });
  }

  /* CHAT */
  getChat(chatId) {
    return this.afs
      .collection("conversations", (ref) => ref.where("chatId", "==", chatId))
      .valueChanges();
  }
  async addConvo(user) {
    //data to be added.
    let userMsg = [
      { name: user.name, uid: user.uid, chatId: this.chat.chatId },
    ];
    let otherMsg = {
      name: this.currentUser.name,
      uid: this.currentUser.uid,
      chatId: this.chat.chatId,
    };
    //first set both references.
    let myReference = this.afs.doc("usersa/" + this.currentUser.uid);
    let otherReference = this.afs.doc("usersa/" + user.uid);
    // Updating my profile
    myReference.get().subscribe((d: any) => {
      return myReference.update({ conversations: userMsg });
    });
    // Updating Other User Profile
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
        messages: [],
      })
      .then(() => {
        this.chat = {
          chatId: chatId,
          messages: [],
          chatType: "private",
        };
      });
  }
  pushNewMessageb2c(list) {
    return this.afs
      .doc("conversations/" + this.chat.chatId)
      .update({ messages: list });
  }
  pushNewPublicMessage(list) {
    const chatId = localStorage.getItem("locationId");
    return this.afs
      .doc("publicconversations/" + chatId)
      .update({ messages: list });
  }
  pushNewMessage(list) {
    return this.afs
      .doc("conversations/" + this.chat.chatId)
      .update({ messages: list });
  }
  getPublicChat() {
    const chatId = localStorage.getItem("locationId");
    return this.afs
      .collection("publicconversations", (ref) =>
        ref.where("chatId", "==", chatId)
      )
      .valueChanges();
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
  clearData() {
    localStorage.clear();
    this.messages = [];
    this.currentUser = {
      uid: "",
      name: "",
      email: "",
      locationId: 0,
      uniqueid: "",
      conversations: [],
    };
    this.chat = null;
    this.temp = null;
  }
}
