import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Home, Search, Library, Plus, Heart } from 'lucide-react';
import { fetchMyPlaylists, createPlaylist } from '../features/playlists/playlistsSlice';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3.5 px-3 py-2.5 rounded-md text-[0.92rem] font-semibold transition-colors duration-150 ${
    isActive ? 'text-text-primary bg-elevated' : 'text-text-secondary hover:text-text-primary'
  }`;

export default function Sidebar() {
  const dispatch = useDispatch();
  const playlists = useSelector((state) => state.playlists.items);
  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchMyPlaylists());
  }, [isAuthenticated, dispatch]);

  async function handleCreatePlaylist() {
    setCreating(true);
    await dispatch(createPlaylist({ name: 'My Playlist', isPublic: false }));
    setCreating(false);
  }

  return (
    <aside className="w-[260px] bg-bg border-r border-border flex flex-col p-5 px-3 h-full overflow-y-auto">
      <div className="flex items-center gap-2.5 px-3 pb-6">
        <span className="text-[1.4rem] text-accent">◎</span>
        <span className="text-[1.3rem] font-extrabold tracking-tight">Sonora</span>
      </div>

      <nav className="flex flex-col gap-0.5 mb-4">
        <NavLink to="/" className={navLinkClass} end>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={navLinkClass}>
          <Search size={20} />
          <span>Search</span>
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/library" className={navLinkClass}>
            <Library size={20} />
            <span>Your Library</span>
          </NavLink>
        )}
      </nav>

      {isAuthenticated && (
        <>
          <div className="flex flex-col gap-0.5 mb-2">
            <button
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-md text-[0.92rem] font-semibold text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors"
              onClick={handleCreatePlaylist}
              disabled={creating}
            >
              <span className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-text-secondary text-bg">
                <Plus size={16} />
              </span>
              <span>Create Playlist</span>
            </button>
            <NavLink to="/library?tab=liked" className={navLinkClass}>
              <span className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-secondary to-accent text-white">
                <Heart size={16} fill="currentColor" />
              </span>
              <span>Liked Songs</span>
            </NavLink>
          </div>

          <div className="h-px bg-border mx-3 my-3" />

          <div className="flex flex-col gap-0.5 overflow-y-auto">
            {playlists.map((playlist) => (
              <NavLink
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className={({ isActive }) =>
                  `truncate px-3 py-2 text-[0.85rem] rounded-md transition-colors ${
                    isActive ? 'text-text-primary bg-elevated' : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                  }`
                }
              >
                {playlist.name}
              </NavLink>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
