
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { useMusic } from '@/contexts/MusicContext';
import MusicControls from '@/components/MusicControls';
import SongCard from '@/components/SongCard';
import PageTransition from '@/components/PageTransition';
import { cn } from '@/lib/utils';

const SongDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { songs, currentSong, play } = useMusic();
  const [liked, setLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Find the current song by ID
  const song = songs.find(s => s.id === id);
  
  // Find more songs by the same artist (except the current one)
  const moreSongs = songs.filter(s => s.artist === song?.artist && s.id !== id);
  
  // Play the song if it's not already playing
  useEffect(() => {
    if (song && (!currentSong || currentSong.id !== song.id)) {
      play(song);
    }
  }, [song, currentSong, play]);
  
  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Song not found</p>
      </div>
    );
  }
  
  return (
    <PageTransition direction="left">
      <div className="min-h-screen">
        {/* Background Image */}
        <div className="fixed inset-0 z-[-1]">
          <div className="absolute inset-0 bg-player-background/80 backdrop-blur-2xl" />
          {imageLoaded && (
            <img
              src={song.artwork}
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
          )}
        </div>
        
        {/* Header */}
        <header className="sticky top-0 z-10 glass-effect py-4 px-6">
          <div className="container max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <Link to="/" className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-lg font-medium">Now Playing</h1>
              <button 
                onClick={() => setLiked(!liked)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <Heart 
                  className={cn(
                    "h-5 w-5 transition-colors", 
                    liked ? "fill-red-500 text-red-500" : ""
                  )} 
                />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="container max-w-md mx-auto px-6 pt-4 pb-8">
          {/* Album Artwork */}
          <div className="album-artwork mb-6 aspect-square max-w-xs mx-auto">
            <img
              src={song.artwork}
              alt={`${song.title} by ${song.artist}`}
              className={cn(
                "w-full h-full object-cover rounded-lg shadow-2xl transition-opacity duration-500",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="w-full h-full bg-player-muted animate-pulse rounded-lg" />
            )}
          </div>
          
          {/* Song Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-1">{song.title}</h2>
            <p className="text-lg text-muted-foreground">{song.artist}</p>
            <p className="text-sm text-muted-foreground mt-1">{song.album}</p>
          </div>
          
          {/* Music Controls */}
          <div className="mb-12">
            <MusicControls />
          </div>
          
          {/* More From Artist */}
          {moreSongs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">More from {song.artist}</h3>
              <div className="space-y-1">
                {moreSongs.map((s) => (
                  <SongCard key={s.id} song={s} compact />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default SongDetail;
