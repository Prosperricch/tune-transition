
import { cn } from "@/lib/utils";

interface MusicWaveAnimationProps {
  isPlaying: boolean;
  className?: string;
}

const MusicWaveAnimation = ({ isPlaying, className }: MusicWaveAnimationProps) => {
  if (!isPlaying) {
    return null;
  }

  return (
    <div className={cn("flex items-end", className)}>
      <span className="music-wave h-2 animate-music-wave1"></span>
      <span className="music-wave h-3 animate-music-wave2"></span>
      <span className="music-wave h-1 animate-music-wave3"></span>
    </div>
  );
};

export default MusicWaveAnimation;
