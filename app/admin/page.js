'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Upload, CheckCircle2, AlertCircle, Music, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  // Lista de mixes existentes y estado de borrado
  const [mixes, setMixes] = useState([]);
  const [loadingMixes, setLoadingMixes] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Archivos seleccionados
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Campos principales
  const [formData, setFormData] = useState({
    title: '',
    dj: '',
    genre: '',
    duration: '',
  });

  // Lista dinámica de canciones (Tracklist)
  const [tracklist, setTracklist] = useState([
    { time: '00:00', song: '' }
  ]);

  // Cargar mixes al montar
  useEffect(() => {
    fetchMixes();
  }, []);

  const fetchMixes = async () => {
    try {
      setLoadingMixes(true);
      const { data, error } = await supabase
        .from('mixes')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setMixes(data || []);
    } catch (err) {
      console.error('Error al cargar mixes:', err);
    } finally {
      setLoadingMixes(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTrackChange = (index, field, value) => {
    const updated = [...tracklist];
    updated[index][field] = value;
    setTracklist(updated);
  };

  const addTrackRow = () => {
    setTracklist([...tracklist, { time: '', song: '' }]);
  };

  const removeTrackRow = (index) => {
    if (tracklist.length === 1) return;
    setTracklist(tracklist.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setStatus({ type: 'error', msg: 'Debes seleccionar un archivo de audio (.mp3, .m4a, .wav).' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      // 1. Subir archivo de audio
      setUploadProgress('Subiendo archivo de audio...');
      const audioFileName = `${Date.now()}-${audioFile.name.replace(/\s+/g, '_')}`;
      const { data: audioUpload, error: audioErr } = await supabase.storage
        .from('audios')
        .upload(audioFileName, audioFile);

      if (audioErr) throw audioErr;

      const { data: audioUrlData } = supabase.storage
        .from('audios')
        .getPublicUrl(audioFileName);

      const finalAudioUrl = audioUrlData.publicUrl;

      // 2. Subir carátula si existe
      let finalCoverUrl = null;
      if (coverFile) {
        setUploadProgress('Subiendo carátula...');
        const coverFileName = `${Date.now()}-${coverFile.name.replace(/\s+/g, '_')}`;
        const { error: coverErr } = await supabase.storage
          .from('covers')
          .upload(coverFileName, coverFile);

        if (coverErr) throw coverErr;

        const { data: coverUrlData } = supabase.storage
          .from('covers')
          .getPublicUrl(coverFileName);

        finalCoverUrl = coverUrlData.publicUrl;
      }

      // 3. Guardar registro en la base de datos
      setUploadProgress('Guardando datos de la sesión...');
      const cleanTracklist = tracklist.filter(t => t.song.trim() !== '');

      const { error: dbErr } = await supabase.from('mixes').insert([
        {
          title: formData.title,
          dj: formData.dj || 'DJ Residente',
          genre: formData.genre || 'Electrónica',
          duration: formData.duration || 'Session',
          audio_url: finalAudioUrl,
          cover_url: finalCoverUrl,
          tracklist: cleanTracklist.length > 0 ? cleanTracklist : null,
        }
      ]);

      if (dbErr) throw dbErr;

      setStatus({ type: 'success', msg: '¡Sesión y archivos subidos con éxito!' });
      
      // Limpiar campos
      setFormData({
        title: '',
        dj: '',
        genre: '',
        duration: '',
      });
      setAudioFile(null);
      setCoverFile(null);
      setTracklist([{ time: '00:00', song: '' }]);

      // Refrescar listado
      fetchMixes();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: err.message || 'Error durante la subida.' });
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  // Función para eliminar un mix tanto de Storage como de la BD
  const handleDelete = async (mix) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el set "${mix.title}"?`);
    if (!confirmDelete) return;

    setDeletingId(mix.id);
    setStatus({ type: '', msg: '' });

    try {
      // 1. Eliminar archivo de audio de Supabase Storage si existe
      if (mix.audio_url) {
        const audioPath = mix.audio_url.split('/audios/').pop();
        if (audioPath) {
          await supabase.storage.from('audios').remove([decodeURIComponent(audioPath)]);
        }
      }

      // 2. Eliminar carátula de Supabase Storage si existe
      if (mix.cover_url) {
        const coverPath = mix.cover_url.split('/covers/').pop();
        if (coverPath) {
          await supabase.storage.from('covers').remove([decodeURIComponent(coverPath)]);
        }
      }

      // 3. Eliminar fila de la base de datos
      const { error: deleteErr } = await supabase
        .from('mixes')
        .delete()
        .eq('id', mix.id);

      if (deleteErr) throw deleteErr;

      setMixes((prev) => prev.filter((m) => m.id !== mix.id));
      setStatus({ type: 'success', msg: `"${mix.title}" ha sido eliminado exitosamente.` });
    } catch (err) {
      console.error('Error al eliminar:', err);
      setStatus({ type: 'error', msg: err.message || 'No se pudo eliminar el set.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0e12] text-neutral-100 px-4 sm:px-8 py-10 pb-32">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Barra superior de navegación */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> VOLVER AL ARCHIVO
          </Link>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            Panel de Control
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight uppercase">
            Administrar Sesiones
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Sube nuevas pistas o elimina grabaciones de tu almacenamiento.
          </p>
        </div>

        {/* Notificaciones */}
        {status.msg && (
          <div className={`p-4 rounded-lg text-xs font-mono flex items-center gap-2 ${
            status.type === 'success' 
              ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300' 
              : 'bg-red-950/40 border border-red-800 text-red-300'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{status.msg}</span>
          </div>
        )}

        {/* FORMULARIO DE SUBIDA */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Subida de Archivos */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-5 sm:p-6 space-y-4">
            <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60 pb-2">
              01. Archivos de tu Dispositivo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Archivo de Audio */}
              <div className="border border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-4 bg-neutral-950/60 transition">
                <label className="block text-xs font-mono text-neutral-300 mb-2 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-amber-400" /> ARCHIVO DE AUDIO *
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  required
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  className="w-full text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 file:cursor-pointer cursor-pointer"
                />
                {audioFile && (
                  <p className="text-[11px] font-mono text-amber-400 mt-2 truncate">
                    Seleccionado: {audioFile.name}
                  </p>
                )}
              </div>

              {/* Archivo de Portada */}
              <div className="border border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-4 bg-neutral-950/60 transition">
                <label className="block text-xs font-mono text-neutral-300 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-neutral-400" /> CARÁTULA / FOTO (OPCIONAL)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="w-full text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 file:cursor-pointer cursor-pointer"
                />
                {coverFile && (
                  <p className="text-[11px] font-mono text-neutral-400 mt-2 truncate">
                    Seleccionado: {coverFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Datos Generales */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-5 sm:p-6 space-y-4">
            <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60 pb-2">
              02. Metadatos del Set
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">TÍTULO DEL MIX *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="ej. Live at Underground Club 04"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/80 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">DJ / ARTISTA</label>
                <input
                  type="text"
                  name="dj"
                  placeholder="ej. Tu Nombre o DJ Alias"
                  value={formData.dj}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/80 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">GÉNERO / ESTILO</label>
                <input
                  type="text"
                  name="genre"
                  placeholder="ej. Tech House, Minimal, Techno"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/80 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">DURACIÓN APROX.</label>
                <input
                  type="text"
                  name="duration"
                  placeholder="ej. 1h 15m o 58 min"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/80 transition"
                />
              </div>
            </div>
          </div>

          {/* Tracklist Dinámico */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
              <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                03. Tracklist / Canciones (Opcional)
              </h2>
              <button
                type="button"
                onClick={addTrackRow}
                className="flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> AGREGAR PISTA
              </button>
            </div>

            <div className="space-y-2">
              {tracklist.map((track, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="00:00"
                    value={track.time}
                    onChange={(e) => handleTrackChange(idx, 'time', e.target.value)}
                    className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-center font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/80"
                  />
                  <input
                    type="text"
                    placeholder="Artista - Nombre del tema"
                    value={track.song}
                    onChange={(e) => handleTrackChange(idx, 'song', e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/80"
                  />
                  <button
                    type="button"
                    onClick={() => removeTrackRow(idx)}
                    disabled={tracklist.length === 1}
                    className="p-1.5 text-neutral-600 hover:text-red-400 disabled:opacity-20 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botón Guardar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neutral-100 hover:bg-white text-neutral-950 font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadProgress || 'Subiendo...'}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Subir y Publicar Sesión
              </>
            )}
          </button>
        </form>

        {/* SECCIÓN: LISTADO Y ELIMINACIÓN DE MIXES */}
        <section className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
            <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              04. Sesiones en Línea ({mixes.length})
            </h2>
            <button
              type="button"
              onClick={fetchMixes}
              className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 transition"
            >
              Actualizar
            </button>
          </div>

          {loadingMixes ? (
            <div className="py-8 text-center text-xs font-mono text-neutral-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Cargando sesiones registradas...
            </div>
          ) : mixes.length === 0 ? (
            <p className="py-6 text-center text-xs font-mono text-neutral-600">
              No hay mixes subidos aún.
            </p>
          ) : (
            <div className="divide-y divide-neutral-800/60">
              {mixes.map((mix) => (
                <div key={mix.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-neutral-200 truncate">
                      {mix.title}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono truncate">
                      {mix.dj || 'DJ'} • {mix.genre || 'Género'} • {mix.duration || '--:--'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(mix)}
                    disabled={deletingId === mix.id}
                    className="p-2 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-900/60 hover:text-red-200 transition disabled:opacity-40 flex items-center gap-1.5 text-xs font-mono flex-shrink-0 cursor-pointer"
                    title="Eliminar sesión permanentemente"
                  >
                    {deletingId === mix.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}