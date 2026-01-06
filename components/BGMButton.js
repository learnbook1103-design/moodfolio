import { useState, useEffect, useRef } from 'react';

const bgmFiles = {
    "새벽 코딩 (Lo-Fi)": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    "카페 백색소음 (Jazz)": "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
    "활기찬 시작 (Pop)": "https://cdn.pixabay.com/download/audio/2022/10/25/audio_9593259345.mp3",
    "깊은 집중 (Ambient)": "https://cdn.pixabay.com/download/audio/2022/03/10/audio_5b98f26703.mp3",
    "음악 없음 (Mute)": null
};

export default function BGMButton({ bgmTitle = "음악 없음 (Mute)" }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        const bgmUrl = bgmFiles[bgmTitle];

        // Clean up previous audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Create new audio if URL exists
        if (bgmUrl) {
            audioRef.current = new Audio(bgmUrl);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;

            // Try autoplay (will likely fail on first visit)
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    setHasInteracted(true);
                })
                .catch(() => {
                    // Autoplay blocked - user needs to click button
                    setIsPlaying(false);
                });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [bgmTitle]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    setHasInteracted(true);
                })
                .catch((error) => {
                    console.error('Failed to play audio:', error);
                });
        }
    };

    // Don't show button if no BGM selected
    if (!bgmFiles[bgmTitle]) return null;

    return (
        <button
            onClick={togglePlay}
            className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-2xl backdrop-blur-md border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isPlaying
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400 animate-pulse'
                    : 'bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600'
                }`}
            title={isPlaying ? '음악 일시정지' : '음악 재생'}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
            {isPlaying ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-slate-700 dark:text-slate-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M8 5v14l11-7z" />
                </svg>
            )}

            {/* Pulsing ring animation when playing */}
            {isPlaying && (
                <span className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-75"></span>
            )}
        </button>
    );
}
