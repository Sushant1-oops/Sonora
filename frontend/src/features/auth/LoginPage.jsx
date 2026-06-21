import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await login(form);
    if (!result.error) {
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1.5">Welcome back</h1>
      <p className="text-text-secondary text-[0.88rem] mb-6">Log in to keep listening.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {error && <p className="text-danger text-[0.82rem]">{error}</p>}

        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Logging in…' : 'Log In'}
        </Button>
      </form>

      <p className="mt-5 text-[0.85rem] text-text-secondary text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent font-semibold">
          Sign up
        </Link>
      </p>
    </>
  );
}
