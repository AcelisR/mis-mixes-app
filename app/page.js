'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { usePlayer } from '@/context/PlayerContext';
import { Play, Pause, Disc, LayoutGrid, List, Plus } from 'lucide-react';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=800&auto=format&fit=crop&q=60';

export default function HomePage() {
  const [mixes, setMixes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'grid'
  const { currentMix, isPlaying, playMix } = usePlayer();

  useEffect(() => {
    async function fetchMixes() {
      try {
        const { data, error } = await supabase
          .from('mixes')
          .select('*')
          .order('id', { ascending: false });

        if (error) {
          setDbError(error.message);
        } else {
          setMixes(data || []);
        }
      } catch (err) {
        setDbError(err.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    }

    fetchMixes();
  }, []);

  return (
    <main className="min-h-screen bg-[#0d0e12] text-neutral-100 px-4 sm:px-8 py-10 pb-40">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabecera Editorial */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800/80 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 uppercase">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Archivo de Audio
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-100 mt-1 uppercase font-mono">
              Live Sessions
            </h1>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap justify-end">
            <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
              {mixes.length} {mixes.length === 1 ? 'SESIÓN' : 'SESIONES'}
            </span>

            {/* Selector de Vistas */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                title="Vista de lista"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition ${viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                title="Vista de cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Botón de Subida */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-white text-neutral-950 font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> SUBIR SET
            </Link>
          </div>
        </header>

        {/* Notificación de Error */}
        {dbError && (
          <div className="bg-red-950/40 border border-red-900/60 text-red-400 p-4 rounded-lg mb-6 text-xs font-mono">
            [SUPABASE_ERROR]: {dbError}
          </div>
        )}

        {/* Estado de Carga / Vacío */}
        {loading ? (
          <div className="py-24 text-center text-neutral-600 font-mono text-xs tracking-wider">
            SINCRONIZANDO SESIONES...
          </div>
        ) : mixes.length === 0 && !dbError ? (
          <div className="py-24 text-center border border-dashed border-neutral-800 rounded-xl">
            <Disc className="w-10 h-10 mx-auto text-neutral-700 mb-3 animate-spin-slow" />
            <p className="text-neutral-400 text-sm font-medium">No hay grabaciones disponibles</p>
            <p className="text-neutral-600 text-xs font-mono mt-1 mb-4">Sube archivos a tu panel para comenzar</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-mono px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition"
            >
              <Plus className="w-4 h-4" /> AGREGAR PRIMERA SESIÓN
            </Link>
          </div>
        ) : viewMode === 'list' ? (
          
          /* --- VISTA LISTA TIPO RADIO / SOUNDCLOUD --- */
          <div className="flex flex-col divide-y divide-neutral-800/60 border-y border-neutral-800/60">
            {mixes.map((mix, index) => {
              const isThisPlaying = currentMix?.id === mix.id && isPlaying;
              const isSelected = currentMix?.id === mix.id;

              return (
                <div
                  key={mix.id}
                  onClick={() => playMix(mix)}
                  className={`group flex items-center justify-between py-3.5 px-3 transition cursor-pointer rounded-lg hover:bg-neutral-900/80 ${
                    isSelected ? 'bg-neutral-900/90' : ''
                  }`}
                >
                  {/* Izquierda: Número + Portada + Títulos */}
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    <span className="font-mono text-xs text-neutral-600 w-5 text-right flex-shrink-0 group-hover:text-amber-500 transition">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="relative w-12 h-12 rounded bg-neutral-900 flex-shrink-0 overflow-hidden border border-neutral-800">
                      <img
                        src={mix.cover_url || DEFAULT_COVER}
                        alt={mix.title}
                        onError={(e) => { e.currentTarget.src = DEFAULT_COVER; }}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition ${isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isThisPlaying ? (
                          <Pause className="w-5 h-5 text-amber-400 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-amber-400' : 'text-neutral-200 group-hover:text-white'}`}>
                        {mix.title}
                      </h3>
                      <p className="text-xs text-neutral-500 truncate mt-0.5 font-mono">
                        {mix.dj || 'Residente'}
                      </p>
                    </div>
                  </div>

                  {/* Derecha: Género + Duración */}
                  <div className="flex items-center gap-4 flex-shrink-0 font-mono text-xs">
                    {mix.genre && (
                      <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-neutral-800/80 text-neutral-400 border border-neutral-700/40 text-[11px]">
                        {mix.genre}
                      </span>
                    )}
                    <span className="text-neutral-500 w-14 text-right">
                      {mix.duration || '--:--'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          /* --- VISTA CUADRÍCULA ESTILO VINILOS --- */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {mixes.map((mix) => {
              const isThisPlaying = currentMix?.id === mix.id && isPlaying;
              const isSelected = currentMix?.id === mix.id;

              return (
                <div
                  key={mix.id}
                  onClick={() => playMix(mix)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-square w-full rounded-md overflow-hidden bg-neutral-900 border border-neutral-800/80 shadow-md">
                    <img
                      src={mix.cover_url || DEFAULT_COVER}
                      alt={mix.title}
                      onError={(e) => { e.currentTarget.src = DEFAULT_COVER; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 brightness-95 group-hover:brightness-100"
                    />

                    {/* Tag de género en la esquina */}
                    {mix.genre && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-neutral-300 border border-white/10 uppercase">
                        {mix.genre}
                      </span>
                    )}

                    {/* Botón Flotante */}
                    <div className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center transition duration-200 ${isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-2xl transition transform group-hover:scale-105">
                        {isThisPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-amber-400' : 'text-neutral-200 group-hover:text-white'}`}>
                      {mix.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-neutral-500 font-mono mt-0.5">
                      <span>{mix.dj || 'DJ'}</span>
                      <span>{mix.duration || ''}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}