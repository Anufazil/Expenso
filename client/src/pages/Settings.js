import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const CONFIRM_WORD = 'DELETE';

const Settings = () => {
  const { user, deleteAccount } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const openModal = () => {
    setPassword('');
    setConfirmText('');
    setError('');
    setModalOpen(true);
  };
  const closeModal = () => !deleting && setModalOpen(false);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && !deleting && setModalOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen, deleting]);

  const canDelete = password.length > 0 && confirmText === CONFIRM_WORD && !deleting;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!canDelete) return;
    setDeleting(true);
    setError('');
    const result = await deleteAccount(password);
    if (result.success) {
      navigate('/login', { replace: true, state: { accountDeleted: true } });
    } else {
      setError(result.message);
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-2xl space-y-4 px-3 py-6 sm:space-y-6 sm:px-6 sm:py-8">
        <div>
          <Link to="/dashboard" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        {/* Profile */}
        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Account</h2>
          <dl className="divide-y divide-gray-100 dark:divide-white/10">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-gray-500 dark:text-white/50">Full name</dt>
              <dd className="min-w-0 break-words text-right text-sm font-medium">{user?.fullName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-gray-500 dark:text-white/50">Email</dt>
              <dd className="min-w-0 break-all text-right text-sm font-medium">{user?.email}</dd>
            </div>
          </dl>
        </section>

        {/* Appearance */}
        <section className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Appearance</h2>
          <p className="mb-4 mt-1 text-sm text-gray-500 dark:text-white/50">
            Choose a theme, or follow your device setting automatically.
          </p>
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 p-1 dark:bg-white/10" role="group" aria-label="Theme">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                aria-pressed={theme === t.value}
                onClick={() => setTheme(t.value)}
                className={`rounded-xl py-2 text-sm font-medium transition ${
                  theme === t.value
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-white dark:text-black'
                    : 'text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded-[28px] border border-red-200 bg-red-50/60 p-5 dark:border-red-500/30 dark:bg-red-500/5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-red-700 dark:text-red-400">Danger zone</h2>
          <p className="mb-4 mt-1 text-sm text-gray-600 dark:text-white/60">
            Deleting your account permanently removes your profile and every transaction. This cannot be undone.
          </p>
          <button onClick={openModal} className="btn-danger w-full sm:w-auto">Delete account</button>
        </section>
      </main>

      {/* Delete confirmation */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-label="Delete account"
        >
          <form
            onSubmit={handleDelete}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] border border-gray-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-neutral-950 sm:max-w-md sm:rounded-[28px] sm:p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold tracking-tight">Delete your account?</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-white/60">
              This permanently deletes <span className="font-medium">{user?.email}</span> and all of its transactions.
            </p>

            {error && <div className="alert-error mt-4">{error}</div>}

            <div className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="del-password">Confirm your password</label>
                <PasswordInput id="del-password" autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoFocus />
              </div>
              <div>
                <label className="label" htmlFor="del-confirm">
                  Type <span className="font-mono font-semibold">{CONFIRM_WORD}</span> to confirm
                </label>
                <input id="del-confirm" type="text" autoComplete="off" value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)} placeholder={CONFIRM_WORD} className="input" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button type="button" onClick={closeModal} disabled={deleting} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={!canDelete} className="btn-danger">
                {deleting ? 'Deleting...' : 'Delete forever'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
