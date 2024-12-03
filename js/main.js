import { client, account, databases, storage } from './appwrite-config.js';
import { ID } from 'appwrite';
import { Query } from 'appwrite';

// إعداد النماذج
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // التحقق من حالة تسجيل الدخول
        const user = await account.get();
        if (user) {
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('userMenu').style.display = 'block';
            document.getElementById('userName').textContent = user.name;
        }
    } catch (error) {
        console.error('خطأ في التحقق من حالة تسجيل الدخول:', error);
    }

    // تهيئة نماذج Bootstrap
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    
    // أزرار تسجيل الدخول والتسجيل
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    // إظهار نموذج تسجيل الدخول
    loginBtn?.addEventListener('click', () => {
        loginModal.show();
    });

    // معالجة نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('[name="email"]').value;
        const password = loginForm.querySelector('[name="password"]').value;
        
        try {
            await account.createEmailSession(email, password);
            window.location.reload();
        } catch (error) {
            showError('login', error.message);
        }
    });

    // البحث
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');
    
    searchBtn?.addEventListener('click', async () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            try {
                const summaries = await databases.listDocuments(
                    'educational_resources',
                    'summaries',
                    [
                        Query.search('title', searchTerm)
                    ]
                );
                displaySearchResults(summaries.documents);
            } catch (error) {
                console.error('خطأ في البحث:', error);
            }
        }
    });

    // تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', async () => {
        try {
            await account.deleteSession('current');
            window.location.reload();
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
        }
    });

    // التنقل السلس
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // تحميل المحتوى بشكل متحرك
    function animateOnScroll() {
        const elements = document.querySelectorAll('.category-card');
        elements.forEach(element => {
            const position = element.getBoundingClientRect();
            if (position.top < window.innerHeight) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    // تطبيق التأثيرات عند التمرير
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // تشغيل مرة واحدة عند التحميل

    // وظائف صفحة الملخصات
    if (window.location.pathname.includes('summaries.html')) {
        const filterForm = document.querySelector('.filter-section');
        const summaryCards = document.querySelectorAll('.summary-card');
        
        // تصفية الملخصات
        function filterSummaries() {
            const subject = document.querySelector('select:nth-child(1)').value;
            const level = document.querySelector('select:nth-child(2)').value;
            const searchTerm = document.querySelector('.filter-section input').value.toLowerCase();

            summaryCards.forEach(card => {
                const cardSubject = card.querySelector('.badge').textContent;
                const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
                
                const matchesSubject = subject === 'اختر المادة' || cardSubject === subject;
                const matchesSearch = cardTitle.includes(searchTerm);
                
                if (matchesSubject && matchesSearch) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // تحميل الملخص
        document.querySelectorAll('.summary-card button').forEach(button => {
            button.addEventListener('click', async function(e) {
                e.preventDefault();
                const card = this.closest('.card');
                const title = card.querySelector('.card-title').textContent;
                
                try {
                    const file = await storage.getFile('educational_resources', title);
                    const fileUrl = await storage.getFileView('educational_resources', file.$id);
                    window.open(fileUrl, '_blank');
                } catch (error) {
                    console.error('خطأ في تحميل الملخص:', error);
                }
            });
        });

        // تقييم الملخص
        document.querySelectorAll('.rating').forEach(rating => {
            const stars = rating.querySelectorAll('i');
            stars.forEach((star, index) => {
                star.addEventListener('click', async () => {
                    stars.forEach((s, i) => {
                        if (i <= index) {
                            s.className = 'fas fa-star text-warning';
                        } else {
                            s.className = 'far fa-star text-warning';
                        }
                    });
                    try {
                        const summaryId = rating.closest('.card').getAttribute('data-id');
                        await databases.updateDocument(
                            'educational_resources',
                            'summaries',
                            ID.unique(),
                            {
                                rating: index + 1
                            }
                        );
                    } catch (error) {
                        console.error('خطأ في تقييم الملخص:', error);
                    }
                });
            });
        });

        // إضافة مستمعي الأحداث للتصفية
        const filterInputs = filterForm.querySelectorAll('select, input');
        filterInputs.forEach(input => {
            input.addEventListener('change', filterSummaries);
            input.addEventListener('keyup', filterSummaries);
        });

        document.querySelector('.filter-section button').addEventListener('click', filterSummaries);
    }
});

// عرض رسالة الخطأ
function showError(formId, message) {
    const form = document.getElementById(formId);
    const errorElement = form.querySelector('.error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// عرض نتائج البحث
function displaySearchResults(results) {
    const searchResultsElement = document.getElementById('searchResults');
    searchResultsElement.innerHTML = '';
    results.forEach(result => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h5 class="card-title">${result.title}</h5>
            <p class="card-text">${result.description}</p>
            <button class="btn btn-primary">تحميل</button>
        `;
        searchResultsElement.appendChild(card);
    });
}
