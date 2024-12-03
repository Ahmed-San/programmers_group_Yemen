import { client, account, databases, storage } from './appwrite-config.js';
import { ID } from 'appwrite';

// التحقق من صلاحيات المشرف
async function checkAdminAuth() {
    try {
        const user = await account.get();
        if (!user) {
            window.location.href = './login.html';
            return;
        }

        // التحقق من عضوية فريق المشرفين
        const teams = await client.teams.list();
        const adminTeam = teams.teams.find(team => team.name === 'Admins');
        if (!adminTeam) {
            window.location.href = './index.html';
            return;
        }

        const membership = await client.teams.getMembership(adminTeam.$id);
        if (!membership) {
            window.location.href = './index.html';
        }
    } catch (error) {
        console.error('خطأ في التحقق من صلاحيات المشرف:', error);
        window.location.href = './login.html';
    }
}

// تحميل التصنيفات
async function loadCategories() {
    try {
        const categories = await databases.listDocuments(
            'educational_resources',
            'categories'
        );
        displayCategories(categories.documents);
    } catch (error) {
        console.error('خطأ في تحميل التصنيفات:', error);
    }
}

// عرض التصنيفات
function displayCategories(categories) {
    const categoriesTable = document.getElementById('categoriesTable');
    categoriesTable.innerHTML = categories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>${category.description}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editCategory('${category.$id}')">تعديل</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category.$id}')">حذف</button>
            </td>
        </tr>
    `).join('');
}

// إضافة تصنيف جديد
async function addCategory(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('[name="name"]').value;
    const description = form.querySelector('[name="description"]').value;

    try {
        await databases.createDocument(
            'educational_resources',
            'categories',
            ID.unique(),
            { name, description }
        );
        form.reset();
        loadCategories();
    } catch (error) {
        console.error('خطأ في إضافة التصنيف:', error);
    }
}

// حذف تصنيف
async function deleteCategory(categoryId) {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
        try {
            await databases.deleteDocument(
                'educational_resources',
                'categories',
                categoryId
            );
            loadCategories();
        } catch (error) {
            console.error('خطأ في حذف التصنيف:', error);
        }
    }
}

// تحميل الملخصات
async function loadSummaries() {
    try {
        const summaries = await databases.listDocuments(
            'educational_resources',
            'summaries'
        );
        displaySummaries(summaries.documents);
    } catch (error) {
        console.error('خطأ في تحميل الملخصات:', error);
    }
}

// عرض الملخصات
function displaySummaries(summaries) {
    const summariesTable = document.getElementById('summariesTable');
    summariesTable.innerHTML = summaries.map(summary => `
        <tr>
            <td>${summary.title}</td>
            <td>${summary.description}</td>
            <td>${summary.category}</td>
            <td>${summary.rating || 0}</td>
            <td>${summary.downloads || 0}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editSummary('${summary.$id}')">تعديل</button>
                <button class="btn btn-sm btn-danger" onclick="deleteSummary('${summary.$id}')">حذف</button>
            </td>
        </tr>
    `).join('');
}

// إضافة ملخص جديد
async function addSummary(event) {
    event.preventDefault();
    const form = event.target;
    const title = form.querySelector('[name="title"]').value;
    const description = form.querySelector('[name="description"]').value;
    const category = form.querySelector('[name="category"]').value;
    const file = form.querySelector('[name="file"]').files[0];

    try {
        // رفع الملف
        const uploadedFile = await storage.createFile(
            'summaries_files',
            ID.unique(),
            file
        );

        // إنشاء الملخص
        await databases.createDocument(
            'educational_resources',
            'summaries',
            ID.unique(),
            {
                title,
                description,
                category,
                fileId: uploadedFile.$id,
                uploadDate: new Date().toISOString(),
                rating: 0,
                downloads: 0
            }
        );

        form.reset();
        loadSummaries();
    } catch (error) {
        console.error('خطأ في إضافة الملخص:', error);
    }
}

// حذف ملخص
async function deleteSummary(summaryId) {
    if (confirm('هل أنت متأكد من حذف هذا الملخص؟')) {
        try {
            const summary = await databases.getDocument(
                'educational_resources',
                'summaries',
                summaryId
            );

            // حذف الملف
            if (summary.fileId) {
                await storage.deleteFile('summaries_files', summary.fileId);
            }

            // حذف الملخص
            await databases.deleteDocument(
                'educational_resources',
                'summaries',
                summaryId
            );

            loadSummaries();
        } catch (error) {
            console.error('خطأ في حذف الملخص:', error);
        }
    }
}

// تصدير الدوال
window.addCategory = addCategory;
window.deleteCategory = deleteCategory;
window.addSummary = addSummary;
window.deleteSummary = deleteSummary;

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAuth();
    await loadCategories();
    await loadSummaries();

    // إضافة مستمعي الأحداث للنماذج
    document.getElementById('categoryForm').addEventListener('submit', addCategory);
    document.getElementById('summaryForm').addEventListener('submit', addSummary);
});
