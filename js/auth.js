import { account, client } from './appwrite-config.js';
import { ID } from 'appwrite';

// دالة تسجيل الدخول
async function login(email, password) {
    try {
        await account.createEmailSession(email, password);
        const user = await account.get();
        if (user) {
            window.location.href = './index.html';
        }
    } catch (error) {
        showError('login', 'فشل تسجيل الدخول: ' + error.message);
    }
}

// دالة إنشاء حساب جديد
async function signup(email, password, name) {
    try {
        await account.create(ID.unique(), email, password, name);
        await login(email, password);
    } catch (error) {
        showError('signup', 'فشل إنشاء الحساب: ' + error.message);
    }
}

// دالة تسجيل الخروج
async function logout() {
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
function showError(form, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    
    const activeForm = document.querySelector(`#${form}Form`);
    activeForm.insertAdjacentElement('afterend', errorDiv);
}

// تصدير الدوال
window.login = login;
window.signup = signup;
window.logout = logout;
window.checkAuth = checkAuth;

// استدعاء دالة التحقق من حالة تسجيل الدخول
checkAuth();

// تبديل بين نماذج تسجيل الدخول وإنشاء الحساب
function toggleForms(form) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');

    if (form === 'signup') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }

    // مسح رسائل الخطأ عند التبديل
    loginError.style.display = 'none';
    loginError.textContent = '';
    signupError.style.display = 'none';
    signupError.textContent = '';
}

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    await login(email, password);
});

// إنشاء حساب جديد
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;

    await signup(email, password, name);
});

// جعل دالة toggleForms متاحة عالمياً
window.toggleForms = toggleForms;
