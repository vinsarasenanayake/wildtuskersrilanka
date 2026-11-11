import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Public sign-up / self-registration is disabled.
 * Admin accounts are pre-provisioned directly by the database manager.
 */
export default function SignUp() {
  return <Navigate to="/login" replace />;
}
