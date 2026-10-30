import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/70">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
            <img src="/logo.svg" alt="" className="h-8 w-8 flex-none rounded-lg" />
            <span className="truncate text-base font-semibold tracking-tight sm:text-lg">Expenso</span>
          </Link>

          <div className="flex flex-none items-center gap-2 sm:gap-3">
            <div className="hidden flex-col items-end leading-tight md:flex">
              <span className="text-sm font-medium">{user?.fullName}</span>
              <span className="text-xs text-gray-500 dark:text-white/40">{user?.email}</span>
            </div>

            <ThemeToggle />

            <Link
              to="/monthly"
              aria-label="Monthly report"
              title="Monthly report"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50
                dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
              </svg>
            </Link>

            <Link
              to="/settings"
              aria-label="Settings"
              title="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50
                dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-accent dark:text-black">
              {initials}
            </div>

            <button
              onClick={handleLogout}
              aria-label="Logout"
              className="btn-ghost !px-2.5 !py-1.5 hover:!border-red-200 hover:!text-red-600 dark:hover:!text-red-400 sm:!px-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
