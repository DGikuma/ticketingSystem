import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

import AnimatedBackground from '@/components/AnimatedBackground';
import TicketFlyawayLoader from '../components/TicketFlyawayLoader';

interface DecodedUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
  exp: number;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showLoader, setShowLoader] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nav = useNavigate();

  // Theme load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const useDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(useDark);
    document.documentElement.classList.toggle('dark', useDark);
  }, []);

  // Loader on visit
  useEffect(() => {
    const timeout = setTimeout(() => setShowLoader(false), 3500);
    return () => clearTimeout(timeout);
  }, []);

  // Auto-login if token valid
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

    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the highlighted errors.');
      return;
    }

    setShowLoader(true);
    try {
      const res = await fetch('/api/auth/login', {
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
    } catch {
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (showLoader) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-black flex items-center justify-center">
        <TicketFlyawayLoader />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative py-12">
      {/* Animated Background */}
      <AnimatedBackground theme={isDark ? 'dark' : 'light'} />

      {/* Top-right controls */}
      <div className="absolute top-4 right-4 flex gap-3">
        {/* Theme toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isDark}
            onChange={toggleDarkMode}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-300 dark:bg-gray-700 rounded-full peer-checked:bg-blue-600 transition-colors duration-300" />
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

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="relative group p-1 rounded-xl 
                    bg-white/20 dark:bg-black/20 backdrop-blur-md 
                    border border-black/30 dark:border-gray-700 
                    shadow-lg hover:shadow-2xl transition-all duration-300 ease-out 
                    hover:scale-110 active:scale-95 overflow-hidden"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          <span
            className={`absolute inset-0 rounded-xl blur-xl transition-all duration-500 
              ${isDark 
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500' 
                : 'bg-gradient-to-r from-blue-700 via-teal-600 to-emerald-700'
              } 
              opacity-30 group-hover:opacity-60`}
          ></span>
          <span className="relative z-10 flex items-center justify-center">
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-red-600 drop-shadow-md transition-transform duration-500 group-hover:rotate-180" />
            ) : (
              <Maximize2 className="w-5 h-5 text-green-600 drop-shadow-md transition-transform duration-500 group-hover:rotate-180" />
            )}
          </span>
        </button>
      </div>

      {/* Login Card */}
      <div className="max-w-xl w-full space-y-6 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 border dark:border-gray-800 relative z-10">
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
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`px-3 py-2 w-full border rounded-lg shadow-sm transition-all
                            focus:outline-none focus:ring-2 
                            ${errors.email
                              ? 'border-red-500 focus:ring-red-500 pr-10'
                              : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400'}
                            dark:bg-gray-800 dark:text-white`}
                />
                {errors.email && (
                  <ExclamationCircleIcon className="absolute right-3 top-2.5 w-5 h-5 text-red-500" />
                )}
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`px-3 py-2 w-full border rounded-lg shadow-sm transition-all pr-12
                            focus:outline-none focus:ring-2 
                            ${errors.password
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400'}
                            dark:bg-gray-800 dark:text-white`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-8 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                {errors.password && (
                  <ExclamationCircleIcon className="absolute right-3 top-2.5 w-5 h-5 text-red-500" />
                )}
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-3 border border-transparent text-sm font-medium rounded-lg text-white 
                        bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
                        hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700
                        dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 
                        dark:hover:from-blue-600 dark:hover:via-indigo-600 dark:hover:to-purple-600
                        shadow-lg hover:shadow-xl transition-all duration-300"
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

        {/* Footer */}
        <footer className="mt-8 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Ticketing System. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
