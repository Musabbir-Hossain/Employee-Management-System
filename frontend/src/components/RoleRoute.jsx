import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// UI-level gate only. The API enforces the same rule; this just stops users
// from landing on pages that would only show them 403 errors.
export default function RoleRoute({ role, children }) {
  const user = useSelector((state) => state.auth.user);
  if (user?.role !== role) return <Navigate to="/app" replace />;
  return children;
}
