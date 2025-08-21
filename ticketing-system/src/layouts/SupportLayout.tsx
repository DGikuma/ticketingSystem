import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Bell,
  LogOut,
  Moon,
  Sun,
  UserCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop collapse
  const [mobileCollapsed, setMobileCollapsed] = useState(true); // Mobile mini sidebar by default
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile open/close
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        toast.custom(() => (
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* DESKTOP SIDEBAR */}
      <aside
        onMouseEnter={() => sidebarCollapsed && setSidebarCollapsed(false)}
        onMouseLeave={() => !sidebarCollapsed && setSidebarCollapsed(true)}
        className={`hidden md:flex fixed inset-y-0 left-0 z-40 transition-all bg-white dark:bg-gray-800 shadow-md
        ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="p-4 space-y-6">
          {!sidebarCollapsed && <h2 className="text-2xl font-bold">Support Panel</h2>}
          <nav className="space-y-2">
            <SidebarLink
              icon={<LayoutDashboard />}
              label="Dashboard"
              href="/support"
              colorClass="text-blue-600"
              collapsed={sidebarCollapsed}
            />
            <SidebarLink
              icon={<Ticket />}
              label="Assigned Tickets"
              href="/support/tickets"
              colorClass="text-green-500"
              collapsed={sidebarCollapsed}
            />
            <SidebarLink
              icon={<Bell />}
              label="Notifications"
              href="/support/notifications"
              badge={unreadCount}
              colorClass="text-red-500"
              collapsed={sidebarCollapsed}
            />
          </nav>

          {/* Desktop collapse button with hover label */}
          <motion.div
            className="relative mt-6 flex items-center justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </motion.button>

            <AnimatePresence>
              {sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-12 top-0 h-10 flex items-center bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 rounded-lg shadow-lg whitespace-nowrap"
                >
                  Expand Sidebar
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-lg z-50 p-4 md:hidden"
            style={{ width: mobileCollapsed ? 80 : 250 }}
          >
            <div className="flex justify-between items-center mb-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all"
                title="Close Sidebar"
              >
                Close
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileCollapsed(!mobileCollapsed)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
                title={mobileCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {mobileCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </motion.button>
            </div>

            <nav className="space-y-2">
              <SidebarLink
                icon={<LayoutDashboard />}
                label="Dashboard"
                href="/support"
                colorClass="text-blue-600"
                collapsed={mobileCollapsed}
              />
              <SidebarLink
                icon={<Ticket />}
                label="Assigned Tickets"
                href="/support/tickets"
                colorClass="text-green-500"
                collapsed={mobileCollapsed}
              />
              <SidebarLink
                icon={<Bell />}
                label="Notifications"
                href="/support/notifications"
                badge={unreadCount}
                colorClass="text-red-500"
                collapsed={mobileCollapsed}
              />
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className={`flex-1 transition-all ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} p-6 relative w-full`}>
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <h1 className="text-xl font-bold">Support Dashboard</h1>

          <div className="flex items-center gap-4 relative">
            {/* Dark mode toggle */}
            <div
              className="w-14 h-7 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full px-1 cursor-pointer transition-colors duration-300"
              onClick={() => setDarkMode(!darkMode)}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                initial={false}
                animate={{ x: darkMode ? 28 : 0 }}
              >
                {darkMode ? <Moon size={14} className="text-gray-800" /> : <Sun size={14} className="text-yellow-500" />}
              </motion.div>
            </div>

            {/* Fullscreen toggle button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-lg hover:shadow-xl transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </motion.button>

            {/* User dropdown */}
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
                  <div className="px-4 py-2 text-sm border-b dark:border-gray-700">{user?.email}</div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
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

        {/* Logout Confirmation Modal */}
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
  badge,
  colorClass,
  collapsed
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
  colorClass?: string;
  collapsed?: boolean;
}) {
  return (
    <motion.a
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      href={href}
      className={`flex items-center px-4 py-2 rounded transition-all relative ${
        active
          ? 'bg-blue-200 dark:bg-blue-900 font-semibold'
          : 'hover:bg-blue-100 dark:hover:bg-blue-900'
      }`}
      data-tooltip-id={label}
      data-tooltip-content={label}
    >
      <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : ''}`}>
        <div className={colorClass}>{icon}</div>
        {!collapsed && <span>{label}</span>}
      </div>
      {badge && badge > 0 && (
        <span className="absolute right-3 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
      {collapsed && <Tooltip id={label} place="right" />}
    </motion.a>
  );
}
