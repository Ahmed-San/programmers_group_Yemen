// التحقق من تسجيل الدخول
if (!auth.currentUser) {
    window.location.href = '/login.html';
}

import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { auth, db } from "./firebase-config.js";

// تحميل الملخصات الحالية
async function loadSummaries() {
    const summariesList = document.getElementById('summariesList');
    summariesList.innerHTML = '';

    const q = query(collection(db, 'summaries'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
        const summary = doc.data();
        const div = document.createElement('div');
        div.className = 'list-group-item';
        div.innerHTML = `
            <h5>${summary.title}</h5>
            <p class="mb-1">${summary.description}</p>
            <small>التصنيف: ${summary.category}</small>
            <button class="btn btn-danger btn-sm float-start" 
                    onclick="deleteSummary('${doc.id}')">حذف</button>
        `;
        summariesList.appendChild(div);
    });
}

// إضافة ملخص جديد
document.getElementById('summaryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const file = document.getElementById('file').files[0];
    const filename = `${Date.now()}_${file.name}`;

    try {
        // إنشاء رابط للملف على GitHub
        const fileUrl = `https://raw.githubusercontent.com/Ahmed-San/programmers_group_Yemen/main/files/${filename}`;
        
        // حفظ معلومات الملخص في Firestore
        await addDoc(collection(db, 'summaries'), {
            title,
            category,
            description,
            filename,
            fileUrl,
            createdAt: new Date(),
            createdBy: auth.currentUser.uid
        });

        // تنظيف النموذج وإعادة تحميل القائمة
        document.getElementById('summaryForm').reset();
        loadSummaries();
        alert('تم إضافة معلومات الملخص بنجاح. يرجى رفع الملف إلى مجلد files على GitHub');
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء إضافة الملخص');
    }
});

// حذف ملخص
async function deleteSummary(id) {
    if (confirm('هل أنت متأكد من حذف هذا الملخص؟')) {
        try {
            await deleteDoc(doc(db, 'summaries', id));
            loadSummaries();
            alert('تم حذف الملخص بنجاح');
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ أثناء حذف الملخص');
        }
    }
}

// تحميل الملخصات عند فتح الصفحة
loadSummaries();
