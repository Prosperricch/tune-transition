
import { Link } from 'react-router-dom';
import { Music, Library } from 'lucide-react';
import { useMusic } from '@/contexts/MusicContext';
import MusicControls from '@/components/MusicControls';
import MiniPlayer from '@/components/MiniPlayer';
import PageTransition from '@/components/PageTransition';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const Index = () => {
  const { currentSong, isPlaying } = useMusic();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-0 z-10 glass-effect py-4 px-6">
          <div className="container max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Music Player</h1>
              <Link to="/library" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Library className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="container max-w-md mx-auto px-6 py-8">
          {currentSong ? (
            <div className="flex flex-col items-center">
              {/* Album Artwork */}
              <div className="album-artwork mb-8 w-64 h-64 mx-auto">
                <div className="relative w-full h-full">
                  <img
                    src={currentSong.artwork}
                    alt={`${currentSong.title} by ${currentSong.artist}`}
                    className={cn(
                      "w-full h-full object-cover shadow-2xl transition-opacity duration-500",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setImageLoaded(true)}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-player-muted animate-pulse rounded-xl" />
                  )}
                  
                  {/* Pulsing animation when playing */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 flex items-center justify-center rounded-xl">
                      <div className="h-16 w-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                        <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Song Info */}
              <div className="text-center mb-8 w-full">
                <h2 className="text-2xl font-bold mb-1">{currentSong.title}</h2>
                <p className="text-lg text-muted-foreground">{currentSong.artist}</p>
                <p className="text-sm text-muted-foreground mt-1">{currentSong.album}</p>
              </div>
              
              {/* Music Controls */}
              <div className="w-full">
                <MusicControls />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
              <div className="bg-player-muted/50 rounded-full p-6 mb-6">
                <Music className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No track selected</h2>
              <p className="text-muted-foreground mb-6">Select a song from your library to start playing</p>
              <Link
                to="/library"
                className="inline-flex items-center gap-2 bg-player-accent text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-colors"
              >
                <Library className="h-5 w-5" />
                Browse Library
              </Link>
            </div>
          )}
        </main>
        
        {/* Mini Player (only shows when not on home screen) */}
        {currentSong && <MiniPlayer />}
      </div>
    </PageTransition>
  );
};

export default Index;
