import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Moon,
  Sun,
  UserCircle,
  LogOut,
  Menu,
  X,
  Expand,
  Minimize
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip";

export default function UserLayout() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // works for desktop and mobile
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const nav = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect mobile screen resize
  useEffect(() => {
    if (!token) return nav("/");

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.clear();
    nav("/");
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

  // Auto-collapse on mobile whenever drawer opens
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobileMenuOpen, isMobile]);

  const collapsed = sidebarCollapsed && !sidebarHovered;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        toastClassName={({ type }) =>
          `relative overflow-hidden p-4 rounded-md shadow-md font-medium text-sm
          ${
            type === "success"
              ? "bg-green-600 text-white"
              : type === "error"
              ? "bg-red-600 text-white"
              : type === "info"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-white"
          }`
        }
        bodyClassName="relative z-10"
        progressClassName="animate-toast-fill"
      />

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || !isMobile) && (
          <motion.aside
            initial={{ x: isMobile ? "-100%" : 0 }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? "-100%" : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 shadow-md
              transition-all duration-300
              ${collapsed ? "w-20" : "w-64"}
            `}
            onMouseEnter={() => !isMobile && setSidebarHovered(true)}
            onMouseLeave={() => !isMobile && setSidebarHovered(false)}
          >
            {/* Sidebar header */}
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              {!collapsed && <h2 className="text-xl font-bold">User Panel</h2>}
              <button
                onClick={() => {
                  if (isMobile) setIsMobileMenuOpen(false);
                  else setSidebarCollapsed((prev) => !prev);
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {isMobile ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Links */}
            <nav className="mt-6 space-y-2">
              <SidebarLink
                icon={<LayoutDashboard />}
                label="Dashboard"
                href="/dashboard"
                active={location.pathname === "/dashboard"}
                collapsed={collapsed}
              />
              <SidebarLink
                icon={<Ticket className="text-green-500" />}
                label="New Ticket"
                href="/dashboard/submit-concern"
                active={location.pathname === "/dashboard/submit-concern"}
                collapsed={collapsed}
              />
              <SidebarLink
                icon={<Ticket className="text-red-500" />}
                label="My Tickets"
                href="/dashboard/tickets"
                active={location.pathname === "/dashboard/tickets"}
                collapsed={collapsed}
              />
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300
          ${!isMobile ? (collapsed ? "ml-20" : "ml-64") : "ml-0"}
          p-6 relative w-full`}
      >
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-xl font-bold">User Dashboard</h1>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              data-tooltip-id="fullscreen"
              data-tooltip-content={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Expand size={18} />}
            </button>
            <Tooltip id="fullscreen" place="bottom" />

            {/* Theme toggle */}
            <div
              className="w-14 h-7 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full px-1 cursor-pointer transition-colors duration-300"
              onClick={() => setDarkMode(!darkMode)}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
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

            {/* Profile dropdown */}
            <button onClick={() => setShowDropdown((prev) => !prev)}>
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
  collapsed
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <motion.a
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      href={href}
      className={`flex items-center px-4 py-2 rounded transition-all ${
        active
          ? "bg-blue-200 dark:bg-blue-900 font-semibold"
          : "hover:bg-blue-100 dark:hover:bg-blue-900"
      }`}
      data-tooltip-id={label}
      data-tooltip-content={label}
    >
      <div className="flex items-center gap-3">
        <div>{icon}</div>
        {!collapsed && <span>{label}</span>}
      </div>
      {collapsed && <Tooltip id={label} place="right" />}
    </motion.a>
  );
}
