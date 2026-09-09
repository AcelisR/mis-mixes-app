'use client';
import { usePlayer } from '@/context/PlayerContext';
import { 
  Play, 
  Pause, 
  RotateCw, 
  ListMusic, 
  Music, 
  Shuffle, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Volume1 
} from 'lucide-react';
import { useState, useEffect } from 'react';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Convierte '03:45' o '01:12:30' a segundos numéricos
function parseTimestamp(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

export default function AudioPlayer() {
  const {
    currentMix,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    volume = 1,
    setVolume,
    play,
    pause,
    skip,
    seek,
    playNext,
    playPrevious,
    toggleShuffle,
  } = usePlayer();

  const [showTracklist, setShowTracklist] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

  // Reiniciar fallback de imagen al cambiar de mix
  useEffect(() => {
    setImgError(false);
  }, [currentMix?.cover_url]);

  if (!currentMix) return null;

  const hasCover = Boolean(currentMix.cover_url && !imgError);

  const toggleMute = () => {
    if (!setVolume) return;
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 0.8);
    }
  };

  const handleTrackClick = (timeStr) => {
    const targetSeconds = parseTimestamp(timeStr);
    seek(targetSeconds);
    if (!isPlaying) play();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#12141a]/95 backdrop-blur-md border-t border-neutral-800 text-neutral-200 p-3 sm:p-4 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col gap-2">
        
        {/* Barra de Progreso */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-500">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime || 0}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="w-10">{formatTime(duration)}</span>
        </div>

        {/* Fila de Controles */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-1">
          
          {/* Metadata actual */}
          <div className="flex items-center gap-3 w-1/3 min-w-0">
            <div className="relative w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden text-center p-0.5">
              {hasCover ? (
                <img
                  src={currentMix.cover_url}
                  alt={currentMix.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950">
                  <Music className="w-3 h-3 text-amber-500 mb-0.5" />
                  <span className="text-[7px] font-mono font-bold text-neutral-300 uppercase line-clamp-1 leading-none px-0.5">
                    {currentMix.title || 'SET'}
                  </span>
                </div>
              )}
            </div>

            <div className="truncate min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm truncate text-neutral-100">{currentMix.title}</h4>
              <p className="text-[11px] font-mono text-neutral-500 truncate">{currentMix.dj || 'DJ'}</p>
            </div>
          </div>

          {/* Botones Centrales */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded transition active:scale-95 ${
                isShuffle 
                  ? 'text-amber-400 bg-amber-500/10' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title={isShuffle ? 'Modo aleatorio activado' : 'Activar modo aleatorio'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={playPrevious}
              className="p-1.5 text-neutral-400 hover:text-neutral-100 transition active:scale-95"
              title="Anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={isPlaying ? pause : play}
              className="w-10 h-10 bg-neutral-100 hover:bg-white text-neutral-950 rounded-full flex items-center justify-center transition shadow-lg active:scale-95 mx-1"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-1.5 text-neutral-400 hover:text-neutral-100 transition active:scale-95"
              title="Siguiente"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => skip(15)}
              className="hidden sm:block p-1.5 text-neutral-500 hover:text-neutral-200 transition active:scale-95"
              title="+15s"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Utilidades: Volumen y Tracklist */}
          <div className="flex items-center justify-end gap-3 w-1/3">
            {setVolume && (
              <div className="hidden md:flex items-center gap-2 group">
                <button 
                  onClick={toggleMute} 
                  className="text-neutral-400 hover:text-neutral-200 transition"
                >
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-neutral-500" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            )}

            {currentMix.tracklist && currentMix.tracklist.length > 0 && (
              <button
                onClick={() => setShowTracklist(!showTracklist)}
                className={`px-2.5 py-1.5 rounded text-xs font-mono transition flex items-center gap-1.5 border ${
                  showTracklist 
                    ? 'bg-neutral-800 border-neutral-700 text-amber-400' 
                    : 'bg-transparent border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tracklist</span>
              </button>
            )}
          </div>
        </div>

        {/* Desplegable de Tracklist interactivo */}
        {showTracklist && currentMix.tracklist && (
          <div className="mt-2 pt-3 border-t border-neutral-800/80 max-h-44 overflow-y-auto">
            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2">
              Índice de pistas (haz clic para reproducir)
            </div>
            <div className="flex flex-col divide-y divide-neutral-800/40">
              {currentMix.tracklist.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTrackClick(item.time)}
                  className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-neutral-800/60 rounded text-left transition group"
                >
                  <span className="text-neutral-300 group-hover:text-amber-400 truncate pr-4">
                    {item.song}
                  </span>
                  <span className="text-neutral-500 font-mono text-[11px] flex-shrink-0 group-hover:text-neutral-300">
                    {item.time}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}