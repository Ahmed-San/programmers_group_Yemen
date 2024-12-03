// إعداد النماذج
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نماذج Bootstrap
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    
    // أزرار تسجيل الدخول والتسجيل
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    // إظهار نموذج تسجيل الدخول
    loginBtn.addEventListener('click', () => {
        loginModal.show();
    });

    // معالجة نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // هنا يمكن إضافة منطق تسجيل الدخول
        console.log('تم إرسال نموذج تسجيل الدخول');
    });

    // البحث
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');
    
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // هنا يمكن إضافة منطق البحث
            console.log('البحث عن:', searchTerm);
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
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.card');
                const title = card.querySelector('.card-title').textContent;
                
                // هنا يمكن إضافة منطق التحميل
                alert(`جاري تحميل: ${title}`);
            });
        });

        // تقييم الملخص
        document.querySelectorAll('.rating').forEach(rating => {
            const stars = rating.querySelectorAll('i');
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    stars.forEach((s, i) => {
                        if (i <= index) {
                            s.className = 'fas fa-star text-warning';
                        } else {
                            s.className = 'far fa-star text-warning';
                        }
                    });
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
