import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase-config.js";

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

// معالجة نموذج تسجيل الدخول
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = '/admin.html';
    } catch (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'خطأ في البريد الإلكتروني أو كلمة المرور';
    }
});
