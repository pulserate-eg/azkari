import { useState, useEffect } from 'react';
import { hisnDatabase, type HisnCategory, type HisnZikr } from '../data/hisnDatabase';

const CATEGORIES: { value: HisnCategory; label: string; icon: string }[] = [
  { value: 'morning', label: 'الصباح', icon: '🌅' },
  { value: 'evening', label: 'المساء', icon: '🌙' },
  { value: 'sleep', label: 'النوم', icon: '🛌' },
  { value: 'wakeup', label: 'الاستيقاظ', icon: '🔔' }
];

export default function HisnReader() {
  const [activeCategory, setActiveCategory] = useState<HisnCategory>('morning');
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Initialize counts when active category changes
  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    hisnDatabase[activeCategory].forEach((z) => {
      initialCounts[z.id] = z.count;
    });
    setCounts(initialCounts);
  }, [activeCategory]);

  const categoryAzkar = hisnDatabase[activeCategory];
  
  // Progress calculations
  const totalItems = categoryAzkar.length;
  const completedItems = categoryAzkar.filter((z) => counts[z.id] === 0).length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const handleCardClick = (id: string) => {
    const currentCount = counts[id];
    if (currentCount === undefined || currentCount <= 0) return;

    const nextCount = currentCount - 1;
    setCounts((prev) => ({ ...prev, [id]: nextCount }));
  };

  const handleResetCategory = () => {
    const initialCounts: Record<string, number> = {};
    hisnDatabase[activeCategory].forEach((z) => {
      initialCounts[z.id] = z.count;
    });
    setCounts(initialCounts);
  };

  return (
    <div className="card hisn-card">
      <h2 className="section-title">📖 حصن المسلم</h2>

      {/* Category selector */}
      <div className="hisn-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            className={`hisn-tab-btn ${activeCategory === cat.value ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            <span className="hisn-tab-icon">{cat.icon}</span>
            <span className="hisn-tab-label">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Progress Section */}
      <div className="hisn-progress-container">
        <div className="hisn-progress-text">
          <span>🎯 إتمام الأذكار:</span>
          <strong>{completedItems} من {totalItems}</strong>
        </div>
        <div className="hisn-progress-bar-bg">
          <div 
            className="hisn-progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        {completedItems === totalItems && totalItems > 0 && (
          <p className="hisn-completion-banner animate-pulse">
            🎉 تقبل الله منك وطهّر قلبك ونوّر دربك!
          </p>
        )}
      </div>

      {/* Reset Category */}
      <div className="hisn-controls">
        <button className="hisn-reset-btn" onClick={handleResetCategory}>
          🔄 إعادة أذكار {CATEGORIES.find(c => c.value === activeCategory)?.label} من البداية
        </button>
      </div>

      {/* Azkar List */}
      <div className="hisn-list">
        {categoryAzkar.map((z: HisnZikr) => {
          const remaining = counts[z.id] ?? z.count;
          const isCompleted = remaining === 0;

          return (
            <div
              key={z.id}
              className={`hisn-item-card ${isCompleted ? 'completed' : ''}`}
              onClick={() => handleCardClick(z.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleCardClick(z.id);
                }
              }}
            >
              {/* Count Badge */}
              <div className="hisn-count-badge">
                {isCompleted ? (
                  <span className="check-icon">✓ تم</span>
                ) : (
                  <>
                    <span>🔁</span>
                    <strong>{remaining}</strong>
                  </>
                )}
              </div>

              {/* Text */}
              <p className="hisn-text quran-text">{z.text}</p>

              {/* Virtue & Source Reference */}
              {z.virtue && <p className="hisn-virtue">{z.virtue}</p>}
              {z.reference && <span className="hisn-ref">{z.reference}</span>}
              
              {/* Click Indicator overlay for better UX */}
              {!isCompleted && (
                <div className="click-indicator">انقر لإنقاص العداد 👇</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
