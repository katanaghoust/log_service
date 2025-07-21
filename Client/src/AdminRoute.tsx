import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

type Props = {
  children: ReactNode;
};

const AdminRoute: React.FC<Props> = ({ children }) => {
  const { token, user } = useAuth();

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
