'use client';
import { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [currentMix, setCurrentMix] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Metadatos para pantalla del auto y controles Bluetooth
  useEffect(() => {
    if (currentMix && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentMix.title,
        artist: currentMix.dj || 'Mi Mix',
        album: 'Mis Sesiones',
        artwork: [
          { src: currentMix.cover_url || 'https://picsum.photos/400/400', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('seekbackward', () => skip(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => skip(15));
    }
  }, [currentMix]);

  const playMix = (mix) => {
    if (currentMix?.id === mix.id) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
      return;
    }
    setCurrentMix(mix);
    if (audioRef.current) {
      audioRef.current.src = mix.audio_url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        Math.max(0, audioRef.current.currentTime + seconds),
        duration || 0
      );
    }
  };

  const seek = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentMix,
      isPlaying,
      currentTime,
      duration,
      playMix,
      play,
      pause,
      skip,
      seek
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
