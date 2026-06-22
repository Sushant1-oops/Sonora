import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Home, Search, Library, Plus, Heart, X } from 'lucide-react';
import { fetchMyPlaylists, createPlaylist } from '../features/playlists/playlistsSlice';
import toast from 'react-hot-toast';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3.5 px-3 py-2.5 rounded-md text-[0.92rem] font-semibold transition-colors duration-150 ${
    isActive ? 'text-text-primary bg-elevated' : 'text-text-secondary hover:text-text-primary'
  }`;

export default function Sidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const playlists = useSelector((state) => state.playlists.items);
  const isAuthenticated = useSelector((state) => !!state.auth.user);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchMyPlaylists());
  }, [isAuthenticated, dispatch]);

  async function handleCreatePlaylist() {
    setCreating(true);
    try {
      const created = await dispatch(createPlaylist({ name: 'My Playlist', isPublic: false })).unwrap();
      toast.success(`Created playlist "${created.name || 'My Playlist'}"`);
    } catch (err) {
      toast.error('Failed to create playlist');
    } finally {
      setCreating(false);
    }
  }

  
  
  
  function handleNavClick() {
    if (onClose) onClose();
  }

  return (
    <>
      {}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 z-40
          w-[260px] h-full bg-bg border-r border-border flex flex-col p-5 px-3
          overflow-y-auto transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between px-3 pb-6">
          <div className="flex items-center gap-2.5">
            <span className="text-[1.4rem] text-accent">◎</span>
            <span className="text-[1.3rem] font-extrabold tracking-tight">Sonora</span>
          </div>
          {}
          <button className="lg:hidden text-text-secondary hover:text-text-primary" onClick={onClose} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 mb-4">
          <NavLink to="/" className={navLinkClass} end onClick={handleNavClick}>
            <Home size={20} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/search" className={navLinkClass} onClick={handleNavClick}>
            <Search size={20} />
            <span>Search</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/library" className={navLinkClass} onClick={handleNavClick}>
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
              <NavLink to="/library?tab=liked" className={navLinkClass} onClick={handleNavClick}>
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
                  onClick={handleNavClick}
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
    </>
  );
}
