// firebase-config.js
// تكوين Firebase - ضع بيانات مشروعك الفعلية هنا

// ⚠️ ملاحظة: هذه بيانات تجريبية - استبدلها ببيانات مشروعك في Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyC4R2Xp8V9x6qYQ3wZ1mN8bKd7cRtS2t3U",
    authDomain: "korextv-app.firebaseapp.com",
    projectId: "korextv-app",
    storageBucket: "korextv-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcd1234efgh5678ijkl90"
};

// تهيئة Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    console.log("Firebase already initialized");
}

// تعريف مراجع قاعدة البيانات
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// تصدير للاستخدام في الملفات الأخرى
window.firebaseDB = db;
window.firebaseAuth = auth;
window.firebaseStorage = storage;

console.log("✅ Firebase configured successfully");
