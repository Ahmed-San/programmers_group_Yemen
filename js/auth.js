import { account } from './appwrite-config.js';
import { ID } from 'appwrite';

// دالة تسجيل الدخول
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
        await account.createEmailSession(email, password);
        const user = await account.get();
        if (user) {
            window.location.href = './index.html';
        }
    } catch (error) {
        showError('loginError', 'فشل تسجيل الدخول: ' + error.message);
    }
}

// دالة إنشاء حساب جديد
async function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('[name="name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
        await account.create(ID.unique(), email, password, name);
        await handleLogin({ 
            preventDefault: () => {},
            target: form
        });
    } catch (error) {
        showError('signupError', 'فشل إنشاء الحساب: ' + error.message);
    }
}

// دالة تسجيل الخروج
async function handleLogout() {
    try {
        await account.deleteSession('current');
        window.location.href = './index.html';
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
    }
}

// دالة التحقق من حالة تسجيل الدخول
async function checkAuth() {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        return null;
    }
}

// دالة إظهار رسائل الخطأ
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// إضافة مستمعي الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginFormElement');
    const signupForm = document.getElementById('signupFormElement');
    const logoutBtn = document.getElementById('logoutBtn');

    loginForm?.addEventListener('submit', handleLogin);
    signupForm?.addEventListener('submit', handleSignup);
    logoutBtn?.addEventListener('click', handleLogout);

    // التحقق من حالة تسجيل الدخول
    checkAuth().then(user => {
        if (user && window.location.pathname.includes('login.html')) {
            window.location.href = './index.html';
        }
    });
});
