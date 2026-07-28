import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Login() {
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
      const res = await API.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>

      {/* Background Video */}
      <video className="video-bg" autoPlay muted loop playsInline>
  <source src="/videos/football.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      {/* Floating orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>⚽</div>
          <h1 className="bebas gold-text" style={{ fontSize: '52px', letterSpacing: '6px' }}>
            MATCHDAY
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Your Stadium. Your Seat. Your Moment.
          </p>
        </div>

        {/* Card */}
        <div className="gold-card" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '32px' }}>
            Sign in to your fan account
          </p>

          {error && <div className="error-msg" style={{ marginBottom: '20px' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email Address
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="your@email.com"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <Link to="/forgot-password" style={{ color: '#FFD700', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
                Forgot password?
              </Link>
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
                  Signing In...
                </span>
              ) : 'Sign In ⚽'}
            </button>
          </div>

          <div style={{
            marginTop: '28px', paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '700' }}>
                Join MatchDay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}