import { useState, useEffect, useRef, useCallback } from 'react';
import { allContent, getRandomContent, type AppContent } from '../data/contentDatabase';

let sharedAudioCtx: AudioContext | null = null;

const getSharedAudioCtx = async () => {
  if (!sharedAudioCtx) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioContext();
  }
  if (sharedAudioCtx.state === 'suspended') {
    try {
      await sharedAudioCtx.resume();
    } catch (err) {
      console.error('Failed to resume AudioContext:', err);
    }
  }
  return sharedAudioCtx;
};

export default function AzkarPlayer() {
  const [isActive, setIsActive]         = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(5);
  const [current, setCurrent]           = useState<AppContent | null>(null);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [showZikrMode, setShowZikrMode] = useState<'all' | 'ayah' | 'zikr'>('all');
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);
  const [reciter, setReciter]           = useState<string>(() => localStorage.getItem('preferredReciter') || 'ar.alafasy');

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const isActiveRef = useRef(false);
  const timerRef    = useRef<number | null>(null);

  // ─── Init Audio ──────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.onplay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setErrorMsg(null);
    };
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      setIsPlaying(false);
    };
    audio.onerror = () => {
      setIsPlaying(false);
      setErrorMsg('تعذر تشغيل الصوت. حاول مجدداً.');
    };
    
    audioRef.current = audio;
    return () => {
      audio.onplay = null;
      audio.onpause = null;
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.src = '';
    };
  }, []);

  // ─── Click Sound ─────────────────────────────────────────────
  const playClickSound = async () => {
    try {
      const ctx = await getSharedAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  };

  // ─── Reciter Change Handler ───────────────────────────────────────
  const reciterRef = useRef(reciter);
  const handleReciterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newReciter = e.target.value;
    setReciter(newReciter);
    reciterRef.current = newReciter;
    localStorage.setItem('preferredReciter', newReciter);
  };

  const showZikrModeRef = useRef(showZikrMode);
  const handleModeChange = (mode: 'all' | 'ayah' | 'zikr') => {
    playClickSound();
    setShowZikrMode(mode);
    showZikrModeRef.current = mode;
  };

  // ─── Notifications ───────────────────────────────────────────
  const showNotification = useCallback((title: string, body: string) => {
    // Notifications disabled based on user request
  }, []);

  // ─── Play Content ─────────────────────────────────────────────
  const playContent = useCallback((item: AppContent) => {
    if (!audioRef.current || !isActiveRef.current) return;

    setErrorMsg(null);
    setCurrent(item);
    setIsLoading(true);

    const msg = item.type === 'zikr'
      ? `${item.zikrText} — ${item.lesson.slice(0, 80)}...`
      : item.lesson.slice(0, 100) + '...';

    showNotification('رسالة ربانية 💌', msg);

    if (item.audio) {
      let audioSrc = item.audio;

      // For ayahs: build path from the audio field filename + selected reciter
      // item.audio is like '/audio/ayah_94_5.mp3' — we replace the base path with reciter folder
      if (item.type === 'ayah') {
        const fileName = item.audio.split('/').pop(); // e.g. 'ayah_94_5.mp3'
        audioSrc = `/audio/${reciterRef.current}/${fileName}`;
      }
      // For zikr: audio is already the correct absolute path like '/azkar/zikr_subhanallah.mp3'

      audioRef.current.src = audioSrc;
      audioRef.current.load();
      audioRef.current.play().catch(err => {
        if (err.name === 'AbortError') return;
        console.error('Playback error:', err, 'src:', audioSrc);
        setIsLoading(false);
        setIsPlaying(false);
        setErrorMsg('فشل تشغيل الصوت.');
      });
    } else {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [showNotification]);

  // ─── Get Next Content Based on Mode ──────────────────────────
  const pickNextContent = useCallback((): AppContent => {
    const pool = showZikrModeRef.current === 'all' ? allContent
      : allContent.filter(c => c.type === showZikrModeRef.current);
    if (!pool.length) return getRandomContent();
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  // ─── Start Interval ───────────────────────────────────────────
  const startInterval = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!isActiveRef.current) return;
      playContent(pickNextContent());
    }, intervalMinutes * 60 * 1000);
  }, [intervalMinutes, pickNextContent, playContent]);

  // ─── Toggle Active ────────────────────────────────────────────
  const toggleActive = async () => {
    playClickSound();
    
    if (isActive) {
      setIsActive(false);
      isActiveRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        try { audioRef.current.currentTime = 0; } catch {}
      }
      setIsPlaying(false);
      setCurrent(null);
    } else {
      setIsActive(true);
      isActiveRef.current = true;
      
      if (!isActiveRef.current) return;
      const first = pickNextContent();
      playContent(first);
    }
  };

  const intervalMinutesRef = useRef(intervalMinutes);
  useEffect(() => {
    intervalMinutesRef.current = intervalMinutes;
    if (!isActive) return;
    startInterval();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [intervalMinutes, isActive, startInterval]);

  // ─── UI Helpers ───────────────────────────────────────────────
  const isZikr = current?.type === 'zikr';

  return (
    <div className={`card ${isPlaying ? 'playing' : ''}`}>

      {/* Mode Selector */}
      <div className="mode-selector">
        {[
          { value: 'all',  label: '✨ الكل'   },
          { value: 'ayah', label: '📖 آيات'   },
          { value: 'zikr', label: '📿 أذكار'  },
        ].map(opt => (
          <button
            key={opt.value}
            role="tab"
            aria-pressed={showZikrMode === opt.value}
            className={`mode-btn ${showZikrMode === opt.value ? 'mode-active' : ''}`}
            onClick={() => handleModeChange(opt.value as 'all'|'ayah'|'zikr')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content Display */}
      <div className="zikr-display">
        {isActive ? (
          isLoading && !current ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>جاري التحميل...</p>
            </div>
          ) : current ? (
            <div className="zikr-content-wrapper">

              {/* Category badge */}
              <span className={`category-badge ${isZikr ? 'badge-zikr' : 'badge-ayah'}`}>
                {isZikr ? '📿 ذكر' : '📖 آية'} · {current.category}
              </span>

              {/* Main text */}
              {isZikr ? (
                <>
                  <p className="zikr-text quran-text">{current.zikrText}</p>
                  <p className="zikr-translation">{current.zikrTranslation}</p>
                  {current.zikrCount !== undefined && (
                    <div className="count-badge">
                      <span>🔁</span>
                      <span>{current.zikrCount === 1 ? 'مرة واحدة' : `${current.zikrCount} مرة`}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="surah-name">
                    {current.surahName} {current.ayahRef && `· ${current.ayahRef}`}
                  </h2>
                  <p className="zikr-text quran-text">﴿ {current.arabicText} ﴾</p>
                </>
              )}

              {/* Lesson */}
              {current.lesson && (
                <div className="tafsir-box">
                  <h3 className="tafsir-title">💌 رسالتك</h3>
                  <p className="tafsir-text">{current.lesson}</p>
                </div>
              )}

              {/* Error */}
              {errorMsg && <p className="error-text">⚠️ {errorMsg}</p>}
            </div>
          ) : null
        ) : (
          <p className="zikr-text placeholder-text">
            اضغط بدء لتلقي رسائلك الربانية...
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="time-selector">
          <label htmlFor="interval">التذكير كل:</label>
          <select
            id="interval"
            value={intervalMinutes}
            onChange={e => { playClickSound(); setIntervalMinutes(Number(e.target.value)); }}
          >
            <option value={1}>دقيقة واحدة (للتجربة)</option>
            <option value={5}>5 دقائق</option>
            <option value={10}>10 دقائق</option>
            <option value={15}>15 دقيقة</option>
            <option value={30}>30 دقيقة</option>
            <option value={60}>ساعة كاملة</option>
          </select>
        </div>

        <div className="time-selector">
          <label htmlFor="reciter">القارئ:</label>
          <select
            id="reciter"
            value={reciter}
            onChange={handleReciterChange}
          >
            <option value="ar.alafasy">مشاري العفاسي</option>
            <option value="ar.mahermuaiqly">ماهر المعيقلي</option>
            <option value="ar.abdulbasitmurattal">عبد الباسط عبد الصمد</option>
            <option value="ar.husary">محمود خليل الحصري</option>
          </select>
        </div>

        <button
          className={`play-button ${isActive ? 'active' : ''}`}
          onClick={toggleActive}
          aria-label={isActive ? 'إيقاف' : 'بدء'}
        >
          {isActive && <div className="ripple"></div>}
          {isActive ? (
            <svg className="play-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6z"/></svg>
          ) : (
            <svg className="play-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <p className="status-text">
          {isActive
            ? `⏱ الرسالة القادمة بعد ${intervalMinutes} ${intervalMinutes > 10 ? 'دقيقة' : (intervalMinutes === 1 ? 'دقيقة' : (intervalMinutes === 2 ? 'دقيقتين' : 'دقائق'))}`
            : `${allContent.length} رسالة جاهزة لك 🌟`}
        </p>
      </div>
    </div>
  );
}
