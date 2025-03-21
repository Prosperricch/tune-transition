
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork: string;
  audioSrc: string;
}

interface MusicContextType {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: (song?: Song) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolumeLevel: (level: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Sample song data
const sampleSongs: Song[] = [
  {
    id: '1',
    title: 'Morning Dew',
    artist: 'James Wilson',
    album: 'Nature Sounds',
    duration: 217,
    artwork: '/lovable-uploads/e115393c-28eb-4194-a2a5-29bdb709ceb7.png',
    audioSrc: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8e0070a42.mp3?filename=lofi-study-112191.mp3',
  },
  {
    id: '2',
    title: 'Cosmic Waves',
    artist: 'Stella Nova',
    album: 'Space Dreams',
    duration: 184,
    artwork: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=1974&auto=format&fit=crop',
    audioSrc: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1edf.mp3?filename=electronic-future-beats-117997.mp3',
  },
  {
    id: '3',
    title: 'Urban Rhythm',
    artist: 'Metro Beats',
    album: 'City Life',
    duration: 243,
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop',
    audioSrc: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_55f8d63197.mp3?filename=chill-hop-lo-fi-131912.mp3',
  },
  {
    id: '4',
    title: 'Sunset Melody',
    artist: 'Ocean Sounds',
    album: 'Beach Vibes',
    duration: 198,
    artwork: 'https://images.unsplash.com/photo-1549638441-b787d2e11f14?q=80&w=2070&auto=format&fit=crop',
    audioSrc: 'https://cdn.pixabay.com/download/audio/2023/04/21/audio_00ed349289.mp3?filename=lofi-chill-medium-version-159459.mp3',
  },
  {
    id: '5',
    title: 'Midnight Jazz',
    artist: 'Blue Notes',
    album: 'Late Hours',
    duration: 227,
    artwork: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=2070&auto=format&fit=crop',
    audioSrc: 'https://cdn.pixabay.com/download/audio/2022/01/13/audio_5644bed928.mp3?filename=best-time-112194.mp3',
  }
];

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>(sampleSongs);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    setAudioElement(audio);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      next();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Load the song when currentSong changes
  useEffect(() => {
    if (!audioElement || !currentSong) return;
    
    // Set the audio source to the selected song
    audioElement.src = currentSong.audioSrc;
    
    // Load the audio
    audioElement.load();
    
    // Play the audio if isPlaying is true
    if (isPlaying) {
      audioElement.play().catch((error) => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Error',
          description: 'Unable to play this track. Please try another one.',
          variant: 'destructive',
        });
      });
    }
  }, [currentSong, audioElement]);

  // Update audio playback when isPlaying changes
  useEffect(() => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.play().catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    } else {
      audioElement.pause();
    }
  }, [isPlaying, audioElement]);

  // Update volume when it changes
  useEffect(() => {
    if (audioElement) {
      audioElement.volume = volume;
    }
  }, [volume, audioElement]);

  const play = (song?: Song) => {
    if (song) {
      // If a song is provided, set it as the current song
      setCurrentSong(song);
    } else if (currentSong) {
      // If no song is provided but there is a current song, play it
      setIsPlaying(true);
    } else if (songs.length > 0) {
      // If no current song, set the first song as current
      setCurrentSong(songs[0]);
    }
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const toggle = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    } else if (songs.length > 0) {
      setCurrentSong(songs[0]);
      setIsPlaying(true);
    }
  };

  const next = () => {
    if (!currentSong || songs.length === 0) return;
    
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    
    if (isPlaying) {
      setIsPlaying(true);
    }
  };

  const previous = () => {
    if (!currentSong || songs.length === 0) return;
    
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    
    if (isPlaying) {
      setIsPlaying(true);
    }
  };

  const seek = (time: number) => {
    if (audioElement) {
      audioElement.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolumeLevel = (level: number) => {
    setVolume(level);
  };

  const value = {
    songs,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    toggle,
    next,
    previous,
    seek,
    setVolumeLevel,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
