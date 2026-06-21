import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import PlayerBar from '../components/PlayerBar';

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gradient-to-b from-elevated to-bg [background-size:100%_320px] bg-no-repeat">
          <Topbar />
          <main className="flex-1 px-8 pb-8">
            <Outlet />
          </main>
        </div>
      </div>
      <PlayerBar />
    </div>
  );
}
