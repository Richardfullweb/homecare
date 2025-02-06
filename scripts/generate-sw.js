import { writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const env = {
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID
};

const swContent = `// Configuração do Service Worker para Firebase Messaging
const firebaseConfig = {
  apiKey: "${env.VITE_FIREBASE_API_KEY}",
  authDomain: "${env.VITE_FIREBASE_AUTH_DOMAIN}",
  projectId: "${env.VITE_FIREBASE_PROJECT_ID}",
  storageBucket: "${env.VITE_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${env.VITE_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${env.VITE_FIREBASE_APP_ID}"
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
`;

await writeFile(
  join(__dirname, '../public/firebase-messaging-sw.js'),
  swContent
);

console.log('Service worker gerado com sucesso!');
