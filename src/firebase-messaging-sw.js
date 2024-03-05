importScripts("https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js");

firebase.initializeApp({
  // Live
  // apiKey: "AIzaSyCUkCisNim29ukTbamtTpgcMNGonJziWQA",
  // authDomain: "quelines-300805.firebaseapp.com",
  // databaseURL: "https://quelines-300011.firebaseio.com/",
  // projectId: "quelines-300805",
  // storageBucket: "quelines-300805.appspot.com",
  // messagingSenderId: "338136272639",
  // appId: "1:338136272639:web:4098861ee7b3dce85b46ca",
  // databaseURL: "https://quelines-300805-default-rtdb.firebaseio.com",

  // // stagging
  apiKey: "AIzaSyDCB8epna_xSqkQe0cyOTCS8eUel1MThjw",
  authDomain: "queline-stage.firebaseapp.com",
  databaseURL: "https://queline-stage-default-rtdb.firebaseio.com",
  projectId: "queline-stage",
  storageBucket: "queline-stage.appspot.com",
  messagingSenderId: "453367044689",
  appId: "1:453367044689:web:19f3f76b5dc42e7e84f670",
  databaseURL: "https://queline-stage-default-rtdb.firebaseio.com",
});

const messaging = firebase.messaging();
