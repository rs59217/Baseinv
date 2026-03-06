// ========================
// CONFIGURACIÓN FIREBASE
// ========================

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC2qOg2u4EXFlDE_1a4h046SblSpfsb0Cg",
    authDomain: "baseinvs-d221b.firebaseapp.com",
    projectId: "baseinvs-d221b",
    storageBucket: "baseinvs-d221b.firebasestorage.app",
    messagingSenderId: "359892502941",
    appId: "1:359892502941:web:e5ad66a1e960fc95bb0774"
};

// Inicializar Firebase
let firebaseApp = null;
let db = null;
let firebaseReady = false;

try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    
    // Configurar Firestore
    db.settings({ experimentalForceLongPolling: true });
    
    firebaseReady = true;
    console.log('✅ Firebase inicializado correctamente');
    console.log('📊 Firestore disponible para sincronización');
    console.log('🔄 Modo Híbrido: localStorage + Firebase');
} catch (error) {
    console.warn('⚠️ Firebase no disponible, usando localStorage:', error.message);
    console.log('💾 Los datos se guardarán localmente y se sincronizarán cuando Firebase esté disponible');
    firebaseReady = false;
}

// Verificar estado de Firebase
const isFirebaseReady = () => firebaseReady && db != null;
