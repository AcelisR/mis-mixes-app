import './globals.css';
import { PlayerProvider } from '@/context/PlayerContext';
import AudioPlayer from '@/components/AudioPlayer';

export const metadata = {
  title: 'Mis Sesiones de DJ',
  description: 'Reproductor web de música y sesiones continuas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-neutral-950 text-white min-h-screen antialiased">
        <PlayerProvider>
          {children}
          <AudioPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
