'use client';
import { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentMix, setCurrentMix] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();

      const audio = audioRef.current;

      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedMetadata = () => setDuration(audio.duration);
      const handleEnded = () => playNext();

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
      };
    }
  }, [playlist, currentMix, isShuffle]);

  const playMix = (mix, list = null) => {
    if (list && list.length > 0) {
      setPlaylist(list);
    }
    if (currentMix?.id === mix.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    setCurrentMix(mix);
    if (audioRef.current) {
      audioRef.current.src = mix.audio_url;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Error al reproducir audio:", err);
        setIsPlaying(false);
      });
    }
  };

  const play = () => {
    if (audioRef.current && currentMix) {
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

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
    }
  };

  const playNext = () => {
    if (!playlist.length || !currentMix) return;

    if (isShuffle) {
      // Elegir uno aleatorio distinto al actual
      const available = playlist.filter(m => m.id !== currentMix.id);
      const nextMix = available.length > 0 
        ? available[Math.floor(Math.random() * available.length)]
        : playlist[0];
      playMix(nextMix);
    } else {
      const currentIndex = playlist.findIndex(m => m.id === currentMix.id);
      const nextIndex = (currentIndex + 1) % playlist.length;
      playMix(playlist[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (!playlist.length || !currentMix) return;

    const currentIndex = playlist.findIndex(m => m.id === currentMix.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playMix(playlist[prevIndex]);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
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