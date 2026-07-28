import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <div className="navbar-logo">⚽ MatchDay</div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/dashboard" style={{
          color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
          fontSize: '14px', fontWeight: '600', transition: 'color 0.2s'
        }}
          onMouseOver={e => e.target.style.color = '#FFD700'}
          onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
        >
          Matches
        </Link>

        <Link to="/my-tickets" style={{
          color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
          fontSize: '14px', fontWeight: '600', transition: 'color 0.2s'
        }}
          onMouseOver={e => e.target.style.color = '#FFD700'}
          onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
        >
          My Tickets
        </Link>

        <Link to="/my-clubs" style={{
          color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
          fontSize: '14px', fontWeight: '600', transition: 'color 0.2s'
        }}
          onMouseOver={e => e.target.style.color = '#FFD700'}
          onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
        >
          My Clubs
        </Link>

        <div style={{
          background: 'rgba(255,215,0,0.1)',
          border: '1px solid rgba(255,215,0,0.3)',
          borderRadius: '20px', padding: '5px 14px',
          fontSize: '13px', color: '#FFD700', fontWeight: '600'
        }}>
          🎟️ {user?.firstname}
        </div>

        <button onClick={handleLogout} style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px', padding: '7px 14px',
          color: '#ef4444', cursor: 'pointer',
          fontSize: '13px', fontWeight: '700'
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
}