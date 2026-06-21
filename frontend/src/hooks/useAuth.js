import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { loginUser, registerUser, logoutUser } from '../features/auth/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, status, error, bootstrapped } = useSelector((state) => state.auth);

  
  
  const login = useCallback(
    async (payload) => {
      const action = await dispatch(loginUser(payload));
      return action.meta.requestStatus === 'rejected' ? { error: action.payload } : { data: action.payload };
    },
    [dispatch]
  );

  const register = useCallback(
    async (payload) => {
      const action = await dispatch(registerUser(payload));
      return action.meta.requestStatus === 'rejected' ? { error: action.payload } : { data: action.payload };
    },
    [dispatch]
  );

  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: status === 'loading',
    error,
    bootstrapped,
    login,
    register,
    logout,
  };
}
