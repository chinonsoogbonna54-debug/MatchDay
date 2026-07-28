import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleReset = async () => {
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/reset-password', {
        token,
        new_password: newPassword
      });
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
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
          <div style={{ fontSize: '52px', marginBottom: '8px' }}>🔐</div>
          <h1 className="bebas gold-text" style={{ fontSize: '42px', letterSpacing: '4px' }}>
            RESET PASSWORD
          </h1>
        </div>

        <div className="gold-card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>
            Create New Password
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '28px' }}>
            Enter your new password below
          </p>

          {error && <div className="error-msg" style={{ marginBottom: '16px' }}>{error}</div>}
          {success && <div className="success-msg" style={{ marginBottom: '16px' }}>{success}</div>}

          {!token ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#ef4444', marginBottom: '16px' }}>Invalid or missing reset token</p>
              <Link to="/login" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '700' }}>
                Back to Login →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  New Password
                </label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Confirm Password
                </label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                />
              </div>

              <button
                className="btn-gold"
                onClick={handleReset}
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
                    Resetting...
                  </span>
                ) : '🔐 Reset Password'}
              </button>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '700' }}>
                  Sign In →
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}