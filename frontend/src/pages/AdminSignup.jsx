import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function AdminSignup() {
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', password: '', admin_code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/admin/signup', form);
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
      padding: '20px', position: 'relative'
    }}>
      <video className="video-bg" autoPlay muted loop playsInline>
        <source src="/videos/football.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <div className="fade-in" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛡️</div>
          <h1 className="bebas gold-text" style={{ fontSize: '42px', letterSpacing: '5px' }}>
            ADMIN SIGNUP
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '2px' }}>
            MatchDay Admin Registration
          </p>
        </div>

        <div className="gold-card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>Create Admin Account</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '28px' }}>
            Restricted — requires admin code
          </p>

          {error && <div className="error-msg" style={{ marginBottom: '20px' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>
                  First Name
                </label>
                <input className="input-field" type="text" name="firstname"
                  placeholder="First name" value={form.firstname} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>
                  Last Name
                </label>
                <input className="input-field" type="text" name="lastname"
                  placeholder="Last name" value={form.lastname} onChange={handleChange} />
              </div>
            </div>

            {[
              { label: 'Email', name: 'email', type: 'email', placeholder: 'admin@matchday.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Create strong password' },
              { label: 'Admin Code', name: 'admin_code', type: 'password', placeholder: 'Enter secret admin code' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>
                  {f.label}
                </label>
                <input className="input-field" type={f.type} name={f.name}
                  placeholder={f.placeholder} value={form[f.name]} onChange={handleChange}
                  onKeyDown={e => e.key === 'Enter' && handleSignup()} />
              </div>
            ))}

            <div style={{
              background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: '10px', padding: '12px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.5)'
            }}>
              🔐 You need the secret admin code to register
            </div>

            <button className="btn-gold" onClick={handleSignup} disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)',
                    borderTopColor: '#000', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', display: 'inline-block'
                  }} />
                  Creating Account...
                </span>
              ) : '🛡️ Create Admin Account'}
            </button>
          </div>

          <div style={{
            marginTop: '24px', paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              Already have an account?{' '}
              <Link to="/admin/login" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '700' }}>
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}