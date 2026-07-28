import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import GoalNotification from '../components/GoalNotification';

export default function FanDashboard() {
  const [matches, setMatches] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [favouriteClubId, setFavouriteClubId] = useState(null);
  const [starLoading, setStarLoading] = useState(null);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    setupSocket();
  }, []);
const fetchData = async () => {
  // Load core data first
  try {
    const [matchRes, clubRes] = await Promise.all([
      API.get('/matches/'),
      API.get('/clubs/')
    ]);
    setMatches(matchRes.data.matches);
    setClubs(clubRes.data.clubs);
    const savedUser = JSON.parse(localStorage.getItem('user'));
    setFavouriteClubId(savedUser?.favourite_club_id);
  } catch (err) {
    setError('Failed to load matches');
  } finally {
    setLoading(false);
  }

  // Load live scores separately - don't break page if this fails
  try {
    const [liveRes, todayRes] = await Promise.all([
      API.get('/matches/live'),
      API.get('/matches/today')
    ]);
    setLiveMatches(liveRes.data.matches);
    setTodayMatches(todayRes.data.matches);
  } catch (err) {
    console.log('Live scores unavailable:', err);
  }
};
  const setupSocket = () => {
    const socket = io('http://127.0.0.1:5000');
    socket.on('goal_scored', (data) => {
      setGoal(data);
    });
    socket.on('match_status_updated', (data) => {
      setMatches(prev => prev.map(m =>
        m.id === data.match_id ? { ...m, status: data.status } : m
      ));
    });
    return () => socket.disconnect();
  };

  const handleFavourite = async (clubId) => {
    setStarLoading(clubId);
    try {
      await API.put('/clubs/favourite', { club_id: clubId });
      setFavouriteClubId(clubId);
      const savedUser = JSON.parse(localStorage.getItem('user'));
      savedUser.favourite_club_id = clubId;
      localStorage.setItem('user', JSON.stringify(savedUser));
    } catch (err) {
      setError('Failed to update favourite');
    } finally {
      setStarLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="football-loader">⚽</div>
        <div className="loader-text">LOADING MATCHDAY</div>
        <div className="loader-bar">
          <div className="loader-bar-fill" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Background Video */}
      <video className="video-bg" autoPlay muted loop playsInline>
       <source src="/videos/football.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      {/* Goal Notification */}
      {goal && (
        <GoalNotification
          goal={goal}
          onDismiss={() => setGoal(null)}
        />
      )}

      <Navbar />

      <div style={{ padding: '40px 32px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }} className="fade-in">
          <h1 className="bebas" style={{ fontSize: '56px', letterSpacing: '4px', lineHeight: 1 }}>
            WELCOME BACK, <span className="gold-text">{user?.firstname?.toUpperCase()}!</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginTop: '8px' }}>
            Your next match is waiting. Book your seat today.
          </p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '24px' }}>{error}</div>}

        {/* Favourite Clubs Section */}
        <div style={{ marginBottom: '48px' }}>
          <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '20px', color: '#FFD700' }}>
            ⭐ YOUR FAVOURITE CLUBS
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {clubs.map(club => (
              <div key={club.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: favouriteClubId === club.id ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.5)',
                border: `1px solid ${favouriteClubId === club.id ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px', padding: '10px 16px',
                transition: 'all 0.3s ease'
              }}>
                {club.logo_url && (
                  <img src={club.logo_url} alt={club.name}
                    style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                    onError={e => e.target.style.display = 'none'}
                  />
                )}
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{club.name}</span>
                <button
                  className={`star-btn ${favouriteClubId === club.id ? 'active' : ''}`}
                  onClick={() => handleFavourite(club.id)}
                  disabled={starLoading === club.id}
                  title={favouriteClubId === club.id ? 'Your favourite' : 'Set as favourite'}
                >
                  {favouriteClubId === club.id ? '⭐' : '☆'}
                </button>
              </div>
            ))}
          </div>
        </div>


        {/* Live Scores Section */}
{liveMatches.length > 0 && (
  <div style={{ marginBottom: '48px' }}>
    <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '20px', color: '#ef4444' }}>
      🔴 LIVE SCORES
    </h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
     {liveMatches.map(match => (
  <div key={match.id} className="gold-card" style={{ padding: '20px', cursor: 'pointer' }}
    onClick={() => navigate(`/live/${match.id}`)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontWeight: '700', fontSize: '15px' }}>{match.home_team}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '0 24px' }}>
              <p className="bebas gold-text" style={{ fontSize: '32px', letterSpacing: '4px' }}>
                {match.home_score ?? 0} - {match.away_score ?? 0}
              </p>
              <span className="badge badge-live" style={{ fontSize: '11px' }}>🔴 LIVE</span>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontWeight: '700', fontSize: '15px' }}>{match.away_team}</p>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
            {match.competition}
          </p>
        </div>
      ))}
    </div>
  </div>
)}

{/* Today's Matches Section */}
{todayMatches.length > 0 && (
  <div style={{ marginBottom: '48px' }}>
    <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '20px' }}>
      📅 TODAY'S MATCHES
    </h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {todayMatches.map(match => (
        <div key={match.id} className="gold-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontWeight: '700', fontSize: '15px' }}>{match.home_team}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '0 24px' }}>
              <p className="bebas gold-text" style={{ fontSize: '28px', letterSpacing: '4px' }}>
                {match.home_score ?? '-'} - {match.away_score ?? '-'}
              </p>
              <span className="badge" style={{ fontSize: '11px' }}>
                {match.status === 'FINISHED' ? '✅ FT' : match.status === 'IN_PLAY' ? '🔴 LIVE' : '🗓 ' + new Date(match.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontWeight: '700', fontSize: '15px' }}>{match.away_team}</p>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
            {match.competition}
          </p>
        </div>
      ))}
    </div>
  </div>
)}

        {/* Matches Section */}
        <div>
          <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '24px' }}>
            🏟️ UPCOMING MATCHES
          </h2>

          {matches.length === 0 ? (
            <div className="gold-card" style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏟️</div>
              <p className="bebas" style={{ fontSize: '24px', color: '#FFD700', letterSpacing: '2px' }}>
                NO MATCHES SCHEDULED
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                Check back soon for upcoming fixtures
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '20px'
            }}>
              {matches.map(match => (
                <div
                  key={match.id}
                  className="match-card fade-in"
                  onClick={() => navigate(`/match/${match.id}`)}
                >
                  {/* Status badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span className={`badge ${match.status === 'live' ? 'badge-live' : ''}`}>
                      {match.status === 'live' ? '🔴 LIVE' : match.status === 'upcoming' ? '🗓 UPCOMING' : '✅ FINISHED'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {match.season}
                    </span>
                  </div>

                  {/* Teams */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    {/* Home team */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      {match.home_club.logo_url && (
                        <img src={match.home_club.logo_url} alt={match.home_club.name}
                          style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '8px' }}
                          onError={e => e.target.style.display = 'none'}
                        />
                      )}
                      <p style={{ fontSize: '13px', fontWeight: '700' }}>{match.home_club.name}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{match.home_club.short_name}</p>
                    </div>

                    {/* Score / VS */}
                    <div style={{ textAlign: 'center', padding: '0 16px' }}>
                      {match.status === 'live' || match.status === 'finished' ? (
                        <div className="bebas" style={{ fontSize: '36px', color: '#FFD700', letterSpacing: '4px' }}>
                          {match.home_score} - {match.away_score}
                        </div>
                      ) : (
                        <div className="vs-text">VS</div>
                      )}
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                        {new Date(match.date).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Away team */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      {match.away_club.logo_url && (
                        <img src={match.away_club.logo_url} alt={match.away_club.name}
                          style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '8px' }}
                          onError={e => e.target.style.display = 'none'}
                        />
                      )}
                      <p style={{ fontSize: '13px', fontWeight: '700' }}>{match.away_club.name}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{match.away_club.short_name}</p>
                    </div>
                  </div>

                  {/* Stadium */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      🏟️ {match.stadium.name}, {match.stadium.city}
                    </span>
                    <span style={{ fontSize: '12px', color: '#FFD700', fontWeight: '700' }}>
                      Book Now →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}