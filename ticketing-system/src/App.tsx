import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RequestReset from "./pages/RequestReset";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAgents from "./pages/AdminAgents";
import AdminTickets from "./pages/AdminTickets";
import Reports from "./pages/Reports";
import AdminNotifications from "./pages/AdminNotifications";
import SupportDashboard from "./pages/SupportDashboard";
import SupportTickets from "./pages/SupportTickets";
import SupportNotifications from "./pages/SupportNotifications";
import SubmitConcern from "./pages/SubmitConcern";
import ProtectedRoute from "./utils/ProtectedRoute";
import Layout from "./components/Layout";
import AdminLayout from "./layouts/AdminLayout";
import SupportLayout from "./layouts/SupportLayout";
import UserTickets from "./pages/UserTickets";
import UserLayout from "./layouts/UserLayout";
import UserManagement from "./pages/UserManagement";

function App() {
  return (
    <>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/request-reset" element={<Layout><RequestReset /></Layout>} />
        <Route path="/reset-password/:token" element={<Layout><ResetPassword /></Layout>} />

        {/* Authenticated User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="submit-concern" element={<SubmitConcern />} />
          <Route path="tickets" element={<UserTickets />} />

        </Route>

        {/* Support Agent Routes */}
        <Route
          path="/support"
          element={
            <ProtectedRoute roles={["agent"]}>
              <SupportLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SupportDashboard />} />
          <Route path="tickets" element={<SupportTickets />} />
          <Route path="notifications" element={<SupportNotifications />} />
        </Route>

        {/* Admin Routes */}
<Route
  path="/admin"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  {/* This handles /admin */}
  <Route index element={<AdminDashboard />} />

  {/* These handle subpages like /admin/agents, etc */}
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="agents" element={<AdminAgents />} />
  <Route path="tickets" element={<AdminTickets />} />
  <Route path="reports" element={<Reports />} />
  <Route path="notifications" element={<AdminNotifications />} />
  <Route path="user-management" element={<UserManagement />} />
</Route>

      </Routes>

    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={true} // ❌ Hides default bar
      closeOnClick
      pauseOnHover
      draggable
      toastClassName={({ type }) =>
        `relative overflow-hidden p-4 rounded-md shadow-md font-medium text-sm
        ${
          type === 'success'
            ? 'bg-green-600 text-white'
            : type === 'error'
            ? 'bg-red-600 text-white'
            : type === 'info'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-white'
        }`
      }
      bodyClassName="relative z-10" 
      progressClassName="animate-toast-fill" 
    />

    </>
  );
}

export default App;
