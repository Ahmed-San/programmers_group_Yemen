import { client, databases, storage } from './appwrite-config.js';
import { ID } from 'appwrite';

// معرفات قواعد البيانات والمجموعات
const DATABASE_ID = 'educational_resources';
const SUMMARIES_COLLECTION_ID = 'summaries';
const CATEGORIES_COLLECTION_ID = 'categories';
const BUCKET_ID = 'summaries_files';

// التحقق من تسجيل الدخول
async function checkAuth() {
    try {
        const user = await client.account.get();
        const isAdmin = await client.teams.list().then(teams => 
            teams.teams.some(team => team.name === 'admin')
        );
        if (!isAdmin) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        window.location.href = 'login.html';
    }
}

// دوال إدارة التصنيفات
async function addCategory(name, description, icon) {
    try {
        const category = await databases.createDocument(
            DATABASE_ID,
            CATEGORIES_COLLECTION_ID,
            ID.unique(),
            {
                name,
                description,
                icon
            }
        );
        return category;
    } catch (error) {
        console.error('خطأ في إضافة التصنيف:', error);
        throw error;
    }
}

async function listCategories() {
    try {
        const categories = await databases.listDocuments(
            DATABASE_ID,
            CATEGORIES_COLLECTION_ID
        );
        return categories;
    } catch (error) {
        console.error('خطأ في جلب التصنيفات:', error);
        throw error;
    }
}

async function deleteCategory(categoryId) {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            CATEGORIES_COLLECTION_ID,
            categoryId
        );
    } catch (error) {
        console.error('خطأ في حذف التصنيف:', error);
        throw error;
    }
}

// دوال إدارة الملخصات
async function addSummary(title, description, category, file) {
    try {
        // 1. رفع الملف
        const fileUpload = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file
        );

        // 2. إضافة معلومات الملخص
        const summary = await databases.createDocument(
            DATABASE_ID,
            SUMMARIES_COLLECTION_ID,
            ID.unique(),
            {
                title,
                description,
                category,
                fileId: fileUpload.$id,
                uploadDate: new Date().toISOString(),
                authorId: client.account.get().$id,
                downloads: 0,
                rating: 0
            }
        );

        return summary;
    } catch (error) {
        console.error('خطأ في إضافة الملخص:', error);
        throw error;
    }
}

async function listSummaries() {
    try {
        const summaries = await databases.listDocuments(
            DATABASE_ID,
            SUMMARIES_COLLECTION_ID
        );
        return summaries;
    } catch (error) {
        console.error('خطأ في جلب الملخصات:', error);
        throw error;
    }
}

async function deleteSummary(summaryId, fileId) {
    try {
        // 1. حذف الملف
        await storage.deleteFile(BUCKET_ID, fileId);
        
        // 2. حذف معلومات الملخص
        await databases.deleteDocument(
            DATABASE_ID,
            SUMMARIES_COLLECTION_ID,
            summaryId
        );
    } catch (error) {
        console.error('خطأ في حذف الملخص:', error);
        throw error;
    }
}

// تحميل التصنيفات في القائمة المنسدلة
async function loadCategorySelect() {
    const select = document.getElementById('category');
    select.innerHTML = '<option value="">اختر التصنيف</option>';
    
    try {
        const { documents } = await listCategories();
        documents.forEach(category => {
            const option = document.createElement('option');
            option.value = category.$id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في تحميل التصنيفات:', error);
    }
}

// عرض قائمة التصنيفات
async function displayCategories() {
    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = '';

    try {
        const { documents } = await listCategories();
        documents.forEach(category => {
            const div = document.createElement('div');
            div.className = 'list-group-item';
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <i class="bi ${category.icon || 'bi-folder'}"></i>
                        <h6 class="mb-1">${category.name}</h6>
                        <small class="text-muted">${category.description || ''}</small>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory('${category.$id}')">
                        حذف
                    </button>
                </div>
            `;
            categoriesList.appendChild(div);
        });
    } catch (error) {
        console.error('خطأ في عرض التصنيفات:', error);
        categoriesList.innerHTML = '<div class="alert alert-danger">حدث خطأ في تحميل التصنيفات</div>';
    }
}

// عرض قائمة الملخصات
async function displaySummaries() {
    const summariesList = document.getElementById('summariesList');
    summariesList.innerHTML = '';

    try {
        const { documents } = await listSummaries();
        documents.forEach(summary => {
            const div = document.createElement('div');
            div.className = 'list-group-item';
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${summary.title}</h6>
                        <p class="mb-1">${summary.description}</p>
                        <small class="text-muted">التحميلات: ${summary.downloads}</small>
                    </div>
                    <div>
                        <button class="btn btn-danger btn-sm" onclick="deleteSummary('${summary.$id}', '${summary.fileId}')">
                            حذف
                        </button>
                    </div>
                </div>
            `;
            summariesList.appendChild(div);
        });
    } catch (error) {
        console.error('خطأ في عرض الملخصات:', error);
        summariesList.innerHTML = '<div class="alert alert-danger">حدث خطأ في تحميل الملخصات</div>';
    }
}

// معالجة نموذج إضافة تصنيف
document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;
    const icon = document.getElementById('categoryIcon').value;

    try {
        await addCategory(name, description, icon);
        alert('تم إضافة التصنيف بنجاح');
        e.target.reset();
        displayCategories();
        loadCategorySelect();
    } catch (error) {
        alert('حدث خطأ أثناء إضافة التصنيف: ' + error.message);
    }
});

// معالجة نموذج إضافة ملخص
document.getElementById('summaryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const file = document.getElementById('file').files[0];

    try {
        await addSummary(title, description, category, file);
        alert('تم إضافة الملخص بنجاح');
        e.target.reset();
        displaySummaries();
    } catch (error) {
        alert('حدث خطأ أثناء إضافة الملخص: ' + error.message);
    }
});

// تحميل البيانات عند فتح الصفحة
window.onload = async () => {
    await checkAuth();
    await loadCategorySelect();
    await displayCategories();
    await displaySummaries();
};

// تصدير الدوال للاستخدام في window
window.deleteCategory = deleteCategory;
window.deleteSummary = deleteSummary;
