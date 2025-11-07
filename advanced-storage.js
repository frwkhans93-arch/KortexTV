// advanced-storage.js - نظام تخزين متقدم مع تشفير ونسخ احتياطي
class AdvancedStorage {
    constructor() {
        this.encryptionKey = 'korextv-storage-2024';
        this.backupInterval = 24 * 60 * 60 * 1000; // 24 ساعة
        this.init();
    }

    init() {
        this.setupAutoBackup();
        this.migrateOldData();
    }

    // التشفير الأساسي (Base64 - يمكن استبداله بتشفير أقوى)
    encrypt(data) {
        try {
            const jsonString = JSON.stringify(data);
            return btoa(unescape(encodeURIComponent(jsonString)));
        } catch (error) {
            console.error('Encryption error:', error);
            return data;
        }
    }

    decrypt(encryptedData) {
        try {
            const jsonString = decodeURIComponent(escape(atob(encryptedData)));
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Decryption error:', error);
            return encryptedData;
        }
    }

    // الدوال الأساسية
    set(key, value, encryptData = false) {
        try {
            const processedValue = encryptData ? this.encrypt(value) : value;
            localStorage.setItem(`korextv_${key}`, JSON.stringify({
                value: processedValue,
                encrypted: encryptData,
                timestamp: new Date().toISOString(),
                version: '1.0'
            }));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    get(key, defaultValue = null, decryptData = false) {
        try {
            const item = localStorage.getItem(`korextv_${key}`);
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);
            let value = parsed.value;

            if (decryptData && parsed.encrypted) {
                value = this.decrypt(value);
            }

            return value !== undefined ? value : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(`korextv_${key}`);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    exists(key) {
        return localStorage.getItem(`korextv_${key}`) !== null;
    }

    // الدوال المتقدمة
    setWithExpiry(key, value, expiryHours, encryptData = false) {
        const expiry = expiryHours * 60 * 60 * 1000; // تحويل إلى ملي ثانية
        const item = {
            value: encryptData ? this.encrypt(value) : value,
            encrypted: encryptData,
            expiry: Date.now() + expiry,
            timestamp: new Date().toISOString()
        };
        
        return this.set(key, item, false);
    }

    getWithExpiry(key, decryptData = false) {
        const item = this.get(key, null, false);
        
        if (!item || !item.expiry) {
            return null;
        }

        if (Date.now() > item.expiry) {
            this.remove(key);
            return null;
        }

        let value = item.value;
        if (decryptData && item.encrypted) {
            value = this.decrypt(value);
        }

        return value;
    }

    // إدارة البيانات الجماعية
    setMultiple(items, encryptData = false) {
        const results = {};
        let success = true;

        for (const [key, value] of Object.entries(items)) {
            results[key] = this.set(key, value, encryptData);
            if (!results[key]) success = false;
        }

        return { success, results };
    }

    getMultiple(keys, decryptData = false) {
        const results = {};
        
        keys.forEach(key => {
            results[key] = this.get(key, null, decryptData);
        });

        return results;
    }

    removeMultiple(keys) {
        const results = {};
        let success = true;

        keys.forEach(key => {
            results[key] = this.remove(key);
            if (!results[key]) success = false;
        });

        return { success, results };
    }

    // النسخ الاحتياطي
    backup() {
        try {
            const backupData = {};
            const keys = Object.keys(localStorage).filter(key => key.startsWith('korextv_'));

            keys.forEach(key => {
                backupData[key] = localStorage.getItem(key);
            });

            const backup = {
                data: backupData,
                timestamp: new Date().toISOString(),
                version: '1.0',
                itemCount: keys.length
            };

            // حفظ النسخة الاحتياطية
            this.set('_backup', backup, true);
            
            // حفظ تاريخ آخر نسخ احتياطي
            this.set('_lastBackup', new Date().toISOString());
            
            console.log(`✅ Backup created: ${keys.length} items`);
            return backup;
        } catch (error) {
            console.error('Backup error:', error);
            return null;
        }
    }

    restore(backupData = null) {
        try {
            const backup = backupData || this.get('_backup', null, true);
            
            if (!backup || !backup.data) {
                throw new Error('No backup data found');
            }

            // مسح البيانات الحالية
            this.clearAll();

            // استعادة البيانات
            let restoredCount = 0;
            for (const [key, value] of Object.entries(backup.data)) {
                localStorage.setItem(key, value);
                restoredCount++;
            }

            console.log(`✅ Restore completed: ${restoredCount} items restored`);
            return { success: true, restoredCount };
        } catch (error) {
            console.error('Restore error:', error);
            return { success: false, error: error.message };
        }
    }

    autoBackup() {
        const lastBackup = this.get('_lastBackup');
        const now = new Date();
        
        if (!lastBackup || (now - new Date(lastBackup)) > this.backupInterval) {
            return this.backup();
        }
        
        return null;
    }

    setupAutoBackup() {
        // نسخ احتياطي تلقائي كل 24 ساعة
        setInterval(() => {
            this.autoBackup();
        }, this.backupInterval);

        // نسخ احتياطي عند تحميل الصفحة إذا مرت 24 ساعة
        setTimeout(() => {
            this.autoBackup();
        }, 1000);
    }

    // إحصائيات التخزين
    getStorageStats() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('korextv_'));
        let totalSize = 0;

        keys.forEach(key => {
            totalSize += localStorage.getItem(key).length;
        });

        return {
            totalItems: keys.length,
            totalSize: this.formatBytes(totalSize),
            backupExists: this.exists('_backup'),
            lastBackup: this.get('_lastBackup')
        };
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // مسح جميع البيانات
    clearAll() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('korextv_'));
            keys.forEach(key => localStorage.removeItem(key));
            console.log(`✅ Cleared ${keys.length} items`);
            return true;
        } catch (error) {
            console.error('Clear all error:', error);
            return false;
        }
    }

    // ترحيل البيانات القديمة
    migrateOldData() {
        const oldKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('korvibe_') && !key.startsWith('korextv_')
        );

        if (oldKeys.length > 0) {
            console.log(`🔄 Migrating ${oldKeys.length} old data items...`);
            
            oldKeys.forEach(oldKey => {
                const newKey = oldKey.replace('korvibe_', 'korextv_');
                const value = localStorage.getItem(oldKey);
                localStorage.setItem(newKey, value);
                localStorage.removeItem(oldKey);
            });
            
            console.log('✅ Data migration completed');
        }
    }

    // معالجة أخطاء التخزين
    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            // مسح البيانات القديمة عند امتلاء التخزين
            this.clearExpiredData();
            AppUtilities.showNotification('⚠️ تم مسح البيانات القديمة تلقائياً', 'warning');
        }
    }

    clearExpiredData() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('korextv_'));
        let clearedCount = 0;

        keys.forEach(key => {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item && item.expiry && Date.now() > item.expiry) {
                    localStorage.removeItem(key);
                    clearedCount++;
                }
            } catch (error) {
                // تجاهل العناصر التي لا يمكن parsingها
            }
        });

        console.log(`✅ Cleared ${clearedCount} expired items`);
        return clearedCount;
    }

    // تصدير/استيراد البيانات
    exportData() {
        const data = {};
        const keys = Object.keys(localStorage).filter(key => key.startsWith('korextv_'));

        keys.forEach(key => {
            data[key] = localStorage.getItem(key);
        });

        return {
            data: data,
            exportDate: new Date().toISOString(),
            version: '1.0',
            itemCount: keys.length
        };
    }

    importData(importData) {
        try {
            if (!importData.data || typeof importData.data !== 'object') {
                throw new Error('Invalid import data format');
            }

            let importedCount = 0;
            for (const [key, value] of Object.entries(importData.data)) {
                if (key.startsWith('korextv_')) {
                    localStorage.setItem(key, value);
                    importedCount++;
                }
            }

            console.log(`✅ Import completed: ${importedCount} items imported`);
            return { success: true, importedCount };
        } catch (error) {
            console.error('Import error:', error);
            return { success: false, error: error.message };
        }
    }
}

// إنشاء instance global
window.AdvancedStorage = new AdvancedStorage();

console.log('✅ AdvancedStorage loaded successfully');
