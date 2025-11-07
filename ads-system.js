// ads-system.js - نظام الإعلانات المتكامل
class AdSystem {
    constructor() {
        this.ads = this.loadAds();
        this.settings = this.loadAdSettings();
        this.adCounter = 0;
        this.adRevenue = 0;
        this.initialized = false;
        
        this.init();
    }

    init() {
        this.initialized = true;
        console.log('✅ AdSystem initialized');
        
        // تحميل الإعلانات التلقائية إذا كانت مفعلة
        if (this.settings.autoLoad) {
            this.preloadAds();
        }
    }

    loadAdSettings() {
        return JSON.parse(localStorage.getItem('korextv_adSettings') || JSON.stringify({
            enabled: true,
            frequency: 2,
            types: ['banner', 'video'],
            autoLoad: true,
            targeting: {
                byInterests: true,
                byBehavior: true,
                byLocation: false
            },
            revenue: {
                cpm: 2.5, // تكلفة لكل 1000 ظهور
                cpc: 0.5  // تكلفة لكل نقرة
            }
        }));
    }

    loadAds() {
        return JSON.parse(localStorage.getItem('korextv_ads') || JSON.stringify([
            {
                id: 1,
                type: 'banner',
                title: '🎪 عروض خاصة',
                content: 'استمتع بأفضل العروض على المسلسلات الكورية!',
                image: '🎯',
                link: '#',
                duration: 0,
                isActive: true
            },
            {
                id: 2,
                type: 'video',
                title: '📱 حمل التطبيق الآن',
                content: 'حمل تطبيق KorexTV على هاتفك!',
                videoUrl: '#',
                duration: 15,
                isActive: true
            },
            {
                id: 3,
                type: 'interstitial',
                title: '💎 اشترك الآن',
                content: 'احصل على محتوى حصري مع الاشتراك المميز!',
                image: '💎',
                link: '#',
                duration: 5,
                isActive: true
            }
        ]));
    }

    saveAdSettings() {
        localStorage.setItem('korextv_adSettings', JSON.stringify(this.settings));
    }

    saveAds() {
        localStorage.setItem('korextv_ads', JSON.stringify(this.ads));
    }

    preloadAds() {
        // محاكاة تحميل الإعلانات
        console.log('📢 Preloading ads...');
    }

    showAd(type = 'auto') {
        if (!this.settings.enabled) {
            console.log('📢 Ads are disabled');
            return false;
        }

        this.adCounter++;

        // التحقق من التكرار
        if (this.adCounter % this.settings.frequency !== 0) {
            return false;
        }

        // اختيار نوع الإعلان تلقائياً إذا لم يتم تحديده
        if (type === 'auto') {
            const availableTypes = this.settings.types.filter(t => 
                this.ads.some(ad => ad.type === t && ad.isActive)
            );
            type = availableTypes[Math.floor(Math.random() * availableTypes.length)] || 'banner';
        }

        // عرض الإعلان حسب النوع
        switch(type) {
            case 'video':
                return this.showVideoAd();
            case 'interstitial':
                return this.showInterstitialAd();
            case 'banner':
            default:
                return this.showBannerAd();
        }
    }

    showBannerAd() {
        const activeBannerAds = this.ads.filter(ad => ad.type === 'banner' && ad.isActive);
        if (activeBannerAds.length === 0) return false;

        const ad = activeBannerAds[Math.floor(Math.random() * activeBannerAds.length)];
        
        const adHTML = `
            <div class="ad-banner-overlay">
                <div class="ad-banner">
                    <div class="ad-header">
                        <span class="ad-badge">إعلان</span>
                        <button class="ad-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
                    </div>
                    <div class="ad-content">
                        <div class="ad-icon">${ad.image}</div>
                        <div class="ad-text">
                            <h4>${ad.title}</h4>
                            <p>${ad.content}</p>
                        </div>
                    </div>
                    <button class="ad-action-btn" onclick="window.open('${ad.link}', '_blank')">اعرف المزيد</button>
                </div>
            </div>
        `;

        this.injectAd(adHTML, 'banner');
        this.trackImpression(ad.id);
        return true;
    }

    showVideoAd() {
        const activeVideoAds = this.ads.filter(ad => ad.type === 'video' && ad.isActive);
        if (activeVideoAds.length === 0) return false;

        const ad = activeVideoAds[Math.floor(Math.random() * activeVideoAds.length)];
        
        const adHTML = `
            <div class="ad-video-overlay">
                <div class="ad-video-container">
                    <div class="ad-header">
                        <span class="ad-badge">إعلان فيديو</span>
                        <span class="ad-timer" id="video-ad-timer">${ad.duration}</span>
                    </div>
                    <div class="ad-video-content">
                        <div class="video-placeholder">
                            <div class="video-icon">🎬</div>
                            <p>${ad.title}</p>
                            <p class="ad-description">${ad.content}</p>
                        </div>
                    </div>
                    <div class="ad-progress">
                        <div class="ad-progress-bar" id="video-ad-progress"></div>
                    </div>
                </div>
            </div>
        `;

        this.injectAd(adHTML, 'video');
        this.trackImpression(ad.id);
        this.startVideoAdTimer(ad.duration);
        return true;
    }

    showInterstitialAd() {
        const activeInterstitialAds = this.ads.filter(ad => ad.type === 'interstitial' && ad.isActive);
        if (activeInterstitialAds.length === 0) return false;

        const ad = activeInterstitialAds[Math.floor(Math.random() * activeInterstitialAds.length)];
        
        const adHTML = `
            <div class="ad-interstitial-overlay">
                <div class="ad-interstitial">
                    <div class="ad-header">
                        <span class="ad-badge">إعلان</span>
                        <span class="ad-timer" id="interstitial-timer">${ad.duration}</span>
                    </div>
                    <div class="ad-content">
                        <div class="ad-icon-large">${ad.image}</div>
                        <h3>${ad.title}</h3>
                        <p>${ad.content}</p>
                    </div>
                    <div class="ad-actions">
                        <button class="ad-secondary-btn" onclick="adSystem.skipAd()">تخطي</button>
                        <button class="ad-primary-btn" onclick="window.open('${ad.link}', '_blank'); adSystem.skipAd()">اكتشف المزيد</button>
                    </div>
                </div>
            </div>
        `;

        this.injectAd(adHTML, 'interstitial');
        this.trackImpression(ad.id);
        this.startInterstitialTimer(ad.duration);
        return true;
    }

    injectAd(html, type) {
        // إزالة أي إعلانات سابقة
        this.removeExistingAds();

        const adContainer = document.createElement('div');
        adContainer.className = `ad-container ad-${type}`;
        adContainer.innerHTML = html;
        
        document.body.appendChild(adContainer);

        // إضافة الأنماط إذا لم تكن موجودة
        this.injectAdStyles();

        // تسجيل العرض
        this.trackAdView(type);
    }

    injectAdStyles() {
        if (document.getElementById('ad-styles')) return;

        const styles = `
            <style id="ad-styles">
                .ad-container {
                    position: fixed;
                    z-index: 10000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                /* Banner Ad Styles */
                .ad-banner-overlay {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 1rem;
                    max-width: 400px;
                    width: 90%;
                    border: 2px solid #ffd700;
                    animation: slideUpBanner 0.3s ease;
                }

                @keyframes slideUpBanner {
                    from { transform: translateX(-50%) translateY(100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }

                .ad-banner {
                    text-align: center;
                }

                .ad-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .ad-badge {
                    background: #ffd700;
                    color: #000;
                    padding: 4px 8px;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    font-weight: bold;
                }

                .ad-close {
                    background: none;
                    border: none;
                    color: #fff;
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

                .ad-close:hover {
                    background: rgba(255,255,255,0.1);
                }

                .ad-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .ad-icon {
                    font-size: 2rem;
                }

                .ad-text {
                    text-align: right;
                    flex: 1;
                }

                .ad-text h4 {
                    margin: 0 0 0.5rem 0;
                    color: #fff;
                }

                .ad-text p {
                    margin: 0;
                    color: #ccc;
                    font-size: 0.9rem;
                }

                .ad-action-btn, .ad-primary-btn, .ad-secondary-btn {
                    background: linear-gradient(135deg, #e50914, #b2070f);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                    width: 100%;
                }

                .ad-action-btn:hover, .ad-primary-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(229, 9, 20, 0.4);
                }

                .ad-secondary-btn {
                    background: #333;
                }

                .ad-secondary-btn:hover {
                    background: #444;
                }

                /* Video Ad Styles */
                .ad-video-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.95);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10001;
                }

                .ad-video-container {
                    background: #1a1a1a;
                    border-radius: 15px;
                    padding: 2rem;
                    max-width: 500px;
                    width: 90%;
                    border: 2px solid #e50914;
                    text-align: center;
                }

                .video-placeholder {
                    padding: 2rem;
                }

                .video-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .ad-description {
                    color: #ccc;
                    margin: 1rem 0;
                }

                .ad-progress {
                    background: #333;
                    height: 4px;
                    border-radius: 2px;
                    overflow: hidden;
                    margin-top: 1rem;
                }

                .ad-progress-bar {
                    background: #e50914;
                    height: 100%;
                    width: 0%;
                    transition: width 1s linear;
                }

                /* Interstitial Ad Styles */
                .ad-interstitial-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.95);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10001;
                }

                .ad-interstitial {
                    background: #1a1a1a;
                    border-radius: 20px;
                    padding: 2rem;
                    max-width: 400px;
                    width: 90%;
                    border: 2px solid #ffd700;
                    text-align: center;
                }

                .ad-icon-large {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .ad-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .ad-actions button {
                    flex: 1;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    startVideoAdTimer(duration) {
        let timeLeft = duration;
        const timerElement = document.getElementById('video-ad-timer');
        const progressBar = document.getElementById('video-ad-progress');

        const timer = setInterval(() => {
            timeLeft--;
            if (timerElement) timerElement.textContent = timeLeft;
            if (progressBar) progressBar.style.width = `${((duration - timeLeft) / duration) * 100}%`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                this.skipAd();
            }
        }, 1000);
    }

    startInterstitialTimer(duration) {
        let timeLeft = duration;
        const timerElement = document.getElementById('interstitial-timer');

        const timer = setInterval(() => {
            timeLeft--;
            if (timerElement) timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                this.skipAd();
            }
        }, 1000);
    }

    skipAd() {
        this.removeExistingAds();
    }

    removeExistingAds() {
        document.querySelectorAll('.ad-container').forEach(ad => {
            ad.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => ad.remove(), 300);
        });
    }

    trackImpression(adId) {
        // محاكاة تتبع مشاهدات الإعلانات
        console.log(`📢 Ad impression tracked: ${adId}`);
        
        // حساب الإيرادات (CPM)
        this.adRevenue += this.settings.revenue.cpm / 1000;
        
        // حفظ الإحصائيات
        this.saveAdStats();
    }

    trackAdView(type) {
        const stats = JSON.parse(localStorage.getItem('korextv_adStats') || '{}');
        stats.totalViews = (stats.totalViews || 0) + 1;
        stats[`${type}Views`] = (stats[`${type}Views`] || 0) + 1;
        stats.lastView = new Date().toISOString();
        
        localStorage.setItem('korextv_adStats', JSON.stringify(stats));
    }

    saveAdStats() {
        const stats = {
            totalRevenue: this.adRevenue,
            totalImpressions: this.adCounter,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('korextv_adStats', JSON.stringify(stats));
    }

    getAdStats() {
        return JSON.parse(localStorage.getItem('korextv_adStats') || '{}');
    }

    // دوال الإدارة للمشرف
    addAd(adData) {
        const newAd = {
            id: Date.now(),
            ...adData,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        this.ads.push(newAd);
        this.saveAds();
        return newAd;
    }

    updateAd(adId, updates) {
        const adIndex = this.ads.findIndex(ad => ad.id === adId);
        if (adIndex !== -1) {
            this.ads[adIndex] = { ...this.ads[adIndex], ...updates };
            this.saveAds();
            return true;
        }
        return false;
    }

    deleteAd(adId) {
        this.ads = this.ads.filter(ad => ad.id !== adId);
        this.saveAds();
        return true;
    }
}

// إنشاء instance global
window.adSystem = new AdSystem();

console.log('✅ AdSystem loaded successfully');
