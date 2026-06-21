import { Play, Pause } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { playQueue, playPause, selectCurrentTrack } from '../features/player/playerSlice';

export default function TrackCard({ track, index, queueContext }) {
  const dispatch = useDispatch();
  const currentTrack = useSelector(selectCurrentTrack);
  const isPlaying = useSelector((state) => state.player.isPlaying);
  const isCurrent = currentTrack?.spotifyId === track.spotifyId;

  function handleClick() {
    if (isCurrent) {
      dispatch(playPause());
    } else {
      dispatch(playQueue({ tracks: queueContext || [track], startIndex: index ?? 0 }));
    }
  }

  return (
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
      </div>
      <p className="truncate text-[0.82rem] sm:text-[0.9rem] font-semibold mb-0.5 sm:mb-1">{track.title}</p>
      <p className="truncate text-[0.75rem] sm:text-[0.8rem] text-text-secondary">{track.artistName}</p>
    </div>
  );
}
