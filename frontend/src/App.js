import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Rankings from './pages/Rankings';
import History from './pages/History';
import AuthGuard from './components/AuthGuard';
import { AuthProvider } from './contexts/AuthContext';

import './index.css';

// Создаем клиент для React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 минут
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800">
            <Header />
            
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Публичные страницы */}
                <Route path="/login" element={<Navigate to="/" replace />} />
                
                {/* Защищенные страницы */}
                <Route path="/" element={
                  <AuthGuard>
                    <Home />
                  </AuthGuard>
                } />
                
                <Route path="/profile" element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                } />
                
                <Route path="/rankings" element={
                  <AuthGuard>
                    <Rankings />
                  </AuthGuard>
                } />
                
                <Route path="/history" element={
                  <AuthGuard>
                    <History />
                  </AuthGuard>
                } />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            {/* Toast уведомления */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(75, 0, 128, 0.9)',
                  color: 'white',
                  border: '1px solid rgba(186, 85, 211, 0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 