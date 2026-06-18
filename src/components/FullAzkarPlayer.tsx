import { useState, useRef, useEffect } from 'react';
import './FullAzkarPlayer.css';

const base = import.meta.env.BASE_URL;

const TRACKS = {
  morning: {
    title: 'أذكار الصباح كاملة',
    url: `${base}azkar/morning.mp3`,
    duration: '21 دقيقة',
    icon: '🌅'
  },
  evening: {
    title: 'أذكار المساء كاملة',
    url: `${base}azkar/evening.mp3`,
    duration: '21 دقيقة',
    icon: '🌙'
  }
};

export default function FullAzkarPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'morning' | 'evening' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.onplay = () => { setIsPlaying(true); setIsLoading(false); };
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => { setIsPlaying(false); setIsLoading(false); };
    audio.onwaiting = () => setIsLoading(true);
    audio.oncanplay = () => setIsLoading(false);
    audioRef.current = audio;

    return () => {
      audio.onplay = null;
      audio.onpause = null;
      audio.onended = null;
      audio.onerror = null;
      audio.onwaiting = null;
      audio.oncanplay = null;
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Listen for stopOtherAudio
  useEffect(() => {
    const handleStop = (e: any) => {
      if (e.detail !== 'full-player' && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener('stopOtherAudio', handleStop);
    return () => window.removeEventListener('stopOtherAudio', handleStop);
  }, []);

  const toggleTrack = (track: 'morning' | 'evening') => {
    if (!audioRef.current) return;

    const isCurrentlyPlaying = !audioRef.current.paused;
    const isSameTrack = activeTrack === track;

    if (isSameTrack && isCurrentlyPlaying) {
      audioRef.current.pause();
    } else if (isSameTrack && !isCurrentlyPlaying) {
      window.dispatchEvent(new CustomEvent('stopOtherAudio', { detail: 'full-player' }));
      audioRef.current.play().catch(e => {
        if (e.name === 'AbortError') return;
        console.error('Audio playback failed', e);
      });
    } else {
      setIsLoading(true);
      setActiveTrack(track);
      audioRef.current.src = TRACKS[track].url;
      audioRef.current.play().catch(e => {
        if (e.name === 'AbortError') return;
        console.error('Audio playback failed', e);
        setIsLoading(false);
      });
    }
  };

  return (
    <div className="full-azkar-section">
      <h3 className="section-title">جلسة أذكار بصوت الشيخ مشاري العفاسي</h3>
      
      <div className="full-azkar-cards">
        {(['morning', 'evening'] as const).map(track => {
          const isActive = activeTrack === track;
          return (
            <button
              key={track}
              className={`azkar-card ${isActive && isPlaying ? 'playing' : ''} ${isActive && isLoading ? 'loading' : ''}`}
              onClick={() => toggleTrack(track)}
            >
              <span className="azkar-icon">{TRACKS[track].icon}</span>
              <div className="azkar-info">
                <h4>{TRACKS[track].title}</h4>
                <p>{TRACKS[track].duration}</p>
              </div>
              <div className="play-indicator">
                {isActive && isLoading ? (
                  <div className="mini-spinner"></div>
                ) : isActive && isPlaying ? (
                  <div className="equalizer">
                    <span></span><span></span><span></span>
                  </div>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
