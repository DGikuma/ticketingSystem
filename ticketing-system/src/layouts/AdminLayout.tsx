import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, Ticket, Bell, Lock, Sun, Moon, UserCircle, Menu, FileText, Maximize2, Minimize2, ChevronsLeft, ChevronsRight
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

const dummyNotification = {
  message: '🟢 New ticket assigned to you! Click to view.',
  type: 'success',
};

const notificationTypeStyles = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export default function AdminLayout() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileCollapsed, setMobileCollapsed] = useState(true); // Mobile-specific collapsed state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverExpand, setHoverExpand] = useState(false);

  const nav = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return nav('/');
    fetchUnreadCount();
    fetchNotifications();

    setNotifications(prev => [dummyNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    const interval = setInterval(fetchUnreadCount, 15000);

    socket.on('new_notification', (data) => {
      toast.custom(() => (
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
    } catch {
      console.warn('Notification fetch error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/', { replace: true });
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

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* DESKTOP SIDEBAR */}
      <aside
        onMouseEnter={() => sidebarCollapsed && setHoverExpand(true)}
        onMouseLeave={() => sidebarCollapsed && setHoverExpand(false)}
        className={clsx(
          "hidden md:flex flex-col p-4 bg-white dark:bg-gray-800 shadow-md fixed inset-y-0 left-0 z-40 transition-all duration-300",
          (sidebarCollapsed && !hoverExpand) ? "w-20" : "w-64"
        )}
      >
        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className={clsx(
            "mb-6 p-2 rounded-xl shadow hover:scale-105 transition-transform duration-200",
            sidebarCollapsed
              ? "bg-gradient-to-r from-indigo-400 to-purple-500 text-white"
              : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
            "dark:from-indigo-600 dark:to-purple-700"
          )}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>

        <SidebarContent
          unreadCount={unreadCount}
          currentPath={location.pathname}
          collapsed={sidebarCollapsed && !hoverExpand}
        />
      </aside>

      {/* MOBILE MINI SIDEBAR */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              "fixed inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-lg z-50 p-4 md:hidden transition-all duration-300",
              mobileCollapsed ? "w-20" : "w-64"
            )}
            onMouseEnter={() => setMobileCollapsed(false)}
            onMouseLeave={() => setMobileCollapsed(true)}
          >
            <button
              onClick={() => setShowMobileMenu(false)}
              className="mb-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Close
            </button>

            <SidebarContent
              unreadCount={unreadCount}
              currentPath={location.pathname}
              collapsed={mobileCollapsed}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className={clsx("flex-1 p-6 transition-all", (sidebarCollapsed && !hoverExpand) ? "md:ml-20" : "md:ml-64")}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setShowMobileMenu(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-3" ref={dropdownRef}>
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className={clsx(
                "p-2 rounded-lg shadow hover:scale-105 transition-transform",
                "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-900",
                "dark:from-slate-600 dark:to-slate-800 dark:text-white"
              )}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Dark Mode Toggle */}
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
                {darkMode ? (
                  <Moon size={14} className="text-gray-800" />
                ) : (
                  <Sun size={14} className="text-yellow-500" />
                )}
              </motion.div>
            </div>

            {/* Notification Dropdown */}
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

            {/* User Dropdown */}
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
                    <div className="px-4 py-2 text-sm border-b dark:border-gray-700">
                      {user?.email}
                    </div>
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

        {/* Logout Confirm Modal */}
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

function SidebarContent({ unreadCount, currentPath, collapsed }: { unreadCount: number; currentPath: string; collapsed?: boolean }) {
  return (
    <>
      {!collapsed && <h2 className="text-2xl font-bold tracking-tight mb-4">Admin Panel</h2>}
      <nav className="space-y-2">
        <SidebarLink icon={<LayoutDashboard className="text-indigo-500" />} label="Dashboard" href="/admin/dashboard" currentPath={currentPath} collapsed={collapsed} />
        <SidebarLink icon={<Users className="text-green-500" />} label="Agent Management" href="/admin/agents" currentPath={currentPath} collapsed={collapsed} />
        <SidebarLink icon={<UserCircle className="text-blue-500" />} label="User Management" href="/admin/user-management" currentPath={currentPath} collapsed={collapsed} />
        <SidebarLink icon={<Ticket className="text-yellow-500" />} label="Tickets" href="/admin/tickets" currentPath={currentPath} collapsed={collapsed} />
        <SidebarLink icon={<Bell className="text-red-500" />} label="Notifications" href="/admin/notifications" currentPath={currentPath} badge={unreadCount} collapsed={collapsed} />
        <SidebarLink icon={<FileText className="text-blue-500" />} label="Report" href="/admin/reports" currentPath={currentPath} collapsed={collapsed} />
      </nav>
    </>
  );
}

function SidebarLink({ icon, label, href, badge = 0, currentPath, collapsed }: any) {
  const isActive = currentPath === href || (href.includes('/:') && currentPath.startsWith(href.split('/:')[0]));

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={href}
            className={clsx(
              "group flex items-center justify-between px-4 py-2 rounded-xl transition duration-300 ease-in-out hover:shadow-md hover:scale-[1.02]",
              isActive
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
                : "bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-500/20 dark:hover:from-blue-400/10 dark:hover:to-blue-400/20"
            )}
          >
            <div className="flex items-center gap-3">
              {icon}
              {!collapsed && <span>{label}</span>}
            </div>
            {!collapsed && badge > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                {badge}
              </span>
            )}
          </a>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent
            side="right"
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg rounded-lg px-3 py-1 text-sm"
          >
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
