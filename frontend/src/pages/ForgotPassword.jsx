import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Email is required');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSuccess('If this email exists you will receive a reset link shortly!');
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
      padding: '20px', position: 'relative'
    }}>

      <video className="video-bg" autoPlay muted loop playsInline>
       <source src="/videos/football.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <div className="fade-in" style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '52px', marginBottom: '8px' }}>📧</div>
          <h1 className="bebas gold-text" style={{ fontSize: '42px', letterSpacing: '4px' }}>
            FORGOT PASSWORD
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', letterSpacing: '2px' }}>
            We'll send you a reset link
          </p>
        </div>

        <div className="gold-card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>
            Reset Your Password
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '28px' }}>
            Enter your email address and we'll send you a link to reset your password
          </p>

          {error && <div className="error-msg" style={{ marginBottom: '16px' }}>{error}</div>}
          {success && <div className="success-msg" style={{ marginBottom: '16px' }}>{success}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                fontSize: '12px', fontWeight: '700',
                color: 'rgba(255,255,255,0.5)', marginBottom: '8px',
                display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                Email Address
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <button
              className="btn-gold"
              onClick={handleSubmit}
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
                  Sending...
                </span>
              ) : '📧 Send Reset Link'}
            </button>

            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '700' }}>
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}