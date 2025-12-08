import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
apiKey: "AIzaSyCoPB-XH-vRRbAH9RpS_C3nbdQADSoRMns",
authDomain: "reactmobile5a.firebaseapp.com",
projectId: "reactmobile5a",
storageBucket: "reactmobile5a.appspot.com",
messagingSenderId: "431176009518",
appId: "1:431176009518:web:19f02cd690383d1b9c5cbf"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Necesitas generar una "Key pair" en la consola de Firebase > Project Settings > Cloud Messaging > Web Push Certificates
export const VAPID_KEY = "BL5TpgN-rQI9Jmv5Sky4x6DmvEYuIQ5VLOtnN3Btb3Lm4bs_tWe-VAlIECBU3V8IPJu_GPXYc-CkQ_-yrZiI_Tw";