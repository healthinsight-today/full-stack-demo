import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRouter';
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { ReportsProvider } from './context/ReportsContext';

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <UserProvider>
          <ReportsProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </ReportsProvider>
        </UserProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App; 