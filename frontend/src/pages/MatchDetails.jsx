import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function MatchDetails() {
  const [match, setMatch] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ticket, setTicket] = useState(null);
  const { matchId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      const res = await API.get(`/matches/${matchId}`);
      setMatch(res.data.match);
      setSections(res.data.sections);
    } catch (err) {
      setError('Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = async () => {
    if (!selectedSection) {
      setError('Please select a section');
      return;
    }
    setBooking(true);
    setError('');
    try {
      const res = await API.post('/tickets/book', {
        match_id: parseInt(matchId),
        section_id: selectedSection.id
      });

      // Redirect to Paystack payment URL
      window.location.href = res.data.payment_url;

    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const fireConfetti = () => {
    const colors = ['#FFD700', '#FFC200', '#ffffff', '#000000'];

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: colors
    });

    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
    }, 300);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="football-loader">⚽</div>
        <div className="loader-text">LOADING MATCH</div>
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

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div className="payment-success-overlay">
          <div className="payment-success-card">
            <div className="success-icon">🏆</div>
            <div className="success-title">TICKET BOOKED!</div>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontSize: '15px' }}>
              Your seat is confirmed!
            </p>
            <p style={{ color: '#FFD700', fontWeight: '700', fontSize: '14px', marginBottom: '32px' }}>
              Check your email for your QR code ticket
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-outline" onClick={() => navigate('/my-tickets')}>
                View My Tickets
              </button>
              <button className="btn-gold" onClick={() => {
                setPaymentSuccess(false);
                navigate('/dashboard');
              }}>
                Back to Matches
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {match && (
          <>
            {/* Match Header */}
            <div className="gold-card fade-in" style={{ padding: '40px', marginBottom: '32px', textAlign: 'center' }}>
              <span className={`badge ${match.status === 'live' ? 'badge-live' : ''}`} style={{ marginBottom: '24px', display: 'inline-block' }}>
                {match.status === 'live' ? '🔴 LIVE' : match.status === 'upcoming' ? '🗓 UPCOMING' : '✅ FINISHED'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
                {/* Home team */}
                <div style={{ textAlign: 'center' }}>
                  {match.home_club.logo_url && (
                    <img src={match.home_club.logo_url} alt={match.home_club.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                  <p className="bebas" style={{ fontSize: '24px', letterSpacing: '2px' }}>{match.home_club.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{match.home_club.country}</p>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'center' }}>
                  <div className="bebas gold-text" style={{ fontSize: '64px', letterSpacing: '8px', lineHeight: 1 }}>
                    {match.home_score} - {match.away_score}
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                    {new Date(match.date).toLocaleDateString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <p style={{ fontSize: '13px', color: '#FFD700', marginTop: '4px' }}>
                    🏟️ {match.stadium.name}, {match.stadium.city}
                  </p>
                </div>

                {/* Away team */}
                <div style={{ textAlign: 'center' }}>
                  {match.away_club.logo_url && (
                    <img src={match.away_club.logo_url} alt={match.away_club.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                  <p className="bebas" style={{ fontSize: '24px', letterSpacing: '2px' }}>{match.away_club.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{match.away_club.country}</p>
                </div>
              </div>
            </div>

            {/* Sections */}
            {match.status === 'upcoming' && (
              <div className="fade-in">
                <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '20px' }}>
                  🎟️ SELECT YOUR SECTION
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  {sections.map(section => (
                    <div
                      key={section.id}
                      className={`section-card ${selectedSection?.id === section.id ? 'selected' : ''} ${section.available_seats === 0 ? 'sold-out' : ''}`}
                      onClick={() => section.available_seats > 0 && setSelectedSection(section)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span className="bebas" style={{ fontSize: '22px', letterSpacing: '2px' }}>{section.name}</span>
                        {section.available_seats === 0 && (
                          <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>SOLD OUT</span>
                        )}
                        {selectedSection?.id === section.id && (
                          <span style={{ color: '#FFD700', fontSize: '18px' }}>✓</span>
                        )}
                      </div>

                      <div className="bebas gold-text" style={{ fontSize: '28px', letterSpacing: '1px', marginBottom: '8px' }}>
                        ₦{section.price.toLocaleString()}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        <span>{section.available_seats} seats left</span>
                        <span>of {section.total_seats}</span>
                      </div>

                      {/* Availability bar */}
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${(section.available_seats / section.total_seats) * 100}%`,
                          background: section.available_seats > section.total_seats * 0.3
                            ? 'linear-gradient(90deg, #FFD700, #FFC200)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                          borderRadius: '2px',
                          transition: 'width 1s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                {error && <div className="error-msg" style={{ marginBottom: '20px' }}>{error}</div>}

                {selectedSection && (
                  <div className="gold-card" style={{ padding: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Selected Section</p>
                        <p className="bebas" style={{ fontSize: '24px', letterSpacing: '2px' }}>{selectedSection.name}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Total</p>
                        <p className="bebas gold-text" style={{ fontSize: '32px' }}>₦{selectedSection.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  className="btn-gold"
                  onClick={handleBookTicket}
                  disabled={booking || !selectedSection}
                  style={{ fontSize: '16px', padding: '16px' }}
                >
                  {booking ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{
                        width: '18px', height: '18px',
                        border: '2px solid rgba(0,0,0,0.3)',
                        borderTopColor: '#000',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        display: 'inline-block'
                      }} />
                      Processing...
                    </span>
                  ) : '🎟️ BOOK TICKET — PAY WITH PAYSTACK'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}