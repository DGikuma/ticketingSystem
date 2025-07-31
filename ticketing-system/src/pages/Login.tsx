import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AnimatedBackground from '@/components/AnimatedBackground';

import TicketFlyawayLoader from '../components/TicketFlyawayLoader';

interface DecodedUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'support-agent' | 'user';
  exp: number;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoader, setShowLoader] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const nav = useNavigate();

  // Theme load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const useDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(useDark);
    document.documentElement.classList.toggle('dark', useDark);
  }, []);

  // Initial loader on visit
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(false);
    }, 3500);
    return () => clearTimeout(timeout);
  }, []);

  // Auto-login if valid token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedUser>(token);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          redirectByRole(decoded.role);
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const redirectByRole = (role: string) => {
    if (role === 'admin') nav('/admin');
    else if (role === 'agent') nav('/support');
    else nav('/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!password.trim()) {
      toast.error('Password is required');
      return;
    }

    setShowLoader(true);
    try {
      const res = await fetch('\/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        toast.success('Login successful!');
        const decoded = jwtDecode<DecodedUser>(data.token);
        redirectByRole(decoded.role);
      } else {
        toast.error(data.error || 'Invalid credentials');
        setShowLoader(false);
      }
    } catch (err) {
      toast.error('Network error. Please try again later.');
      setShowLoader(false);
    }
  };

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  if (showLoader) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-black flex items-center justify-center">
        <TicketFlyawayLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      <AnimatedBackground theme={isDark ? 'dark' : 'light'} />
      {/* Theme Toggle Switch */}
      <div className="absolute top-4 right-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isDark}
            onChange={toggleDarkMode}
            className="sr-only peer"
          />

          {/* Track */}
          <div className="w-14 h-8 bg-gray-300 dark:bg-gray-700 rounded-full peer-checked:bg-blue-600 transition-colors duration-300" />

          {/* Sliding Thumb with Icon */}
          <span
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center 
                      transition-transform duration-300 transform peer-checked:translate-x-6"
          >
            {isDark ? (
              <MoonIcon className="w-4 h-4 text-blue-600 transition duration-300" />
            ) : (
              <SunIcon className="w-4 h-4 text-yellow-500 transition duration-300" />
            )}
          </span>
        </label>
      </div>
      {/* Login Card */}
      <div className="max-w-xl w-full space-y-10 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-12 border dark:border-gray-800 relative z-10">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 px-5 py-3 w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 px-5 py-3 w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Forgot your password?{' '}
              <a href="/request-reset" className="font-medium text-blue-600 hover:underline">
               Reset Here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
