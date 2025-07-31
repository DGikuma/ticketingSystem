import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserFromToken } from './auth';

interface Props {
  children: JSX.Element;
  roles?: string[]; // e.g. ['admin'], ['agent', 'admin'], etc.
}

const ProtectedRoute = ({ children, roles }: Props) => {
  const user = getUserFromToken();
  if (!user) return <Navigate to="/" />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />; // Redirect if role not permitted
  }

  return children;
};

export default ProtectedRoute;
