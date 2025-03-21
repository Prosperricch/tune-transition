
import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useMusic } from '@/contexts/MusicContext';
import { cn } from '@/lib/utils';

interface MusicControlsProps {
  minimal?: boolean;
  className?: string;
}

export const MusicControls = ({ minimal = false, className }: MusicControlsProps) => {
  const { 
    currentSong, 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    toggle, 
    previous, 
    next, 
    seek,
    setVolumeLevel
  } = useMusic();
  
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  
  // Format time (e.g., 3:45)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Handle seeking when user interacts with progress bar
  const handleSeek = useCallback((value: number[]) => {
    if (duration > 0) {
      const newTime = (value[0] / 100) * duration;
      seek(newTime);
    }
  }, [duration, seek]);
  
  // Toggle mute
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolumeLevel(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolumeLevel(0);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0] / 100;
    setVolumeLevel(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  }, [isMuted, setVolumeLevel]);

  // Effect to sync muted state with volume
  useEffect(() => {
    if (volume === 0 && !isMuted) {
      setIsMuted(true);
    } else if (volume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [volume, isMuted]);
  
  if (!currentSong) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {!minimal && (
        <div className="w-full px-2 mb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <Slider
            value={[progressPercentage]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="my-1.5"
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-center items-center gap-4">
          <button 
            onClick={previous}
            className="music-controls p-1"
            aria-label="Previous track"
          >
            <SkipBack className={cn("h-5 w-5", minimal ? "h-4 w-4" : "")} />
          </button>
          
          <button
            onClick={toggle}
            className={cn(
              "music-controls rounded-full bg-white text-black flex items-center justify-center",
              minimal ? "h-8 w-8" : "h-10 w-10"
            )}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className={cn("h-5 w-5", minimal ? "h-4 w-4" : "")} />
            ) : (
              <Play className={cn("h-5 w-5 ml-0.5", minimal ? "h-4 w-4" : "")} />
            )}
          </button>
          
          <button 
            onClick={next}
            className="music-controls p-1"
            aria-label="Next track"
          >
            <SkipForward className={cn("h-5 w-5", minimal ? "h-4 w-4" : "")} />
          </button>
        </div>
        
        {!minimal && (
          <div className="flex-1 flex items-center justify-end gap-2 max-w-[120px]">
            <button 
              onClick={toggleMute}
              className="music-controls"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <Slider
              value={[volume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicControls;
