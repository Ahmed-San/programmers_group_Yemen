import { account, client } from './appwrite-config.js';
import { ID, Teams } from 'appwrite';

// إنشاء كائن Teams
const teams = new Teams(client);

// دالة التحقق من صلاحيات المشرف
async function isAdmin() {
    try {
        const teamsList = await teams.list();
        const adminTeam = teamsList.teams.find(team => team.$id === 'admins');
        if (!adminTeam) return false;

        const membership = await teams.listMemberships(adminTeam.$id);
        return membership.total > 0;
    } catch (error) {
        console.error('خطأ في التحقق من صلاحيات المشرف:', error);
        return false;
    }
}

// دالة تسجيل الدخول
async function login(email, password) {
    try {
        await account.createEmailSession(email, password);
        const isUserAdmin = await isAdmin();
        if (isUserAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        showError('فشل تسجيل الدخول: ' + error.message);
    }
}

// دالة إنشاء حساب جديد
async function signup(email, password, name) {
    try {
        await account.create(ID.unique(), email, password, name);
        await login(email, password);
    } catch (error) {
        showError('فشل إنشاء الحساب: ' + error.message);
    }
}

// دالة تسجيل الخروج
async function logout() {
    try {
        await account.deleteSession('current');
        window.location.href = 'index.html';
    } catch (error) {
        showError('فشل تسجيل الخروج: ' + error.message);
    }
}

// دالة التحقق من حالة تسجيل الدخول
async function checkAuth() {
    try {
        const session = await account.getSession('current');
        if (!session) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        window.location.href = 'login.html';
    }
}

// دالة إظهار رسائل الخطأ
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    
    const activeForm = document.querySelector('form');
    activeForm.insertAdjacentElement('afterend', errorDiv);
}

// تصدير الدوال
export { login, signup, logout, checkAuth, isAdmin };

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

// تسجيل الخروج
window.logout = async function() {
    await logout();
};

// جعل دالة toggleForms متاحة عالمياً
window.toggleForms = toggleForms;
