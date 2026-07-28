import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets/my-tickets');
      setTickets(res.data.tickets);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="football-loader">⚽</div>
        <div className="loader-text">LOADING TICKETS</div>
        <div className="loader-bar">
          <div className="loader-bar-fill" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      <video className="video-bg" autoPlay muted loop playsInline>
       <source src="/videos/football.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <Navbar />

      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <div style={{ marginBottom: '40px' }} className="fade-in">
          <h1 className="bebas" style={{ fontSize: '52px', letterSpacing: '4px' }}>
            MY <span className="gold-text">TICKETS</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginTop: '8px' }}>
            Your match tickets and booking history
          </p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '24px' }}>{error}</div>}

        {tickets.length === 0 ? (
          <div className="gold-card" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎟️</div>
            <p className="bebas" style={{ fontSize: '28px', color: '#FFD700', letterSpacing: '2px', marginBottom: '8px' }}>
              NO TICKETS YET
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
              Book your first match ticket to get started
            </p>
            <button className="btn-gold" style={{ width: 'auto', padding: '12px 32px' }}
              onClick={() => navigate('/dashboard')}>
              Browse Matches →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {tickets.map((ticket, i) => (
              <div key={ticket.id} className="gold-card fade-in" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span className="badge">🎟️ TICKET #{ticket.id}</span>
                      <span style={{
                        background: 'rgba(16,185,129,0.15)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '20px', padding: '3px 10px',
                        fontSize: '11px', color: '#10b981', fontWeight: '700'
                      }}>✓ CONFIRMED</span>
                    </div>
                    <h3 className="bebas" style={{ fontSize: '24px', letterSpacing: '2px' }}>
                      {ticket.match.home_club.name} vs {ticket.match.away_club.name}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="bebas gold-text" style={{ fontSize: '28px' }}>
                      ₦{ticket.section.price.toLocaleString()}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {ticket.section.name} Section
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px', paddingTop: '20px',
                  borderTop: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</p>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>
                      {new Date(ticket.match.date).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stadium</p>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>{ticket.match.stadium.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Section</p>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>{ticket.section.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reference</p>
                    <p style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'monospace', color: '#FFD700' }}>
                      {ticket.payment_reference}
                    </p>
                  </div>
                </div>

                {ticket.qr_code && (
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                      🔲 Show this QR code at the stadium entrance
                    </p>
                    <img
                      src={`http://127.0.0.1:5000/${ticket.qr_code}`}
                      alt="QR Code"
                      style={{ width: '120px', height: '120px', borderRadius: '8px', border: '2px solid #FFD700' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}