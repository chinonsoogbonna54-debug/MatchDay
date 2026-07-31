import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const stripePromise = loadStripe('pk_test_51Tw76l0Eiyf5Ogb7E7f4PTb4rNu6BNclWvvu65gzb6o8JuFBZMYyWjjvvaokslWmVcp65KqiJsGVbkfuFkH5AkiH00IWeeeRMo');

function StripePaymentForm({ ticket, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleStripePayment = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const intentRes = await API.post('/payments/create-intent', {
        ticket_id: ticket.id
      });

      const result = await stripe.confirmCardPayment(intentRes.data.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });

      if (result.error) {
        onError(result.error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      onError(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,215,0,0.3)',
        borderRadius: '10px', padding: '16px',
        marginBottom: '16px'
      }}>
        <CardElement options={{
          style: {
            base: {
              color: '#ffffff',
              fontSize: '16px',
              '::placeholder': { color: 'rgba(255,255,255,0.4)' }
            }
          }
        }} />
      </div>
      <button
        className="btn-outline"
        onClick={handleStripePayment}
        disabled={processing || !stripe}
        style={{ fontSize: '15px', padding: '14px' }}
      >
        {processing ? 'Processing...' : '💳 PAY WITH STRIPE (USD)'}
      </button>
    </div>
  );
}

export default function MatchDetails() {
  const [match, setMatch] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [pendingTicket, setPendingTicket] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const { matchId } = useParams();
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMatch(); }, [matchId]);

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

  const handleBookTicket = async (method) => {
    if (!selectedSection) { setError('Please select a section'); return; }
    setBooking(true);
    setError('');
    try {
      const res = await API.post('/tickets/book', {
        match_id: parseInt(matchId),
        section_id: selectedSection.id
      });
      if (method === 'paystack') {
        window.location.href = res.data.payment_url;
      } else {
        setPendingTicket(res.data.ticket);
        setPaymentMethod('stripe');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="football-loader">⚽</div>
        <div className="loader-text">LOADING MATCH</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <video className="video-bg" autoPlay muted loop playsInline>
        <source src="/videos/football.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

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
              <button className="btn-outline" onClick={() => navigate('/my-tickets')}>View My Tickets</button>
              <button className="btn-gold" onClick={() => { setPaymentSuccess(false); navigate('/dashboard'); }}>
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
            <div className="gold-card fade-in" style={{ padding: '40px', marginBottom: '32px', textAlign: 'center' }}>
              <span className={`badge ${match.status === 'live' ? 'badge-live' : ''}`} style={{ marginBottom: '24px', display: 'inline-block' }}>
                {match.status === 'live' ? '🔴 LIVE' : match.status === 'upcoming' ? '🗓 UPCOMING' : '✅ FINISHED'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(10px, 4vw, 40px)', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  {match.home_club.logo_url && (
                    <img src={match.home_club.logo_url} alt={match.home_club.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px' }}
                      onError={e => e.target.style.display = 'none'} />
                  )}
                  <p className="bebas" style={{ fontSize: '24px', letterSpacing: '2px' }}>{match.home_club.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{match.home_club.country}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="bebas gold-text" style={{ fontSize: 'clamp(32px, 8vw, 64px)', letterSpacing: '8px', lineHeight: 1 }}>
                    {match.home_score} - {match.away_score}
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                    {new Date(match.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p style={{ fontSize: '13px', color: '#FFD700', marginTop: '4px' }}>
                    🏟️ {match.stadium.name}, {match.stadium.city}
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  {match.away_club.logo_url && (
                    <img src={match.away_club.logo_url} alt={match.away_club.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px' }}
                      onError={e => e.target.style.display = 'none'} />
                  )}
                  <p className="bebas" style={{ fontSize: '24px', letterSpacing: '2px' }}>{match.away_club.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{match.away_club.country}</p>
                </div>
              </div>
            </div>

            {match.status === 'upcoming' && (
              <div className="fade-in">
                <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '20px' }}>
                  🎟️ SELECT YOUR SECTION
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  {sections.map(section => (
                    <div key={section.id}
                      className={`section-card ${selectedSection?.id === section.id ? 'selected' : ''} ${section.available_seats === 0 ? 'sold-out' : ''}`}
                      onClick={() => section.available_seats > 0 && setSelectedSection(section)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span className="bebas" style={{ fontSize: '22px', letterSpacing: '2px' }}>{section.name}</span>
                        {section.available_seats === 0 && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>SOLD OUT</span>}
                        {selectedSection?.id === section.id && <span style={{ color: '#FFD700', fontSize: '18px' }}>✓</span>}
                      </div>
                      <div className="bebas gold-text" style={{ fontSize: '28px', letterSpacing: '1px', marginBottom: '8px' }}>
                        ₦{section.price.toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        <span>{section.available_seats} seats left</span>
                        <span>of {section.total_seats}</span>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${(section.available_seats / section.total_seats) * 100}%`,
                          background: section.available_seats > section.total_seats * 0.3
                            ? 'linear-gradient(90deg, #FFD700, #FFC200)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                          borderRadius: '2px', transition: 'width 1s ease'
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

                    {/* Payment method selection */}
                    {!paymentMethod && (
                      <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                        <button className="btn-gold" onClick={() => handleBookTicket('paystack')}
                          disabled={booking} style={{ fontSize: '14px', padding: '14px' }}>
                          {booking ? 'Processing...' : '🏦 PAY WITH PAYSTACK (NGN)'}
                        </button>
                        <button className="btn-outline" onClick={() => handleBookTicket('stripe')}
                          disabled={booking} style={{ fontSize: '14px', padding: '14px' }}>
                          {booking ? 'Processing...' : '💳 PAY WITH STRIPE (USD)'}
                        </button>
                      </div>
                    )}

                    {/* Stripe form */}
                    {paymentMethod === 'stripe' && pendingTicket && (
                      <Elements stripe={stripePromise}>
                        <StripePaymentForm
                          ticket={pendingTicket}
                          onSuccess={() => setPaymentSuccess(true)}
                          onError={(msg) => setError(msg)}
                        />
                      </Elements>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}