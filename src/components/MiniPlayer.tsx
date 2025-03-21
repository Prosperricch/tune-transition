
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMusic } from '@/contexts/MusicContext';
import MusicControls from './MusicControls';
import { cn } from '@/lib/utils';

const MiniPlayer = () => {
  const { currentSong, isPlaying } = useMusic();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  if (!currentSong) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-player-border animate-slide-up">
      <div className="container max-w-md mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to={`/song/${currentSong.id}`} className="block flex-shrink-0">
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              <img
                src={currentSong.artwork}
                alt={`${currentSong.title} by ${currentSong.artist}`}
                className={cn(
                  "h-full w-full object-cover transition-opacity duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-player-muted animate-pulse" />
              )}
            </div>
          </Link>
          
          <div className="flex-1 min-w-0">
            <Link to={`/song/${currentSong.id}`} className="block">
              <h4 className="font-medium truncate">{currentSong.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
            </Link>
          </div>
          
          <MusicControls minimal className="flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
