import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '', displayName: '' });
  const [localError, setLocalError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    const result = await register(form);
    if (!result.error) {
      navigate('/login', { replace: true });
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1.5">Create your account</h1>
      <p className="text-text-secondary text-[0.88rem] mb-6">Start building your own sound.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="displayName"
          label="Display name"
          placeholder="Sushant"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          required
        />
        <Input
          id="username"
          label="Username"
          placeholder="sushant135"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
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
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {(localError || error) && <p className="text-danger text-[0.82rem]">{localError || error}</p>}

        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Creating account…' : 'Sign Up'}
        </Button>
      </form>

      <p className="mt-5 text-[0.85rem] text-text-secondary text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-accent font-semibold">
          Log in
        </Link>
      </p>
    </>
  );
}
