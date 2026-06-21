import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Pencil, Trash2 } from 'lucide-react';
import {
  fetchPlaylistById, clearActivePlaylist, updatePlaylist, deletePlaylist, removeTrackFromPlaylist,
} from '../../features/playlists/playlistsSlice';
import { playQueue } from '../../features/player/playerSlice';
import TrackRow from '../../components/TrackRow';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const playlist = useSelector((state) => state.playlists.activePlaylist);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    dispatch(fetchPlaylistById(id));
    return () => dispatch(clearActivePlaylist());
  }, [id, dispatch]);

  if (!playlist) return null;

  const tracks = playlist.tracks?.map((pt) => pt.track) || [];
  const isOwner = playlist.userId === currentUserId;

  function handlePlayAll() {
    if (tracks.length > 0) {
      dispatch(playQueue({ tracks, startIndex: 0 }));
    }
  }

  async function handleSaveName() {
    if (nameInput.trim()) {
      await dispatch(updatePlaylist({ id: playlist.id, payload: { name: nameInput.trim() } }));
    }
    setEditing(false);
  }

  async function handleDelete() {
    if (window.confirm("Delete this playlist? This can't be undone.")) {
      await dispatch(deletePlaylist(playlist.id));
      navigate('/library');
    }
  }

  function handleRemoveTrack(track) {
    if (window.confirm(`Remove "${track.title}" from this playlist?`)) {
      dispatch(removeTrackFromPlaylist({ playlistId: playlist.id, trackId: track.id }));
    }
  }

  return (
    <div className="pt-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
        <div className="w-32 h-32 sm:w-[180px] sm:h-[180px] rounded-md bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-5xl text-white/70 shadow-2xl flex-shrink-0 overflow-hidden">
          {playlist.coverUrl ? <img src={playlist.coverUrl} alt="" className="w-full h-full object-cover" /> : <span>♪</span>}
        </div>

        <div className="flex flex-col gap-2 min-w-0 items-center sm:items-start">
          <span className="text-[0.8rem] font-bold uppercase text-text-secondary">Playlist</span>

          {editing ? (
            <div className="flex items-center gap-2.5 max-w-[400px] w-full">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <Button size="sm" onClick={handleSaveName}>Save</Button>
            </div>
          ) : (
            <h1 className="text-2xl sm:text-4xl font-extrabold break-words">{playlist.name}</h1>
          )}

          <p className="text-[0.85rem] text-text-secondary">
            By {playlist.user?.displayName} · {tracks.length} song{tracks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center sm:justify-start gap-4">
        <button
          className="w-14 h-14 rounded-full bg-accent text-[#1a0f0a] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
        >
          <Play size={20} fill="currentColor" />
        </button>

        {isOwner && (
          <>
            <button
              className="text-text-secondary hover:text-text-primary"
              onClick={() => { setEditing(true); setNameInput(playlist.name); }}
            >
              <Pencil size={18} />
            </button>
            <button className="text-text-secondary hover:text-danger" onClick={handleDelete}>
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {tracks.length === 0 && (
          <p className="text-text-muted py-5">No songs yet. Search for music and add it to this playlist.</p>
        )}
        {tracks.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            index={i}
            queueContext={tracks}
            onMenuClick={isOwner ? handleRemoveTrack : undefined}
          />
        ))}
      </div>
    </div>
  );
}
