import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, Volume1, VolumeX, Heart, Plus,
} from 'lucide-react';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import {
  playPause, next, previous, setVolume, toggleMute,
  toggleShuffle, cycleRepeatMode, selectCurrentTrack,
  setProgress, setDuration, setLoading,
} from '../features/player/playerSlice';
import { likeTrack, unlikeTrack } from '../features/library/librarySlice';
import { musicApi } from '../services/musicApi';
import { libraryApi } from '../services/libraryApi';
import AddToPlaylistModal from './AddToPlaylistModal';

function formatTime(secs) {
  if (!secs || Number.isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerBar() {
  const dispatch = useDispatch();
  const playerRef = useRef(null);

  const currentTrack = useSelector(selectCurrentTrack);
  const {
    isPlaying, progress, duration, volume, isMuted, shuffle, repeatMode, isLoading,
  } = useSelector((state) => state.player);
  const isAuthenticated = useSelector((state) => !!state.auth.user);

  const likedTrackItem = useSelector((state) =>
    currentTrack
      ? state.library.likedTracks.find(
          (l) =>
            (currentTrack.id && l.trackId === currentTrack.id) ||
            (currentTrack.spotifyId && l.track?.spotifyId === currentTrack.spotifyId)
        )
      : null
  );
  const isLiked = !!likedTrackItem;

  const [resolvedTrack, setResolvedTrack] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const hasRecordedPlayRef = useRef(false);

  
  const youtubeUrl = resolvedTrack?.youtubeId
    ? `https://www.youtube.com/watch?v=${resolvedTrack.youtubeId}`
    : null;

  
  useEffect(() => {
    hasRecordedPlayRef.current = false;
  }, [currentTrack?.spotifyId]);

  
  useEffect(() => {
    if (!currentTrack) {
      setResolvedTrack(null);
      return;
    }

    let active = true;
    dispatch(setLoading(true));

    async function loadTrack() {
      try {
        const { data } = await musicApi.getTrack(currentTrack.spotifyId);
        if (active) {
          setResolvedTrack(data.data);
          if (data.data.durationSecs) {
            dispatch(setDuration(data.data.durationSecs));
          }
        }
      } catch (err) {
        console.error('Failed to resolve track:', err);
        toast.error('Failed to resolve track audio');
      } finally {
        if (active) {
          dispatch(setLoading(false));
        }
      }
    }

    loadTrack();

    return () => {
      active = false;
    };
  }, [currentTrack?.spotifyId, dispatch]);

  const handleSeek = useCallback((e) => {
    const targetSeconds = Number(e.target.value);
    dispatch(setProgress(targetSeconds));
    if (playerRef.current) {
      
      
      playerRef.current.currentTime = targetSeconds;
    }
  }, [dispatch]);

  const handleLike = useCallback(() => {
    if (!isAuthenticated) return;
    if (isLiked) {
      dispatch(unlikeTrack(likedTrackItem.trackId));
    } else {
      dispatch(likeTrack(currentTrack.spotifyId));
    }
  }, [isAuthenticated, isLiked, likedTrackItem, currentTrack, dispatch]);

  const handleTimeUpdate = useCallback((e) => {
    
    
    
    
    const currentTime = e?.target?.currentTime ?? 0;
    dispatch(setProgress(currentTime));

    if (
      !hasRecordedPlayRef.current &&
      isAuthenticated &&
      resolvedTrack &&
      (currentTime > 10 || currentTime > (resolvedTrack.durationSecs / 2))
    ) {
      hasRecordedPlayRef.current = true;
      libraryApi.recordPlay(resolvedTrack.spotifyId).catch(() => {});
    }
  }, [isAuthenticated, resolvedTrack, dispatch]);

  const handleDurationChange = useCallback((e) => {
    
    
    const dur = e?.target?.duration;
    if (dur && Number.isFinite(dur)) {
      dispatch(setDuration(dur));
    }
  }, [dispatch]);

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one') {
      if (playerRef.current) {
        playerRef.current.currentTime = 0;
      }
    } else {
      dispatch(next());
    }
  }, [repeatMode, dispatch]);

  const handleError = useCallback((err) => {
    console.error('YouTube playback error:', err);
    toast.error('Playback error – skipping to next song.');
    dispatch(next());
  }, [dispatch]);

  if (!currentTrack) {
    return (
      <div className="h-[90px] bg-elevated border-t border-border flex items-center justify-center text-text-muted text-[0.85rem]">
        Pick a song to start listening
      </div>
    );
  }

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;
  const seekPct = duration ? (progress / duration) * 100 : 0;
  const volPct = (isMuted ? 0 : volume) * 100;

  return (
    <div className="h-[90px] bg-elevated border-t border-border grid grid-cols-3 items-center px-4 gap-4 relative">
      {}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-[54px] h-[54px] flex-shrink-0">
          <img
            src={currentTrack.artworkUrl || '/placeholder-cover.svg'}
            alt=""
            className="w-full h-full rounded-sm object-cover bg-elevated-2"
          />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="truncate text-[0.88rem] font-semibold">{currentTrack.title}</span>
          <span className="truncate text-[0.78rem] text-text-secondary">{currentTrack.artistName}</span>
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              className={`${isLiked ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
              onClick={handleLike}
              aria-label="Like"
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              className="text-text-muted hover:text-text-primary"
              onClick={() => setShowPlaylistModal(true)}
              aria-label="Add to playlist"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>

      {}
      <div className="flex flex-col items-center gap-1.5 max-w-[600px] w-full mx-auto">
        <div className="flex items-center gap-4">
          <button
            className={`flex items-center justify-center ${shuffle ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => dispatch(toggleShuffle())}
            aria-label="Shuffle"
          >
            <Shuffle size={17} />
          </button>
          <button className="flex items-center justify-center text-text-secondary hover:text-text-primary" onClick={() => dispatch(previous())} aria-label="Previous">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            className="w-[34px] h-[34px] rounded-full bg-text-primary text-bg flex items-center justify-center hover:scale-105 transition-transform"
            onClick={() => dispatch(playPause())}
            aria-label="Play/Pause"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>
          <button className="flex items-center justify-center text-text-secondary hover:text-text-primary" onClick={() => dispatch(next())} aria-label="Next">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            className={`flex items-center justify-center ${repeatMode !== 'off' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => dispatch(cycleRepeatMode())}
            aria-label="Repeat"
          >
            <RepeatIcon size={17} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-[0.72rem] text-text-muted min-w-[36px] text-center">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={handleSeek}
            className="player-slider flex-1"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${seekPct}%, var(--color-elevated-2) ${seekPct}%, var(--color-elevated-2) 100%)`,
            }}
          />
          <span className="text-[0.72rem] text-text-muted min-w-[36px] text-center">{formatTime(duration)}</span>
        </div>
      </div>

      {}
      <div className="flex items-center gap-2 justify-self-end w-[140px]">
        <button className="flex items-center justify-center text-text-secondary hover:text-text-primary" onClick={() => dispatch(toggleMute())} aria-label="Mute">
          <VolumeIcon size={18} />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={(e) => dispatch(setVolume(Number(e.target.value)))}
          className="player-slider w-[90px]"
          style={{
            background: `linear-gradient(to right, var(--color-text-secondary) 0%, var(--color-text-secondary) ${volPct}%, var(--color-elevated-2) ${volPct}%, var(--color-elevated-2) 100%)`,
          }}
        />
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal
          track={currentTrack}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}

      {}
      {youtubeUrl && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            width: '200px',
            height: '200px',
            zIndex: 99999,
            opacity: 0.01,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <ReactPlayer
            ref={playerRef}
            src={youtubeUrl}
            playing={isPlaying}
            volume={isMuted ? 0 : volume}
            width="100%"
            height="100%"
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onEnded={handleEnded}
            onError={handleError}
            onReady={() => console.log('[PlayerBar] YouTube player ready')}
            config={{
              
              
              
              
              
              
              
              youtube: {
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                rel: 0,
                origin: window.location.origin,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
