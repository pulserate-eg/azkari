import { useState, useEffect } from 'react';
import AzkarPlayer from './components/AzkarPlayer';
import FullAzkarPlayer from './components/FullAzkarPlayer';
import Rosary from './components/Rosary';
import HisnReader from './components/HisnReader';

type TabType = 'home' | 'rosary' | 'hisn';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const shareMessage = encodeURIComponent('تطبيق أذكاري 🌙\nنورٌ في كل لحظة، وذكرٌ في كل نفس. رفيقك الدائم للطمأنينة بدون إنترنت!\n\nجربه الآن وشاركه ليكون صدقة جارية لك: \nhttps://pulserate-eg.github.io/azkari/');
  const whatsappUrl = `https://wa.me/?text=${shareMessage}`;

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'rosary':
        return <Rosary />;
      case 'hisn':
        return <HisnReader />;
      case 'home':
      default:
        return (
          <>
            <FullAzkarPlayer />
            <AzkarPlayer />
          </>
        );
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-ornament">✦ ✦ ✦</div>
        <h1>أذكاري</h1>
        <p className="header-subtitle">نـورٌ في كلِّ لحظة، وذِكـرٌ في كلِّ نَفَس</p>
        
        <button onClick={() => {
          if (deferredPrompt) {
            handleInstallClick();
          } else {
            alert('لتنزيل التطبيق: افتح قائمة المتصفح واضغط على "إضافة إلى الشاشة الرئيسية" أو "Add to Home Screen".');
          }
        }} className="install-app-btn">
          📱 ثبّت التطبيق ليعمل بدون إنترنت
        </button>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-share-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          شارك كصدقة جارية
        </a>
      </header>
      
      <main className="tab-content">
        {renderActiveTabContent()}
      </main>

      {/* Sleek Bottom Navigation Bar */}
      <nav className="bottom-nav">
        {/* Floating Install Button directly attached to nav */}
        <div style={{ position: 'absolute', top: '-60px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => {
            if (deferredPrompt) {
              handleInstallClick();
            } else {
              alert('لتنزيل التطبيق: افتح خيارات المتصفح (الثلاث نقاط) واضغط على "إضافة إلى الشاشة الرئيسية" أو "Add to Home Screen".');
            }
          }} className="install-app-btn" style={{ margin: 0, boxShadow: '0 10px 25px rgba(212,175,55,0.6)', transform: 'scale(1.1)' }}>
            📥 تحميل التطبيق الآن
          </button>
        </div>
        <div className="bottom-nav-container">
          <button
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('home');
            }}
          >
            <span className="nav-icon">💌</span>
            <span className="nav-label">الرسائل</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === 'rosary' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('rosary');
            }}
          >
            <span className="nav-icon">📿</span>
            <span className="nav-label">السبحة</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === 'hisn' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('hisn');
            }}
          >
            <span className="nav-icon">📖</span>
            <span className="nav-label">الأذكار</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
