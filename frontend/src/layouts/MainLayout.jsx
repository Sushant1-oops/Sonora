import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import PlayerBar from '../components/PlayerBar';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  
  
  
  
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 min-h-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gradient-to-b from-elevated to-bg [background-size:100%_320px] bg-no-repeat">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8">
            <Outlet />
          </main>
        </div>
      </div>
      <PlayerBar />
    </div>
  );
}
