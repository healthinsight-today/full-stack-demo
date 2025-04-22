import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Button } from '../ui/Button';
import './AuthButtons.css';

export const AuthButtons: React.FC = () => {
  const { isAuthenticated, logout } = useUser();
  
  if (isAuthenticated) {
    return (
      <div className="auth-buttons">
        <Link to="/dashboard" className="dashboard-link">
          <Button variant="outline">Dashboard</Button>
        </Link>
        <Button variant="primary" onClick={logout}>
          Logout
        </Button>
      </div>
    );
  }
  
  return (
    <div className="auth-buttons">
      <Link to="/login">
        <Button variant="outline">Login</Button>
      </Link>
      <Link to="/signup">
        <Button variant="primary">Try Free</Button>
      </Link>
    </div>
  );
}; 