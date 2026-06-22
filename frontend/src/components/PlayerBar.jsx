import { useDispatch, useSelector } from 'react-redux';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, Volume1, VolumeX, Heart,
} from 'lucide-react';
import {
  playPause, next, previous, setVolume, toggleMute,
  toggleShuffle, cycleRepeatMode, selectCurrentTrack,
} from '../features/player/playerSlice';
import { likeTrack, unlikeTrack, selectIsLiked } from '../features/library/librarySlice';
import { usePlayer } from '../hooks/usePlayer';

function formatTime(secs) {
  if (!secs || Number.isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerBar() {
  const dispatch = useDispatch();
  const { seek } = usePlayer();

  const currentTrack = useSelector(selectCurrentTrack);
  const {
    isPlaying, progress, duration, volume, isMuted, shuffle, repeatMode, isLoading,
  } = useSelector((state) => state.player);
  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const isLiked = useSelector((state) => currentTrack?.id && selectIsLiked(state, currentTrack.id));

  if (!currentTrack) {
    return (
      <div className="h-[56px] lg:h-[90px] bg-elevated border-t border-border flex items-center justify-center text-text-muted text-[0.78rem] lg:text-[0.85rem] px-4 text-center">
        Pick a song to start listening
      </div>
    );
  }

  function handleSeek(e) {
    seek(Number(e.target.value));
  }

  function handleLike() {
    if (!isAuthenticated) return;
    if (isLiked) dispatch(unlikeTrack(currentTrack.id));
    else dispatch(likeTrack(currentTrack.spotifyId));
  }

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;
  const seekPct = duration ? (progress / duration) * 100 : 0;
  const volPct = (isMuted ? 0 : volume) * 100;

  return (
    <div className="bg-elevated border-t border-border flex flex-col">
      {}
      <div className="lg:hidden w-full">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={progress}
          onChange={handleSeek}
          className="mobile-seek-slider w-full"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${seekPct}%, var(--color-elevated-2) ${seekPct}%, var(--color-elevated-2) 100%)`,
          }}
          aria-label="Seek"
        />
      </div>

      <div className="h-[64px] lg:h-[90px] grid grid-cols-[1fr_auto] lg:grid-cols-3 items-center px-3 lg:px-4 gap-2 lg:gap-4">
        {}
        <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
          <img src={currentTrack.artworkUrl || '/placeholder-cover.svg'} alt="" className="w-10 h-10 lg:w-[54px] lg:h-[54px] rounded-sm object-cover bg-elevated-2 flex-shrink-0" />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="truncate text-[0.8rem] lg:text-[0.88rem] font-semibold">{currentTrack.title}</span>
            <span className="truncate text-[0.7rem] lg:text-[0.78rem] text-text-secondary">{currentTrack.artistName}</span>
          </div>
          {isAuthenticated && (
            <button
              className={`flex flex-shrink-0 ${isLiked ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
              onClick={handleLike}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {}
        <div className="flex items-center gap-3 lg:hidden flex-shrink-0">
          <button className="text-text-secondary hover:text-text-primary" onClick={() => dispatch(previous())} aria-label="Previous">
            <SkipBack size={18} fill="currentColor" />
          </button>
          <button
            className="w-9 h-9 rounded-full bg-text-primary text-bg flex items-center justify-center"
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
          <button className="text-text-secondary hover:text-text-primary" onClick={() => dispatch(next())} aria-label="Next">
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {}
        <div className="hidden lg:flex flex-col items-center gap-1.5 max-w-[600px] w-full mx-auto">
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
        <div className="hidden lg:flex items-center gap-2 justify-self-end w-[140px]">
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
      </div>
    </div>
  );
}
