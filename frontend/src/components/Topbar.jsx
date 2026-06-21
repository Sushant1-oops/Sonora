import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';

export default function Topbar({ onMenuClick }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="h-16 flex items-center gap-3 px-4 lg:px-6 bg-bg/70 backdrop-blur-md sticky top-0 z-10">
      {}
      <button
        className="lg:hidden text-text-secondary hover:text-text-primary flex-shrink-0"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1" />

      {isAuthenticated ? (
        <div className="relative">
          <button
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full bg-elevated hover:bg-elevated-2 text-[0.85rem] font-semibold max-w-[180px]"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : <UserIcon size={16} />}
            </span>
            <span className="truncate">{user.displayName}</span>
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 bg-elevated-2 rounded-md shadow-xl min-w-[180px] overflow-hidden z-20">
              <button
                className="flex items-center gap-2.5 w-full px-4 py-3 text-[0.85rem] text-left hover:bg-bg-hover"
                onClick={() => { setMenuOpen(false); navigate(`/profile/${user.username}`); }}
              >
                <UserIcon size={15} /> Profile
              </button>
              <button className="flex items-center gap-2.5 w-full px-4 py-3 text-[0.85rem] text-left hover:bg-bg-hover" onClick={handleLogout}>
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/register')}>Sign up</Button>
          <Button variant="primary" onClick={() => navigate('/login')}>Log in</Button>
        </div>
      )}
    </header>
  );
}
