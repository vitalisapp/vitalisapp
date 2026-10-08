import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../../context/ThemeContext.jsx';
import { AuthProvider } from '../../hooks/useAuth.jsx';
import { NotificationProvider } from '../../context/NotificationSystem.jsx';
import { NotificationStreamProvider } from '../../context/NotificationStream.jsx';
import { queryClient } from '../../lib/queryClient.js';

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <NotificationStreamProvider>{children}</NotificationStreamProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AppProviders;
