'use client';
import { usePlayer } from '@/context/PlayerContext';
import { Play, Pause, RotateCcw, RotateCw, ListMusic, Music } from 'lucide-react';
import { useState } from 'react';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const { currentMix, isPlaying, currentTime, duration, play, pause, skip, seek } = usePlayer();
  const [showTracklist, setShowTracklist] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!currentMix) return null;

  const hasCover = Boolean(currentMix.cover_url && !imgError);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#12141a]/95 backdrop-blur-md border-t border-neutral-800 text-neutral-200 p-3 sm:p-4 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col gap-2">
        
        {/* Barra de Progreso Minimalista */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-500">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime || 0}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Fila de Controles */}
        <div className="flex items-center justify-between gap-4 pt-1">
          
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

          {/* Botones de reproducción */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => skip(-15)}
              className="p-1.5 text-neutral-500 hover:text-neutral-200 transition active:scale-95"
              title="-15s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={isPlaying ? pause : play}
              className="w-10 h-10 bg-neutral-100 hover:bg-white text-neutral-950 rounded-full flex items-center justify-center transition shadow-lg active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skip(15)}
              className="p-1.5 text-neutral-500 hover:text-neutral-200 transition active:scale-95"
              title="+15s"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Tracklist Botón */}
          <div className="flex justify-end w-1/3">
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

        {/* Desplegable de Tracklist */}
        {showTracklist && currentMix.tracklist && (
          <div className="mt-2 pt-3 border-t border-neutral-800/80 max-h-40 overflow-y-auto">
            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2">
              Índice de pistas
            </div>
            <div className="flex flex-col divide-y divide-neutral-800/40">
              {currentMix.tracklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-1 hover:bg-neutral-800/40 transition"
                >
                  <span className="text-neutral-300 truncate pr-4">{item.song}</span>
                  <span className="text-neutral-500 font-mono text-[11px] flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}