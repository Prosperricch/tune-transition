
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusic, Song } from '@/contexts/MusicContext';
import MusicWaveAnimation from './MusicWaveAnimation';

interface SongCardProps {
  song: Song;
  className?: string;
  compact?: boolean;
}

const SongCard = ({ song, className, compact = false }: SongCardProps) => {
  const { currentSong, isPlaying, toggle, play, pause } = useMusic();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const isActive = currentSong?.id === song.id;
  
  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isActive) {
      toggle();
    } else {
      play(song);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Link
      to={`/song/${song.id}`}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg p-2 transition-all',
        'hover:bg-player-muted/50 active:scale-[0.98]',
        isActive && 'bg-player-muted/30',
        className
      )}
    >
      <div className={cn(
        'relative overflow-hidden rounded-md',
        compact ? 'h-10 w-10' : 'h-16 w-16'
      )}>
        <img
          src={song.artwork}
          alt={`${song.title} by ${song.artist}`}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-player-muted animate-pulse" />
        )}
        <button
          onClick={handlePlayPause}
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-black/40 opacity-0 transition-opacity duration-200',
            'group-hover:opacity-100',
            isActive && isPlaying && 'opacity-100'
          )}
        >
          {isActive && isPlaying ? (
            <Pause className="h-6 w-6 text-white" />
          ) : (
            <Play className="h-6 w-6 text-white" />
          )}
        </button>
      </div>
      
      <div className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "font-medium truncate",
            isActive && "text-player-accent"
          )}>
            {song.title}
          </h3>
          {isActive && (
            <MusicWaveAnimation isPlaying={isPlaying} className="ml-1" />
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {song.artist}
        </p>
        {!compact && (
          <p className="text-xs text-muted-foreground mt-1">
            {song.album} • {formatTime(song.duration)}
          </p>
        )}
      </div>
    </Link>
  );
};

export default SongCard;
