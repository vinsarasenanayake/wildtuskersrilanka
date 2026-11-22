/**
 * @file RouteGuards.jsx
 * @description Higher-order route guards for role-based access control.
 * Restricts administrative pages to authenticated admins, and visitor submission forms to public users.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth';

function Checking() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans text-[#888888] pt-[80px]">
      Checking access…
    </div>
  );
}

/** Only the WTS admin may open this page; everyone else goes to the login page. */
export function RequireAdmin({ children }) {
  const { isAdmin, authLoading } = useAuth();
  if (authLoading) return <Checking />;
  if (!isAdmin) return <Navigate to="/login" replace />;
  return children;
}

/** Visitor-only page (e.g. submitting a field note). The admin reviews instead. */
export function VisitorOnly({ children, adminTo = '/admin' }) {
  const { isAdmin, authLoading } = useAuth();
  if (authLoading) return <Checking />;
  if (isAdmin) return <Navigate to={adminTo} replace />;
  return children;
}
