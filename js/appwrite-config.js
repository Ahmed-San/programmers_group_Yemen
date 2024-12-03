import { Client, Account, Databases, Storage, Teams, ID } from 'appwrite';

// تهيئة العميل
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // نقطة النهاية الافتراضية لـ Appwrite
    .setProject('674e43500013b40f5856'); // معرف المشروع الخاص بك

// تهيئة الخدمات
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const teams = new Teams(client);

// معرفات قواعد البيانات والمجموعات
const DATABASE_ID = 'educational_resources';
const SUMMARIES_COLLECTION_ID = 'summaries';
const CATEGORIES_COLLECTION_ID = 'categories';
const BUCKET_ID = 'summaries_files';

// دالة لإنشاء قاعدة البيانات والمجموعات إذا لم تكن موجودة
async function initializeDatabase() {
    try {
        // إنشاء قاعدة البيانات
        await databases.create(DATABASE_ID, 'Educational Resources Database');
        
        // إنشاء مجموعة الملخصات
        await databases.createCollection(
            DATABASE_ID,
            SUMMARIES_COLLECTION_ID,
            'Summaries Collection'
        );

        // إنشاء الحقول لمجموعة الملخصات
        await databases.createStringAttribute(DATABASE_ID, SUMMARIES_COLLECTION_ID, 'title', 255, true);
        await databases.createStringAttribute(DATABASE_ID, SUMMARIES_COLLECTION_ID, 'description', 1000, true);
        await databases.createStringAttribute(DATABASE_ID, SUMMARIES_COLLECTION_ID, 'category', 100, true);
        await databases.createStringAttribute(DATABASE_ID, SUMMARIES_COLLECTION_ID, 'fileId', 255, true);
        await databases.createDatetimeAttribute(DATABASE_ID, SUMMARIES_COLLECTION_ID, 'uploadDate', true);
        await databases.createStringAttribute(DATABASE_ID, SUMMARIES_COLLECTION_ID, 'authorId', 255, true);
        await databases.createFloatAttribute(DATABASE_ID, SUMMARIES_COLLECTION_ID, 'rating', 0, 5, 0);
        await databases.createIntegerAttribute(DATABASE_ID, SUMMARIES_COLLECTION_ID, 'downloads', 0, null, 0);

        // إنشاء مجموعة التصنيفات
        await databases.createCollection(
            DATABASE_ID,
            CATEGORIES_COLLECTION_ID,
            'Categories Collection'
        );

        // إنشاء الحقول لمجموعة التصنيفات
        await databases.createStringAttribute(DATABASE_ID, CATEGORIES_COLLECTION_ID, 'name', 255, true);
        await databases.createStringAttribute(DATABASE_ID, CATEGORIES_COLLECTION_ID, 'description', 1000, false);
        await databases.createStringAttribute(DATABASE_ID, CATEGORIES_COLLECTION_ID, 'icon', 255, false);

        console.log('تم إنشاء قاعدة البيانات والمجموعات بنجاح');
    } catch (error) {
        if (error.code !== 409) { // تجاهل خطأ "موجود مسبقاً"
            console.error('خطأ في إنشاء قاعدة البيانات:', error);
            throw error;
        }
    }
}

// دالة لإنشاء Bucket لتخزين الملفات
async function initializeStorage() {
    try {
        await storage.createBucket(
            BUCKET_ID,
            'Summaries Files',
            ['file'],  // السماح بتخزين جميع أنواع الملفات
            ['role:all'],  // السماح للجميع بالقراءة
            ['role:admin']  // السماح للمشرفين فقط بالكتابة
        );
        console.log('تم إنشاء Bucket بنجاح');
    } catch (error) {
        if (error.code !== 409) { // تجاهل خطأ "موجود مسبقاً"
            console.error('خطأ في إنشاء Bucket:', error);
            throw error;
        }
    }
}

// تهيئة النظام
async function initialize() {
    try {
        await initializeDatabase();
        await initializeStorage();
        console.log('تم تهيئة النظام بنجاح');
    } catch (error) {
        console.error('خطأ في تهيئة النظام:', error);
    }
}

// تشغيل التهيئة
initialize();

export { 
    client, 
    account, 
    databases, 
    storage,
    teams,
    DATABASE_ID,
    SUMMARIES_COLLECTION_ID,
    CATEGORIES_COLLECTION_ID,
    BUCKET_ID
};
