
import { cn } from "@/lib/utils";
import { AudioWaveform } from "lucide-react";

interface MusicWaveAnimationProps {
  isPlaying: boolean;
  className?: string;
}

const MusicWaveAnimation = ({ isPlaying, className }: MusicWaveAnimationProps) => {
  if (!isPlaying) {
    return (
      <div className={cn("flex items-center", className)}>
        <AudioWaveform className="h-4 w-4 text-player-accent opacity-60" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-end gap-0.5", className)}>
      <span className="music-wave w-0.5 h-2 bg-player-accent rounded-full animate-music-wave1"></span>
      <span className="music-wave w-0.5 h-3 bg-player-accent rounded-full animate-music-wave2"></span>
      <span className="music-wave w-0.5 h-1 bg-player-accent rounded-full animate-music-wave3"></span>
      <span className="music-wave w-0.5 h-2 bg-player-accent rounded-full animate-music-wave2"></span>
      <span className="music-wave w-0.5 h-1 bg-player-accent rounded-full animate-music-wave1"></span>
    </div>
  );
};

export default MusicWaveAnimation;
