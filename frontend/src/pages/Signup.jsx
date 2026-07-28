import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const DEPARTMENTS = [
  'Select your country',
  'Nigeria', 'Spain', 'England', 'France', 'Germany',
  'Italy', 'Portugal', 'Brazil', 'Argentina', 'Netherlands',
  'Belgium', 'United States', 'Japan', 'South Korea', 'Morocco',
  'Senegal', 'Ghana', 'Ivory Coast', 'Egypt', 'South Africa'
];

export default function Signup() {
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', password: '', country: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/signup', {
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        password: form.password
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
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

      {/* Background Video */}
      <video className="video-bg" autoPlay muted loop playsInline>
       <source src="/videos/football.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <div className="fade-in" style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '52px', marginBottom: '8px' }}>⚽</div>
          <h1 className="bebas gold-text" style={{ fontSize: '48px', letterSpacing: '5px' }}>
            MATCHDAY
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Join the stadium experience
          </p>
        </div>

        <div className="gold-card" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>
            Create Your Account
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '28px' }}>
            Get access to exclusive match tickets
          </p>

          {error && <div className="error-msg" style={{ marginBottom: '20px' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  First Name
                </label>
                <input
                  className="input-field"
                  type="text"
                  name="firstname"
                  placeholder="Chinonso"
                  value={form.firstname}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Last Name
                </label>
                <input
                  className="input-field"
                  type="text"
                  name="lastname"
                  placeholder="Ogbonna"
                  value={form.lastname}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email Address
              </label>
              <input
                className="input-field"
                type="email"
                name="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password
              </label>
              <input
                className="input-field"
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button
              className="btn-gold"
              onClick={handleSignup}
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
                  Creating Account...
                </span>
              ) : 'Join MatchDay ⚽'}
            </button>
          </div>

          <div style={{
            marginTop: '28px', paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              Already have an account?{' '}
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