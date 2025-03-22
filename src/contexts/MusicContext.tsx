
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

// Start with an empty array of songs instead of sample songs
const sampleSongs: Song[] = [];

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
      // Check permissions by attempting to get one media file
      try {
        await Media.getMedias({
          types: "videos" as any,
          limit: 1
        });
      } catch (e) {
        console.log('Permission check triggered:', e);
        // Permission likely denied or not yet granted
      }
      
      // Get all media files
      const mediaResults = await Media.getMedias({
        types: "all" as any,
        limit: 100
      });
      
      let mediaFiles = [];
      if (Array.isArray(mediaResults)) {
        mediaFiles = mediaResults;
      } else if (mediaResults && typeof mediaResults === 'object') {
        if ('items' in mediaResults && Array.isArray(mediaResults.items)) {
          mediaFiles = mediaResults.items;
        }
      }
      
      if (mediaFiles.length === 0) {
        toast({
          title: 'No Songs Found',
          description: 'No media files were found on your device.',
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Found media files:', mediaFiles);
      
      const audioFiles = mediaFiles.filter((file: any) => {
        const mediaType = file.mediaType?.toLowerCase() || '';
        const mimeType = file.mimeType?.toLowerCase() || '';
        return mediaType.includes('audio') || mimeType.includes('audio');
      });
      
      if (audioFiles.length === 0) {
        toast({
          title: 'No Songs Found',
          description: 'No audio files were found on your device.',
        });
        setIsLoading(false);
        return;
      }
      
      const deviceSongs: Song[] = await Promise.all(
        audioFiles.map(async (file: any, index: number) => {
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
      
      // Replace existing songs with device songs
      setSongs(deviceSongs);
      
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
