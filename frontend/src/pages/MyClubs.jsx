import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function MyClubs() {
  const [clubs, setClubs] = useState([]);
  const [favouriteClubId, setFavouriteClubId] = useState(null);
  const [starLoading, setStarLoading] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubMatches, setClubMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clubRes] = await Promise.all([
        API.get('/clubs/'),
      ]);
      setClubs(clubRes.data.clubs);
      const savedUser = JSON.parse(localStorage.getItem('user'));
      setFavouriteClubId(savedUser?.favourite_club_id);
    } catch (err) {
      setError('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleFavourite = async (clubId) => {
    setStarLoading(clubId);
    setSuccess('');
    try {
      await API.put('/clubs/favourite', { club_id: clubId });
      setFavouriteClubId(clubId);
      const savedUser = JSON.parse(localStorage.getItem('user'));
      savedUser.favourite_club_id = clubId;
      localStorage.setItem('user', JSON.stringify(savedUser));
      setSuccess('Favourite club updated!');
    } catch (err) {
      setError('Failed to update favourite');
    } finally {
      setStarLoading(null);
    }
  };

  const handleClubClick = async (club) => {
    setSelectedClub(club);
    setMatchLoading(true);
    setClubMatches([]);
    try {
      const res = await API.get(`/matches/club/${club.id}`);
      setClubMatches(res.data.matches);
    } catch (err) {
      setClubMatches([]);
    } finally {
      setMatchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="football-loader">⚽</div>
        <div className="loader-text">LOADING CLUBS</div>
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

      <div style={{ padding: '40px 32px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

      {/* Header */}
<div style={{ marginBottom: '40px' }} className="fade-in">
  <h1 className="bebas" style={{ fontSize: '52px', letterSpacing: '4px' }}>
    MY <span className="gold-text">CLUBS</span>
  </h1>
  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginTop: '8px' }}>
    Follow your favourite clubs and view their upcoming matches
  </p>
</div>

{/* Favourite Club Banner */}
{favouriteClubId && clubs.find(c => c.id === favouriteClubId) && (
  <div className="fade-in" style={{
    background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)',
    border: '1px solid rgba(255,215,0,0.4)',
    borderRadius: '16px',
    padding: '24px 28px',
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 0 40px rgba(255,215,0,0.08)'
  }}>
    {/* Gold star */}
    <div style={{
      width: '60px', height: '60px',
      background: 'linear-gradient(135deg, #FFD700, #FFC200)',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '28px', flexShrink: 0,
      boxShadow: '0 0 20px rgba(255,215,0,0.4)'
    }}>
      ⭐
    </div>

    {/* Club info */}
    <div style={{ flex: 1 }}>
      <p style={{
        fontSize: '12px', color: 'rgba(255,215,0,0.7)',
        textTransform: 'uppercase', letterSpacing: '2px',
        fontWeight: '700', marginBottom: '4px'
      }}>
        Your Club
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {clubs.find(c => c.id === favouriteClubId)?.logo_url && (
          <img
            src={clubs.find(c => c.id === favouriteClubId).logo_url}
            alt="club logo"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            onError={e => e.target.style.display = 'none'}
          />
        )}
        <h2 className="bebas gold-text" style={{ fontSize: '36px', letterSpacing: '3px' }}>
          {clubs.find(c => c.id === favouriteClubId)?.name?.toUpperCase()}
        </h2>
      </div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
        {clubs.find(c => c.id === favouriteClubId)?.country} ·{' '}
        {clubs.find(c => c.id === favouriteClubId)?.short_name}
      </p>
    </div>

    {/* View matches button */}
    <button
      className="btn-gold"
      style={{ width: 'auto', padding: '10px 24px', fontSize: '13px' }}
      onClick={() => handleClubClick(clubs.find(c => c.id === favouriteClubId))}
    >
      View Matches →
    </button>
  </div>
)}

        {error && <div className="error-msg" style={{ marginBottom: '20px' }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: '20px' }}>{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>

          {/* Clubs List */}
          <div>
            <h2 className="bebas" style={{ fontSize: '24px', letterSpacing: '3px', marginBottom: '20px', color: '#FFD700' }}>
              ⚽ ALL CLUBS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {clubs.map(club => (
                <div
                  key={club.id}
                  onClick={() => handleClubClick(club)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: selectedClub?.id === club.id
                      ? 'rgba(255,215,0,0.12)'
                      : favouriteClubId === club.id
                      ? 'rgba(255,215,0,0.06)'
                      : 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${selectedClub?.id === club.id
                      ? '#FFD700'
                      : favouriteClubId === club.id
                      ? 'rgba(255,215,0,0.4)'
                      : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '12px', padding: '14px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedClub?.id === club.id
                      ? '0 0 20px rgba(255,215,0,0.15)'
                      : 'none'
                  }}
                >
                  {/* Club Logo */}
                  <div style={{
                    width: '44px', height: '44px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '50%', flexShrink: 0
                  }}>
                    {club.logo_url ? (
                      <img src={club.logo_url} alt={club.name}
                        style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                        onError={e => e.target.style.display = 'none'}
                      />
                    ) : (
                      <span style={{ fontSize: '20px' }}>⚽</span>
                    )}
                  </div>

                  {/* Club Info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '2px' }}>{club.name}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {club.short_name} · {club.country}
                    </p>
                  </div>

                  {/* Favourite Star */}
                  <button
                    className={`star-btn ${favouriteClubId === club.id ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleFavourite(club.id); }}
                    disabled={starLoading === club.id}
                    title={favouriteClubId === club.id ? 'Your favourite' : 'Set as favourite'}
                    style={{ fontSize: '24px' }}
                  >
                    {favouriteClubId === club.id ? '⭐' : '☆'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Club Matches */}
          <div>
            {!selectedClub ? (
              <div style={{
                height: '300px', display: 'flex',
                flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', opacity: 0.4
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>👈</div>
                <p className="bebas" style={{ fontSize: '20px', letterSpacing: '2px' }}>
                  SELECT A CLUB TO VIEW MATCHES
                </p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  {selectedClub.logo_url && (
                    <img src={selectedClub.logo_url} alt={selectedClub.name}
                      style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                  <h2 className="bebas" style={{ fontSize: '24px', letterSpacing: '3px', color: '#FFD700' }}>
                    {selectedClub.name.toUpperCase()} MATCHES
                  </h2>
                </div>

                {matchLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                    <div style={{ fontSize: '32px', animation: 'bounce 0.8s ease infinite', marginBottom: '12px' }}>⚽</div>
                    Loading matches...
                  </div>
                ) : clubMatches.length === 0 ? (
                  <div className="gold-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏟️</div>
                    <p className="bebas" style={{ fontSize: '20px', color: '#FFD700', letterSpacing: '2px' }}>
                      NO MATCHES SCHEDULED
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>
                      Check back soon for upcoming fixtures
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {clubMatches.map(match => (
                      <div
                        key={match.id}
                        className="match-card"
                        onClick={() => navigate(`/match/${match.id}`)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span className={`badge ${match.status === 'live' ? 'badge-live' : ''}`}>
                            {match.status === 'live' ? '🔴 LIVE' : match.status === 'upcoming' ? '🗓 UPCOMING' : '✅ FT'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{match.season}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ textAlign: 'center', flex: 1 }}>
                            {match.home_club.logo_url && (
                              <img src={match.home_club.logo_url} alt={match.home_club.name}
                                style={{ width: '36px', height: '36px', objectFit: 'contain', marginBottom: '6px' }}
                                onError={e => e.target.style.display = 'none'}
                              />
                            )}
                            <p style={{ fontSize: '12px', fontWeight: '700' }}>{match.home_club.name}</p>
                          </div>

                          <div style={{ textAlign: 'center', padding: '0 12px' }}>
                            {match.status !== 'upcoming' ? (
                              <p className="bebas gold-text" style={{ fontSize: '24px', letterSpacing: '3px' }}>
                                {match.home_score} - {match.away_score}
                              </p>
                            ) : (
                              <p className="vs-text" style={{ fontSize: '18px' }}>VS</p>
                            )}
                            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                              {new Date(match.date).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                          </div>

                          <div style={{ textAlign: 'center', flex: 1 }}>
                            {match.away_club.logo_url && (
                              <img src={match.away_club.logo_url} alt={match.away_club.name}
                                style={{ width: '36px', height: '36px', objectFit: 'contain', marginBottom: '6px' }}
                                onError={e => e.target.style.display = 'none'}
                              />
                            )}
                            <p style={{ fontSize: '12px', fontWeight: '700' }}>{match.away_club.name}</p>
                          </div>
                        </div>

                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '10px', textAlign: 'center' }}>
                          🏟️ {match.stadium.name} — Click to book →
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}