'use client';
import { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentMix, setCurrentMix] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);

  // Instancia única y persistente de Audio
  const audioRef = useRef(null);

  // Refs auxiliares para evitar recrear listeners por cambios de estado
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;

  const currentMixRef = useRef(currentMix);
  currentMixRef.current = currentMix;

  const isShuffleRef = useRef(isShuffle);
  isShuffleRef.current = isShuffle;

  // Inicializar el Audio solo una vez en el cliente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      // Al terminar, reproducir el siguiente
      playNext();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  const playMix = (mix, list = null) => {
    if (list && Array.isArray(list) && list.length > 0) {
      setPlaylist(list);
    }

    const audio = audioRef.current;
    if (!audio) return;

    // Si hace clic en el mix que ya está sonando, alternar Play/Pause
    if (currentMixRef.current?.id === mix.id) {
      if (audio.paused) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
      return;
    }

    // Si es un mix nuevo
    setCurrentMix(mix);
    audio.src = mix.audio_url;
    audio.load();
    audio.play().catch((err) => {
      console.error("Error al iniciar reproducción:", err);
    });
  };

  const play = () => {
    if (audioRef.current && currentMix) {
      audioRef.current.play().catch(console.error);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skip = (seconds) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const setVolume = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const playNext = () => {
    const list = playlistRef.current;
    const current = currentMixRef.current;
    if (!list.length || !current) return;

    if (isShuffleRef.current) {
      const candidates = list.filter((m) => m.id !== current.id);
      const next = candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : list[0];
      playMix(next);
    } else {
      const idx = list.findIndex((m) => m.id === current.id);
      const next = list[(idx + 1) % list.length];
      playMix(next);
    }
  };

  const playPrevious = () => {
    const list = playlistRef.current;
    const current = currentMixRef.current;
    if (!list.length || !current) return;

    const idx = list.findIndex((m) => m.id === current.id);
    const prev = list[(idx - 1 + list.length) % list.length];
    playMix(prev);
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  return (
    <PlayerContext.Provider
      value={{
        playlist,
        setPlaylist,
        currentMix,
        isPlaying,
        currentTime,
        duration,
        volume,
        setVolume,
        isShuffle,
        playMix,
        play,
        pause,
        seek,
        skip,
        playNext,
        playPrevious,
        toggleShuffle,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);