import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';
  const accountDeleted = location.state?.accountDeleted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) navigate(from, { replace: true });
    else setError(result.message);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/30" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-pink-500/15 blur-3xl dark:bg-pink-500/25" />
      <ThemeToggle className="absolute right-4 top-4" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <img src="/logo.svg" alt="Expenso" className="mx-auto mb-3 h-14 w-14 rounded-2xl" />
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Log in to manage your expenses</p>
        </div>

        <div className="card p-5 sm:p-6">
          {accountDeleted && <div className="alert-ok mb-4">Your account and all its data have been deleted.</div>}
          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <PasswordInput id="password" required autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-white/50">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:underline dark:text-accent">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
