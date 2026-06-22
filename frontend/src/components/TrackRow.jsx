import { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { playQueue, playPause, selectCurrentTrack } from '../features/player/playerSlice';
import { likeTrack, unlikeTrack, selectLikedRecord } from '../features/library/librarySlice';
import toast from 'react-hot-toast';
import AddToPlaylistModal from './AddToPlaylistModal';

function formatDuration(secs) {
  if (!secs) return '--:--';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrackRow({ track, index, queueContext, onMenuClick }) {
  const dispatch = useDispatch();
  const currentTrack = useSelector(selectCurrentTrack);
  const isPlaying = useSelector((state) => state.player.isPlaying);
  const isAuthenticated = useSelector((state) => !!state.auth.user);
  
  const likedRecord = useSelector((state) => selectLikedRecord(state, track.id || track.spotifyId));
  const isLiked = !!likedRecord;
  const [isAnimating, setIsAnimating] = useState(false);

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const isCurrent = currentTrack?.spotifyId === track.spotifyId;

  function handlePlayClick() {
    if (isCurrent) {
      dispatch(playPause());
    } else {
      dispatch(playQueue({ tracks: queueContext || [track], startIndex: index ?? 0 }));
    }
  }

  function handleLikeClick(e) {
    e.stopPropagation();
    if (!isAuthenticated) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 350);

    if (isLiked) {
      const idToUnlike = likedRecord?.trackId || track.id || track.spotifyId;
      dispatch(unlikeTrack({ trackId: idToUnlike, spotifyId: track.spotifyId }));
      toast.success(`Removed "${track.title}" from Liked Songs`, { id: `like-${track.spotifyId}` });
    } else {
      dispatch(likeTrack(track));
      toast.success(`Added "${track.title}" to Liked Songs`, { id: `like-${track.spotifyId}` });
    }
  }

  return (
    <>
      <div
        className={`
          group flex items-center gap-2.5 sm:gap-3.5
          px-2 sm:px-3 py-2 rounded-md transition-colors duration-100
          ${isCurrent ? 'bg-secondary-soft' : 'hover:bg-elevated'}
        `}
        onDoubleClick={handlePlayClick}
      >
        <button
          className={`
            flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-text-primary
            ${isCurrent ? 'bg-accent text-[#1a0f0a]' : 'bg-transparent group-hover:bg-accent group-hover:text-[#1a0f0a]'}
          `}
          onClick={handlePlayClick}
          aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrent && isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <img
          src={track.artworkUrl || '/placeholder-cover.svg'}
          alt={track.title}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-sm object-cover bg-elevated-2 flex-shrink-0"
          loading="lazy"
        />

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className={`truncate text-[0.85rem] sm:text-[0.9rem] font-medium ${isCurrent ? 'text-accent' : ''}`}>
            {track.title}
          </span>
          <span className="truncate text-[0.75rem] sm:text-[0.8rem] text-text-secondary">{track.artistName}</span>
        </div>

        {isAuthenticated && (
          <button
            className={`flex items-center justify-center flex-shrink-0 like-button-animated ${
              isLiked ? 'like-button-liked' : 'text-text-muted hover:text-text-primary'
            } ${isAnimating ? 'animate-heart-pop' : ''}`}
            onClick={handleLikeClick}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        )}

        <span className="hidden sm:inline text-[0.82rem] text-text-secondary flex-shrink-0">{formatDuration(track.durationSecs)}</span>

        {isAuthenticated && (
          <button
            className="flex items-center justify-center flex-shrink-0 text-text-muted sm:opacity-0 sm:group-hover:opacity-100 hover:text-text-primary transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              if (onMenuClick) {
                onMenuClick(track);
              } else {
                setShowPlaylistModal(true);
              }
            }}
            aria-label={onMenuClick ? "Remove track" : "Add to playlist"}
          >
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal track={track} onClose={() => setShowPlaylistModal(false)} />
      )}
    </>
  );
}
