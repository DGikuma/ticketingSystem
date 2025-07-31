import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <header className="p-4 shadow bg-white dark:bg-gray-900 dark:border-b dark:border-gray-700">
        <h1 className="text-2xl font-semibold">Ticketing System</h1>
      </header>

      <main className="container mx-auto p-6">{children}</main>

      <footer className="mt-8 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Ticketing System. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
