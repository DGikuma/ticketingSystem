import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, Ticket, Bell, LogOut, Lock, Sun, Moon, UserCircle, Menu, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import socket from '@/utils/socket';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

// Dummy admin notification for dashboard display
const dummyNotification = {
  message: '🟢 New ticket assigned to you! Click to view.',
  type: 'success',
};

// Add colorful notification styling
const notificationTypeStyles = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

// Usage inside notification rendering block:
// <div className={`px-4 py-2 text-sm border-b last:border-none ${notificationTypeStyles[n.type || 'info']}`}>{n.message}</div>

// Tooltip-enhanced notification bell with adaptive color
const NotificationBell = ({ unreadCount, onClick }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="relative text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>Notifications</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function AdminLayout() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const nav = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!token) return nav('/');
  fetchUnreadCount();
  fetchNotifications();

  // Add dummy notification for testing
  setNotifications(prev => [dummyNotification, ...prev]);
  setUnreadCount(prev => prev + 1); // optional

  const interval = setInterval(fetchUnreadCount, 15000);

  socket.on('new_notification', (data) => {
    toast.custom(t => (
      <div className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg">
        🔔 {data.message || 'You have a new notification'}
      </div>
    ));
    setUnreadCount(prev => prev + 1);
    setNotifications(prev => [data, ...prev]);
  });

  return () => {
    clearInterval(interval);
    socket.off('new_notification');
  };
}, []);


  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
        setShowUserDropdown(false);
      }
    };

    const closeOnNavigate = () => {
      setShowNotifDropdown(false);
      setShowUserDropdown(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('popstate', closeOnNavigate);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('popstate', closeOnNavigate);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return nav('/', { replace: true });
      }

      const data = await res.json();
      setUnreadCount(data.unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data);
      await fetch('http://localhost:4000/api/notifications/mark-read', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
    } catch (e) {
      console.warn('Notification fetch error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      <AnimatePresence>
        {showMobileMenu && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 p-4 shadow-lg"
          >
            <button onClick={() => setShowMobileMenu(false)} className="mb-4">Close</button>
            <SidebarContent unreadCount={unreadCount} currentPath={location.pathname} />
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden md:block w-64 p-4 bg-white dark:bg-gray-800 shadow-md space-y-6 fixed inset-y-0 left-0 z-40">
        <SidebarContent unreadCount={unreadCount} currentPath={location.pathname} />
      </aside>

      <main className="flex-1 md:ml-64 p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setShowMobileMenu(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold"> Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button onClick={() => {
                setShowNotifDropdown((prev) => !prev);
                if (!showNotifDropdown) fetchNotifications();
              }}>
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded shadow-xl z-50"
                  >
                    <div className="px-4 py-2 font-bold border-b">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-gray-500">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 5).map((n, i) => (
                      <div
                        key={i}
                        className={clsx(
                          'px-4 py-2 text-sm border-b last:border-none',
                          notificationTypeStyles[n.type || 'info']
                        )}
                      >
                        {n.message || 'New activity'}
                      </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button onClick={() => setShowUserDropdown((prev) => !prev)}>
                <UserCircle size={28} />
              </button>
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-800 rounded shadow-lg z-50"
                  >
                    <div className="px-4 py-2 text-sm border-b">{user?.email}</div>
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      <Lock size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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

function SidebarContent({ unreadCount, currentPath }: { unreadCount: number; currentPath: string }) {
  return (
    <>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Admin Panel</h2>
      <nav className="space-y-2">
        <SidebarLink icon={<LayoutDashboard className="text-indigo-500" />} label="Dashboard" href="/admin/dashboard" currentPath={currentPath} />
        <SidebarLink icon={<Users className="text-green-500" />} label="Agent Management" href="/admin/agents" currentPath={currentPath} />
        <SidebarLink icon={<UserCircle className="text-blue-500" />} label="User Management" href="/admin/user-management" currentPath={currentPath} />
        <SidebarLink icon={<Ticket className="text-yellow-500" />} label="Tickets" href="/admin/tickets" currentPath={currentPath} />
        <SidebarLink icon={<Bell className="text-red-500" />} label="Notifications" href="/admin/notifications" currentPath={currentPath} badge={unreadCount} />
        <SidebarLink icon={<FileText className="text-blue-500" />} label="Report" href="/admin/reports" currentPath={currentPath} />
      </nav>
    </>
  );
}

function SidebarLink({ icon, label, href, badge = 0, currentPath }: any) {
  const isActive = currentPath === href || (href.includes('/:') && currentPath.startsWith(href.split('/:')[0]));

  return (
    <a
      href={href}
      className={clsx(
        'group flex items-center justify-between px-4 py-2 rounded-xl transition duration-300 ease-in-out hover:shadow-md hover:scale-[1.02]',
        isActive
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold'
          : 'bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-500/20 dark:hover:from-blue-400/10 dark:hover:to-blue-400/20'
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse shadow-sm">
          {badge}
        </span>
      )}
    </a>
  );
}
