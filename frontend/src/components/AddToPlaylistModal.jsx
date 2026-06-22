import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Plus } from 'lucide-react';
import { fetchMyPlaylists, createPlaylist, addTrackToPlaylist } from '../features/playlists/playlistsSlice';
import toast from 'react-hot-toast';

export default function AddToPlaylistModal({ track, onClose }) {
  const dispatch = useDispatch();
  const playlists = useSelector((state) => state.playlists.items);
  const status = useSelector((state) => state.playlists.status);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  useEffect(() => {
    dispatch(fetchMyPlaylists());
  }, [dispatch]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const name = newPlaylistName;
    const desc = newPlaylistDesc;
    try {
      setShowCreateForm(false);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      const created = await dispatch(createPlaylist({ name, description: desc })).unwrap();
      toast.success(`Created playlist "${created.name || name}"`);
    } catch (err) {
      toast.error('Failed to create playlist');
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    const playlistName = playlist ? playlist.name : 'playlist';
    toast.success(`Added "${track.title}" to ${playlistName}`);
    onClose();
    try {
      await dispatch(addTrackToPlaylist({ playlistId, spotifyId: track.spotifyId })).unwrap();
    } catch (err) {
      toast.error(`Failed to add track to ${playlistName}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-elevated w-full max-w-[400px] rounded-xl border border-border p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
        <button
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h3 className="text-[1.15rem] font-bold mb-4 pr-6">Add to playlist</h3>

        <div className="flex items-center gap-3 bg-secondary-soft p-3 rounded-lg mb-4">
          <img
            src={track.artworkUrl || '/placeholder-cover.svg'}
            alt=""
            className="w-12 h-12 rounded object-cover bg-elevated-2"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[0.88rem] truncate">{track.title}</p>
            <p className="text-[0.78rem] text-text-secondary truncate">{track.artistName}</p>
          </div>
        </div>

        {showCreateForm ? (
          <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3.5 mb-4">
            <div>
              <label className="block text-[0.78rem] font-semibold text-text-secondary mb-1">
                Playlist Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded bg-elevated-2 border border-border text-[0.88rem] focus:outline-none focus:border-accent"
                placeholder="My Awesome Playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-[0.78rem] font-semibold text-text-secondary mb-1">
                Description (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 rounded bg-elevated-2 border border-border text-[0.88rem] focus:outline-none focus:border-accent resize-none h-16"
                placeholder="Give your playlist a description"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-full text-[0.8rem] font-semibold border border-border hover:bg-elevated-2 transition-colors"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full text-[0.8rem] font-semibold bg-accent text-[#1a0f0a] hover:scale-105 transition-transform"
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          <button
            className="flex items-center gap-2 text-[0.85rem] font-semibold text-accent hover:text-accent-hover mb-4 transition-colors text-left"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={16} /> Create new playlist
          </button>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-1.5">
          {status === 'loading' && playlists.length === 0 ? (
            <p className="text-text-muted text-[0.85rem] py-4 text-center">Loading playlists…</p>
          ) : playlists.length === 0 ? (
            <p className="text-text-muted text-[0.85rem] py-4 text-center">
              You haven't created any playlists yet.
            </p>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="flex items-center justify-between text-left p-2.5 rounded-lg hover:bg-elevated-2 transition-colors group"
                onClick={() => handleAddToPlaylist(playlist.id)}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[0.88rem] truncate group-hover:text-accent transition-colors">
                    {playlist.name}
                  </p>
                  <p className="text-[0.75rem] text-text-secondary">
                    {playlist._count?.tracks || 0} songs
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
