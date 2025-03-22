
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, FolderPlus, Loader2, Music } from 'lucide-react';
import { useMusic } from '@/contexts/MusicContext';
import SongCard from '@/components/SongCard';
import MiniPlayer from '@/components/MiniPlayer';
import PageTransition from '@/components/PageTransition';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Capacitor } from '@capacitor/core';

const Library = () => {
  const { songs, currentSong, loadSongsFromDevice, isLoading } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auto-load songs when library opens if none are loaded
  useEffect(() => {
    if (Capacitor.isNativePlatform() && songs.length === 0 && !isLoading) {
      loadSongsFromDevice();
    }
  }, []);
  
  // Filter songs based on search query
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLoadSongs = async () => {
    await loadSongsFromDevice();
  };
  
  return (
    <PageTransition direction="left">
      <div className="min-h-screen pb-24">
        {/* Header */}
        <header className="sticky top-0 z-10 glass-effect py-4 px-6">
          <div className="container max-w-md mx-auto">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold">Your Music</h1>
            </div>
          </div>
        </header>
        
        {/* Search and Load Songs */}
        <div className="container max-w-md mx-auto px-6 py-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your music..."
              className="pl-9 bg-player-muted/50 border-player-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {Capacitor.isNativePlatform() && (
            <Button 
              onClick={handleLoadSongs} 
              className="w-full mb-6 bg-player-accent hover:bg-player-accent/90 py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading your music...
                </>
              ) : (
                <>
                  <FolderPlus className="h-5 w-5 mr-2" />
                  Refresh your music library
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Song List */}
        <main className="container max-w-md mx-auto px-6">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-player-accent" />
              <p className="text-muted-foreground">Scanning your device for music...</p>
            </div>
          ) : filteredSongs.length > 0 ? (
            <div className="space-y-1">
              {filteredSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="bg-player-muted/50 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No music found</h3>
              <p className="text-muted-foreground mb-6">
                {Capacitor.isNativePlatform() 
                  ? "We couldn't find any music on your device" 
                  : "This app requires a mobile device to access music"}
              </p>
              {Capacitor.isNativePlatform() && (
                <Button
                  onClick={handleLoadSongs}
                  className="bg-player-accent hover:bg-player-accent/90"
                  disabled={isLoading}
                >
                  <FolderPlus className="h-5 w-5 mr-2" />
                  Scan for music
                </Button>
              )}
            </div>
          )}
        </main>
        
        {/* Mini Player */}
        {currentSong && <MiniPlayer />}
      </div>
    </PageTransition>
  );
};

export default Library;
