import { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, Bell, LogOut, Moon, Sun, UserCircle, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';

const socket = io('http://localhost:4000', { autoConnect: false });

export default function SupportLayout() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // ✅ NEW

  const nav = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) return nav('/');
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      socket.auth = { token };
      socket.connect();

      socket.on('notification', (data) => {
        setUnreadCount((prev) => prev + 1);
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-900 shadow-lg rounded-lg px-4 py-2 border dark:border-gray-700"
          >
            🔔 {data.message || 'New notification received'}
          </motion.div>
        ));
      });

      return () => {
        socket.disconnect();
        socket.off('notification');
      };
    }
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return nav('/');
      }
      const data = await res.json();
      setUnreadCount(data.unread);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    nav('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-md transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 space-y-6">
          <h2 className="text-2xl font-bold">Support Panel</h2>
          <nav className="space-y-2">
            <SidebarLink icon={<LayoutDashboard />} label="Dashboard" href="/support" colorClass="text-blue-600"/>
            <SidebarLink icon={<Ticket />} label="Assigned Tickets" href="/support/tickets" colorClass="text-green-500"/>
            <SidebarLink icon={<Bell />} label="Notifications" href="/support/notifications" badge={unreadCount}  colorClass="text-red-500"/>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 relative w-full">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            <Menu />
          </button>

          <h1 className="text-xl font-bold">Support Dashboard</h1>

          <div className="flex items-center gap-4 relative">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setShowDropdown(prev => !prev)}>
              <UserCircle size={28} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-800 rounded shadow-lg z-50"
                >
                  <div className="px-4 py-2 text-sm border-b dark:border-gray-700">
                    {user?.email}
                  </div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)} // ✅ trigger confirm
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Outlet />

        {/* ✅ Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80"
              >
                <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
                <p className="text-sm mb-6">Are you sure you want to log out?</p>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarLink({
  icon,
  label,
  href,
  active,
  colorClass
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  colorClass?: string;
}) {
  return (
    <motion.a
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      href={href}
      className={`flex items-center justify-between px-4 py-2 rounded transition-all ${
        active
          ? 'bg-blue-200 dark:bg-blue-900 font-semibold'
          : 'hover:bg-blue-100 dark:hover:bg-blue-900'
      }`}
      data-tooltip-id={label}
      data-tooltip-content={label}
    >
      <div className="flex items-center gap-2">
        <div className={colorClass}>{icon}</div>
        <span>{label}</span>
      </div>
      <Tooltip id={label} place="right" />
    </motion.a>
  );
}

