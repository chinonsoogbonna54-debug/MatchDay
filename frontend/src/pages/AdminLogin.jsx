import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/admin/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', background: '#000'
    }}>

      {/* Background Video */}
      <video className="video-bg" autoPlay muted loop playsInline>
       <source src="/videos/football.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <div className="fade-in" style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛡️</div>
          <h1 className="bebas gold-text" style={{ fontSize: '42px', letterSpacing: '5px' }}>
            ADMIN PANEL
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            MatchDay Management
          </p>
        </div>

        <div className="gold-card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>
            Admin Access
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '28px' }}>
            Restricted area — authorized personnel only
          </p>

          {error && <div className="error-msg" style={{ marginBottom: '20px' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="admin@matchday.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button
              className="btn-gold"
              onClick={handleLogin}
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(0,0,0,0.3)',
                    borderTopColor: '#000',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block'
                  }} />
                  Authenticating...
                </span>
              ) : '🛡️ Access Admin Panel'}
            </button>
          </div>
        </div>

       <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
  Are you a fan?{' '}
  <a href="/login" style={{ color: '#FFD700', textDecoration: 'none' }}>Fan login →</a>
  {' | '}
  <a href="/admin/signup" style={{ color: '#FFD700', textDecoration: 'none' }}>Register admin →</a>
    </p>
      </div>
    </div>
  );
}