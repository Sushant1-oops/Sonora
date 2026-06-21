import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setProgress,
  setDuration,
  next,
  setLoading,
  selectCurrentTrack,
} from '../features/player/playerSlice';
import { libraryApi } from '../services/libraryApi';

export function usePlayer() {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const hasRecordedPlayRef = useRef(false); 

  const currentTrack = useSelector(selectCurrentTrack);
  const { isPlaying, volume, isMuted, repeatMode } = useSelector((state) => state.player);
  const { isAuthenticated } = useSelector((state) => ({ isAuthenticated: !!state.auth.user }));

  
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    hasRecordedPlayRef.current = false;
    dispatch(setLoading(true));
    audio.src = currentTrack.streamUrl;
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => {
        
        
      });
    }
    
  }, [currentTrack?.id]);

  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      dispatch(setProgress(audio.currentTime));

      
      
      
      if (
        !hasRecordedPlayRef.current &&
        isAuthenticated &&
        currentTrack &&
        (audio.currentTime > 10 || audio.currentTime > audio.duration / 2)
      ) {
        hasRecordedPlayRef.current = true;
        libraryApi.recordPlay(currentTrack.jamendoId).catch(() => {});
      }
    };

    const handleLoadedMetadata = () => {
      dispatch(setDuration(audio.duration));
      dispatch(setLoading(false));
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        dispatch(next());
      }
    };

    const handleWaiting = () => dispatch(setLoading(true));
    const handlePlaying = () => dispatch(setLoading(false));

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
    
  }, [currentTrack, repeatMode, isAuthenticated, dispatch]);

  const seek = useCallback((seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      dispatch(setProgress(seconds));
    }
  }, [dispatch]);

  return { seek };
}
