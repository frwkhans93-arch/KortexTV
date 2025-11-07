// app.js - الدوال المشتركة والمهمة للتطبيق
class AppUtilities {
    static init() {
        this.applyTheme();
        this.checkAuthentication();
        this.setupGlobalEventListeners();
        this.loadLanguage();
    }

    static applyTheme() {
        const savedTheme = JSON.parse(localStorage.getItem('korextv_theme') || '{}');
        if (savedTheme.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', savedTheme.primaryColor);
            document.documentElement.style.setProperty('--secondary-color', this.darkenColor(savedTheme.primaryColor, 20));
        }
        if (savedTheme.bgColor) {
            document.documentElement.style.setProperty('--background-color', savedTheme.bgColor);
        }
    }

    static darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 0 ? 0 : R) * 0x10000 + (G < 0 ? 0 : G) * 0x100 + (B < 0 ? 0 : B))
            .toString(16).slice(1);
    }

    static checkAuthentication() {
        const currentUser = JSON.parse(localStorage.getItem('korextv_currentUser') || 'null');
        const currentPage = window.location.pathname.split('/').pop();
        
        if (!currentUser && currentPage !== 'login.html') {
            window.location.href = 'login.html';
            return false;
        }
        
        if (currentUser && currentPage === 'login.html') {
            if (currentUser.isAdmin) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
            return false;
        }
        
        return true;
    }

    static setupGlobalEventListeners() {
        // منع نسخ المحتوى في صفحات معينة
        document.addEventListener('copy', (e) => {
            if (window.location.pathname.includes('admin.html')) {
                e.preventDefault();
                this.showNotification('❌ لا يمكن نسخ المحتوى من لوحة التحكم', 'error');
            }
        });

        // التأكد قبل مغادرة الصفحة
        window.addEventListener('beforeunload', (e) => {
            if (document.querySelector('video') && !document.querySelector('video').paused) {
                e.preventDefault();
                e.returnValue = 'لديك فيديو قيد التشغيل. هل تريد المغادرة؟';
            }
        });

        // إدارة حالة الاتصال
        window.addEventListener('online', () => {
            this.showNotification('✅ تم استعادة الاتصال بالإنترنت', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('⚠️ فقدت الاتصال بالإنترنت', 'warning');
        });
    }

    static loadLanguage() {
        const savedLang = localStorage.getItem('korextv_language') || 'ar';
        document.documentElement.lang = savedLang;
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
        
        if (window.translatePage) {
            window.translatePage(savedLang);
        }
    }

    static showNotification(message, type = 'info', duration = 5000) {
        // إزالة أي إشعارات سابقة
        document.querySelectorAll('.global-notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `global-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        // أنماط الإشعار
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
            border-left: 4px solid ${this.getNotificationBorderColor(type)};
        `;

        document.body.appendChild(notification);

        // إخفاء تلقائي بعد المدة المحددة
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOutRight 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }

        // إضافة أنماط الحركة إذا لم تكن موجودة
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 0;
                    width: 25px;
                    height: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.3s;
                }
                .notification-close:hover {
                    background: rgba(255,255,255,0.2);
                }
            `;
            document.head.appendChild(style);
        }
    }

    static getNotificationColor(type) {
        const colors = {
            info: '#17a2b8',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545'
        };
        return colors[type] || colors.info;
    }

    static getNotificationBorderColor(type) {
        const colors = {
            info: '#138496',
            success: '#1e7e34',
            warning: '#e0a800',
            error: '#c82333'
        };
        return colors[type] || colors.info;
    }

    static formatNumber(number) {
        return new Intl.NumberFormat('ar-EG').format(number);
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }
}

// نظام اللغات المتكامل
const translations = {
    ar: {
        app: {
            name: "KorexTV",
            slogan: "مسلسلات كورية في مقاطع قصيرة"
        },
        auth: {
            login: "تسجيل الدخول",
            register: "إنشاء حساب",
            forgot_password: "نسيت كلمة المرور؟",
            no_account: "ليس لديك حساب؟",
            have_account: "لديك حساب؟",
            create_account: "إنشاء حساب"
        },
        navigation: {
            home: "الرئيسية",
            profile: "الملف الشخصي",
            movies: "الأفلام",
            series: "المسلسلات",
            admin: "لوحة التحكم"
        },
        common: {
            loading: "جاري التحميل...",
            error: "حدث خطأ",
            success: "تم بنجاح",
            warning: "تحذير",
            confirm: "تأكيد",
            cancel: "إلغاء",
            save: "حفظ",
            delete: "حذف",
            edit: "تعديل",
            view: "عرض"
        }
    },
    en: {
        app: {
            name: "KorexTV",
            slogan: "Korean dramas in short clips"
        },
        auth: {
            login: "Login",
            register: "Register",
            forgot_password: "Forgot Password?",
            no_account: "Don't have an account?",
            have_account: "Already have an account?",
            create_account: "Create Account"
        },
        navigation: {
            home: "Home",
            profile: "Profile",
            movies: "Movies",
            series: "Series",
            admin: "Admin Panel"
        },
        common: {
            loading: "Loading...",
            error: "Error",
            success: "Success",
            warning: "Warning",
            confirm: "Confirm",
            cancel: "Cancel",
            save: "Save",
            delete: "Delete",
            edit: "Edit",
            view: "View"
        }
    },
    fr: {
        app: {
            name: "KorexTV",
            slogan: "Dramas coréens en courts métrages"
        },
        auth: {
            login: "Connexion",
            register: "Créer un compte",
            forgot_password: "Mot de passe oublié?",
            no_account: "Pas de compte?",
            have_account: "Déjà un compte?",
            create_account: "Créer un compte"
        }
    }
};

function translatePage(lang) {
    const selectedLang = translations[lang] || translations.ar;
    
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        const keys = key.split('.');
        let value = selectedLang;
        
        for (const k of keys) {
            value = value ? value[k] : null;
            if (!value) break;
        }
        
        if (value && typeof value === 'string') {
            if (element.tagName === 'INPUT' && element.type !== 'submit') {
                element.placeholder = value;
            } else {
                element.textContent = value;
            }
        }
    });

    // تحديث لغة المستند
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // حفظ اللغة المختارة
    localStorage.setItem('korextv_language', lang);
}

// دالة تغيير اللغة
function changeLanguage(lang) {
    translatePage(lang);
}

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    AppUtilities.init();
    
    // تحميل اللغة المحفوظة
    const savedLang = localStorage.getItem('korextv_language') || 'ar';
    if (document.getElementById('language-select')) {
        document.getElementById('language-select').value = savedLang;
    }
    translatePage(savedLang);
});

// جعل الدوال متاحة globally
window.AppUtilities = AppUtilities;
window.translatePage = translatePage;
window.changeLanguage = changeLanguage;

console.log('✅ AppUtilities loaded successfully');
