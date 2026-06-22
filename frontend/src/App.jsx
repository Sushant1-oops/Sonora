import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { bootstrapSession, sessionExpired } from './features/auth/authSlice';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './features/home/HomePage';
import SearchPage from './features/search/SearchPage';
import LibraryPage from './features/library/LibraryPage';
import PlaylistDetailPage from './features/playlists/PlaylistDetailPage';
import ProfilePage from './features/profile/ProfilePage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

import { Toaster } from 'react-hot-toast';

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Keep token bootstrap logic
  useEffect(() => {
    dispatch(bootstrapSession());

    function handleSessionExpired() {
      dispatch(sessionExpired());
      navigate('/login');
    }

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [dispatch, navigate]);

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-elevated-2, #282828)',
            color: 'var(--color-text-primary, #ffffff)',
            borderRadius: '8px',
            border: '1px solid var(--color-border, #3f3f3f)',
            fontSize: '0.85rem',
          },
        }}
      />
      <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/library" element={<LibraryPage />} />
        </Route>
      </Route>
    </Routes>
    </>
  );
}
