import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters long.');

    setSubmitting(true);
    const result = await register(fullName, email, password);
    setSubmitting(false);

    if (result.success) navigate('/dashboard', { replace: true });
    else setError(result.message);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/30" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl dark:bg-emerald-500/20" />
      <ThemeToggle className="absolute right-4 top-4" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <img src="/logo.svg" alt="Expenso" className="mx-auto mb-3 h-14 w-14 rounded-2xl" />
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Start tracking your income and expenses</p>
        </div>

        <div className="card p-5 sm:p-6">
          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="fullName">Full Name</label>
              <input id="fullName" type="text" required autoComplete="name" value={fullName}
                onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <PasswordInput id="password" required autoComplete="new-password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="label" htmlFor="confirmPassword">Confirm Password</label>
              <PasswordInput id="confirmPassword" required autoComplete="new-password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-accent">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
