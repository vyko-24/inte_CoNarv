// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
apiKey: "AIzaSyCoPB-XH-vRRbAH9RpS_C3nbdQADSoRMns",
authDomain: "reactmobile5a.firebaseapp.com",
projectId: "reactmobile5a",
storageBucket: "reactmobile5a.appspot.com",
messagingSenderId: "431176009518",
appId: "1:431176009518:web:19f02cd690383d1b9c5cbf"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Notificación en background:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg' // Tu icono
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});