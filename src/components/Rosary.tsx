import { useState, useEffect } from 'react';

const PRESET_ZIKRS = [
  'سُبْحَانَ اللَّهِ',
  'الْحَمْدُ لِلَّهِ',
  'اللَّهُ أَكْبَرُ',
  'لَا إِلَٰهَ إِلَّا اللَّهُ',
  'أَسْتَغْفِرُ اللَّهَ',
  'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ'
];

export default function Rosary() {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(() => {
    return Number(localStorage.getItem('rosary_total') || '0');
  });
  const [target, setTarget] = useState<number | 'open'>(33);
  const [selectedZikr, setSelectedZikr] = useState(PRESET_ZIKRS[0]);
  const [customZikr, setCustomZikr] = useState('');
  const [isCustomActive, setIsCustomActive] = useState(false);

  // Keep total count persisted
  useEffect(() => {
    localStorage.setItem('rosary_total', totalCount.toString());
  }, [totalCount]);

  const activeZikrText = isCustomActive ? (customZikr || 'اكتب ذكرك...') : selectedZikr;

  const handleIncrement = () => {
    const newCount = count + 1;
    const newTotal = totalCount + 1;
    
    setCount(newCount);
    setTotalCount(newTotal);
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleResetTotal = () => {
    if (window.confirm('هل تريد تصفير العداد الإجمالي لجميع تسبيحاتك؟')) {
      setTotalCount(0);
      setCount(0);
    }
  };

  // Progress Calculation
  const progressPercent = typeof target === 'number' ? Math.min((count / target) * 100, 100) : 100;
  
  // SVG Ring Settings
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="card rosary-card">
      <h2 className="section-title">📿 السبحة الإلكترونية</h2>

      {/* Preset Phrases */}
      <div className="rosary-selectors">
        <div className="rosary-field">
          <label htmlFor="rosary-phrase">الذكر:</label>
          <select
            id="rosary-phrase"
            value={isCustomActive ? 'custom' : selectedZikr}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'custom') {
                setIsCustomActive(true);
              } else {
                setIsCustomActive(false);
                setSelectedZikr(val);
              }
            }}
          >
            {PRESET_ZIKRS.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
            <option value="custom">✍️ ذكر مخصص...</option>
          </select>
        </div>

        {/* Custom Input */}
        {isCustomActive && (
          <div className="rosary-field animate-fade-in">
            <input
              type="text"
              className="custom-zikr-input"
              placeholder="اكتب ذكرًا مخصصًا هنا..."
              value={customZikr}
              onChange={(e) => setCustomZikr(e.target.value)}
              maxLength={40}
            />
          </div>
        )}

        {/* Target selector */}
        <div className="rosary-field">
          <label>الهدف (العدد):</label>
          <div className="target-btn-group">
            {[33, 100, 'open'].map((val) => (
              <button
                key={val}
                type="button"
                className={`target-btn ${target === val ? 'active' : ''}`}
                onClick={() => {
                  setTarget(val as any);
                  setCount(0);
                }}
              >
                {val === 'open' ? '♾️ مفتوح' : val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Counter & Tap Target */}
      <div className="rosary-counter-wrapper">
        <div 
          className={`rosary-tap-zone ${typeof target === 'number' && count >= target ? 'target-reached' : ''}`}
          onClick={handleIncrement}
          role="button"
          tabIndex={0}
          aria-label="اضغط للتسبيح"
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleIncrement();
            }
          }}
        >
          {/* Progress Ring */}
          <svg className="rosary-svg" width="220" height="220">
            <circle
              className="rosary-ring-bg"
              cx="110"
              cy="110"
              r={radius}
            />
            <circle
              className="rosary-ring-progress"
              cx="110"
              cy="110"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 110 110)"
            />
          </svg>

          {/* Counts Inside */}
          <div className="rosary-text-content">
            <span className="rosary-phrase-display">{activeZikrText}</span>
            <span className="rosary-number">{count}</span>
            {target !== 'open' && (
              <span className="rosary-target-display">الهدف: {target}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="rosary-actions">
        <button className="rosary-reset-btn" onClick={handleReset}>
          🔄 إعادة تصفير
        </button>
        <div className="rosary-total-badge">
          <span>المجموع الإجمالي:</span>
          <strong>{totalCount}</strong>
          <button className="rosary-clear-total" onClick={handleResetTotal} aria-label="تصفير الإجمالي">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
