import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// التحقق من حالة تسجيل الدخول
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // التحقق من صلاحيات المستخدم
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (!adminDoc.exists()) {
            // إذا لم يكن المستخدم مسؤولاً، قم بتسجيل خروجه
            await signOut(auth);
            window.location.href = '/login.html';
        }
    } else {
        // إذا لم يكن هناك مستخدم مسجل، انتقل إلى صفحة تسجيل الدخول
        if (!window.location.href.includes('login.html')) {
            window.location.href = '/login.html';
        }
    }
});

// تبديل بين نماذج تسجيل الدخول وإنشاء الحساب
window.toggleForms = function() {
    const loginContainer = document.querySelector('.container:not(#signupContainer)');
    const signupContainer = document.getElementById('signupContainer');
    
    if (loginContainer.style.display !== 'none') {
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
    } else {
        loginContainer.style.display = 'block';
        signupContainer.style.display = 'none';
    }
};

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'admin.html';
    } catch (error) {
        showError('خطأ في تسجيل الدخول: ' + error.message);
    }
});

// إنشاء حساب جديد
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showError('كلمات المرور غير متطابقة');
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('تم إنشاء الحساب بنجاح!');
        window.location.href = 'admin.html';
    } catch (error) {
        showError('خطأ في إنشاء الحساب: ' + error.message);
    }
});

// عرض رسائل الخطأ
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    
    // إضافة رسالة الخطأ للنموذج النشط
    const activeForm = document.querySelector('form:not([style*="display: none"])');
    const existingError = activeForm.parentElement.querySelector('.alert');
    if (existingError) {
        existingError.remove();
    }
    activeForm.insertAdjacentElement('afterend', errorDiv);
}
