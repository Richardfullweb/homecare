// Configuração do Service Worker para Firebase Messaging
const firebaseConfig = {
  apiKey: "undefined",
  authDomain: "undefined",
  projectId: "undefined",
  storageBucket: "undefined",
  messagingSenderId: "undefined",
  appId: "undefined"
};

// Inicializa o Firebase
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Configura o handler para mensagens em background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Nova mensagem';
  const notificationOptions = {
    body: payload.notification?.body || 'Você tem uma nova notificação',
    icon: payload.notification?.icon || '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
