import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-7 p-5"
      style={{ background: 'radial-gradient(circle at 50% 0%, var(--color-secondary-soft), var(--color-bg) 60%)' }}
    >
      <div className="flex items-center gap-2.5 text-[1.5rem] font-extrabold">
        <span className="text-accent">◎</span>
        <span>Sonora</span>
      </div>
      <div className="bg-elevated rounded-2xl p-9 w-full max-w-[400px] shadow-2xl">
        <Outlet />
      </div>
    </div>
  );
}
