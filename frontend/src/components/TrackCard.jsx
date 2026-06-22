import { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { playQueue, playPause, selectCurrentTrack } from '../features/player/playerSlice';
import { likeTrack, unlikeTrack, selectLikedRecord } from '../features/library/librarySlice';
import AddToPlaylistModal from './AddToPlaylistModal';
import toast from 'react-hot-toast';

export default function TrackCard({ track, index, queueContext }) {
  const dispatch = useDispatch();
  const currentTrack = useSelector(selectCurrentTrack);
  const isPlaying = useSelector((state) => state.player.isPlaying);
  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const likedRecord = useSelector((state) => selectLikedRecord(state, track.id || track.spotifyId));
  const isLiked = !!likedRecord;
  const [isAnimating, setIsAnimating] = useState(false);
  const isCurrent = currentTrack?.spotifyId === track.spotifyId;

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  function handleClick() {
    if (isCurrent) {
      dispatch(playPause());
    } else {
      dispatch(playQueue({ tracks: queueContext || [track], startIndex: index ?? 0 }));
    }
  }

  function handleLike(e) {
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

  function handleMenu(e) {
    e.stopPropagation();
    if (!isAuthenticated) return;
    setShowPlaylistModal(true);
  }

  return (
    <>
      <div
        className="group bg-elevated hover:bg-elevated-2 rounded-2xl p-2.5 sm:p-3.5 cursor-pointer transition-colors duration-200"
        onClick={handleClick}
      >
        <div className="relative w-full aspect-square mb-2 sm:mb-3">
          <img
            src={track.artworkUrl || '/placeholder-cover.svg'}
            alt={track.title}
            className="w-full h-full object-cover rounded-md bg-elevated-2 shadow-lg"
            loading="lazy"
          />
          <button
            className="
              absolute bottom-2 right-2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent text-[#1a0f0a]
              flex items-center justify-center shadow-lg
              opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-200
            "
            aria-label="Play"
          >
            {isCurrent && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>

          {isAuthenticated && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
              <button
                className={`w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center
                  sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200
                  like-button-animated ${isLiked ? 'like-button-liked' : 'text-white/80 hover:text-white'}
                  ${isAnimating ? 'animate-heart-pop' : ''}`}
                onClick={handleLike}
                aria-label={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button
                className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center
                  text-white/80 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                onClick={handleMenu}
                aria-label="Add to playlist"
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          )}
        </div>
        <p className="truncate text-[0.82rem] sm:text-[0.9rem] font-semibold mb-0.5 sm:mb-1">{track.title}</p>
        <p className="truncate text-[0.75rem] sm:text-[0.8rem] text-text-secondary">{track.artistName}</p>
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal track={track} onClose={() => setShowPlaylistModal(false)} />
      )}
    </>
  );
}
