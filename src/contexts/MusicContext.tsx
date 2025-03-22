
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { Media } from '@capacitor-community/media';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork: string;
  audioSrc: string;
  filePath?: string;
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
  loadSongsFromDevice: () => Promise<void>;
  isLoading: boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    setAudioElement(audio);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      next();
    };
    
    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      toast({
        title: 'Playback Error',
        description: 'There was an error playing this song. Please try another one.',
        variant: 'destructive',
      });
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!audioElement || !currentSong) return;
    
    const loadAndPlay = async () => {
      try {
        if (currentSong.filePath && Capacitor.isNativePlatform()) {
          const fileUri = currentSong.filePath;
          audioElement.src = fileUri;
        } else {
          audioElement.src = currentSong.audioSrc;
        }
        
        audioElement.load();
        
        if (isPlaying) {
          try {
            await audioElement.play();
          } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
            toast({
              title: 'Playback Error',
              description: 'Unable to play this track. Please try another one.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Error setting up audio source:', error);
        toast({
          title: 'Error',
          description: 'Unable to load this track. Please try another one.',
          variant: 'destructive',
        });
      }
    };
    
    loadAndPlay();
  }, [currentSong, audioElement]);

  useEffect(() => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.play().catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
        toast({
          title: 'Playback Error',
          description: 'Unable to play this track. Please try another one.',
          variant: 'destructive',
        });
      });
    } else {
      audioElement.pause();
    }
  }, [isPlaying, audioElement]);

  useEffect(() => {
    if (audioElement) {
      audioElement.volume = volume;
    }
  }, [volume, audioElement]);

  const loadSongsFromDevice = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: 'Device Access',
        description: 'This feature is only available on mobile devices.',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fix: Media permissions are handled differently
      try {
        await Media.getMedias({
          limit: 1,
          types: 'videos'
        });
      } catch (e) {
        console.log('Permission check triggered');
        // Permission likely denied or not yet granted
      }
      
      const mediaResults = await Media.getMedias({
        types: 'all',
        limit: 100
      });
      
      const mediaFiles = Array.isArray(mediaResults) 
        ? mediaResults 
        : 'items' in mediaResults 
          ? mediaResults.items || [] 
          : [];
      
      if (mediaFiles.length === 0) {
        toast({
          title: 'No Songs Found',
          description: 'No audio files were found on your device.',
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Found media files:', mediaFiles);
      
      // Filter to only include audio files
      const audioFiles = mediaFiles.filter(file => 
        file.mediaType?.toLowerCase().includes('audio') || 
        file.mimeType?.toLowerCase().includes('audio')
      );
      
      if (audioFiles.length === 0) {
        toast({
          title: 'No Songs Found',
          description: 'No audio files were found on your device.',
        });
        setIsLoading(false);
        return;
      }
      
      const deviceSongs: Song[] = await Promise.all(
        audioFiles.map(async (file, index) => {
          let filePath = file.path;
          
          if (Capacitor.getPlatform() === 'android') {
            filePath = Capacitor.convertFileSrc(file.path);
          }
          
          return {
            id: `device-${index}-${file.id || Date.now()}`,
            title: file.filename || file.name || 'Unknown Title',
            artist: file.artist || 'Unknown Artist',
            album: file.album || 'Unknown Album',
            duration: file.duration || 0,
            artwork: file.thumbnail || '/lovable-uploads/e115393c-28eb-4194-a2a5-29bdb709ceb7.png',
            audioSrc: '',
            filePath: filePath,
          };
        })
      );
      
      console.log('Processed songs:', deviceSongs);
      
      setSongs([...deviceSongs, ...sampleSongs]);
      
      toast({
        title: 'Songs Loaded',
        description: `Loaded ${deviceSongs.length} songs from your device.`,
      });
    } catch (error) {
      console.error('Error loading songs from device:', error);
      toast({
        title: 'Error',
        description: 'Failed to load songs from your device. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const play = (song?: Song) => {
    if (song) {
      setCurrentSong(song);
    } else if (currentSong) {
      setIsPlaying(true);
    } else if (songs.length > 0) {
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
    loadSongsFromDevice,
    isLoading,
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
