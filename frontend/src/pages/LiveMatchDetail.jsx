import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import GoalNotification from '../components/GoalNotification';

export default function LiveMatchDetail() {
  const [match, setMatch] = useState(null);
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [goal, setGoal] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { matchId } = useParams();
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const FOOTBALL_API_KEY = 'f962dda255b94325b270b5414e8ea738';

  useEffect(() => {
    fetchMatchDetails();
    setupSocket();

    // Poll every 30 seconds for updates
    intervalRef.current = setInterval(() => {
      fetchMatchDetails();
    }, 30000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      // Fetch match details from football-data.org
      const res = await fetch(
        `https://api.football-data.org/v4/matches/${matchId}`,
        {
          headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
        }
      );
      const data = await res.json();

      if (data.match || data.id) {
        const matchData = data.match || data;
        setMatch(matchData);

        // Extract goal scorers
        const goals = matchData.goals || [];
        setScorers(goals);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError('Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const socket = io('http://127.0.0.1:5000');
    socket.on('goal_scored', (data) => {
      setGoal(data);
      // Refresh match data when goal is scored
      fetchMatchDetails();
    });
    return () => socket.disconnect();
  };

  const getMinuteDisplay = (minute, injuryTime) => {
    if (injuryTime) return `${minute}+${injuryTime}'`;
    return `${minute}'`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PLAY': return '#ef4444';
      case 'PAUSED': return '#f59e0b';
      case 'FINISHED': return '#10b981';
      default: return '#FFD700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'IN_PLAY': return '🔴 LIVE';
      case 'PAUSED': return '⏸ HALF TIME';
      case 'FINISHED': return '✅ FULL TIME';
      case 'TIMED': return '🗓 SCHEDULED';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="football-loader">⚽</div>
        <div className="loader-text">LOADING LIVE MATCH</div>
        <div className="loader-bar">
          <div className="loader-bar-fill" />
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <video className="video-bg" autoPlay muted loop playsInline>
          <source src="/videos/football.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" />
        <Navbar />
        <div style={{ padding: '40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚽</div>
          <p className="bebas" style={{ fontSize: '24px', color: '#FFD700' }}>
            MATCH DETAILS UNAVAILABLE
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
            This match may not be available in the free API tier
          </p>
          <button className="btn-gold" style={{ width: 'auto', padding: '12px 32px' }}
            onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;
  const score = match.score;
  const status = match.status;
  const minute = match.minute;

  // Separate goals by team
  const homeGoals = scorers.filter(g => g.team?.id === homeTeam?.id);
  const awayGoals = scorers.filter(g => g.team?.id === awayTeam?.id);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

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

      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Back button */}
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'transparent', border: '1px solid rgba(255,215,0,0.3)',
          borderRadius: '8px', padding: '8px 16px', color: '#FFD700',
          cursor: 'pointer', fontSize: '13px', fontWeight: '700',
          marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          ← Back to Dashboard
        </button>

        {/* Main Score Card */}
        <div className="gold-card fade-in" style={{ padding: '40px', marginBottom: '24px', textAlign: 'center' }}>

          {/* Competition */}
          <p style={{
            fontSize: '12px', color: 'rgba(255,215,0,0.6)',
            textTransform: 'uppercase', letterSpacing: '3px',
            marginBottom: '20px', fontWeight: '700'
          }}>
            {match.competition?.name} — {match.season?.startDate?.split('-')[0]}/{match.season?.endDate?.split('-')[0]}
          </p>

          {/* Status */}
          <div style={{ marginBottom: '28px' }}>
            <span style={{
              background: status === 'IN_PLAY' ? 'rgba(239,68,68,0.15)' : 'rgba(255,215,0,0.15)',
              border: `1px solid ${status === 'IN_PLAY' ? 'rgba(239,68,68,0.4)' : 'rgba(255,215,0,0.4)'}`,
              borderRadius: '20px', padding: '6px 16px',
              fontSize: '13px', fontWeight: '800', letterSpacing: '1px',
              color: getStatusColor(status),
              animation: status === 'IN_PLAY' ? 'pulse-gold 1.5s ease infinite' : 'none'
            }}>
              {getStatusLabel(status)}
            </span>
            {minute && status === 'IN_PLAY' && (
              <span style={{
                marginLeft: '10px', fontSize: '13px',
                color: 'rgba(255,255,255,0.5)', fontWeight: '600'
              }}>
                ⏱ {minute}'
              </span>
            )}
          </div>

          {/* Teams and Score */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>

            {/* Home Team */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              {homeTeam?.crest && (
                <img src={homeTeam.crest} alt={homeTeam.name}
                  style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px' }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
              <p className="bebas" style={{ fontSize: '22px', letterSpacing: '2px' }}>
                {homeTeam?.name}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                {homeTeam?.shortName}
              </p>
            </div>

            {/* Score */}
            <div style={{ textAlign: 'center', padding: '0 20px' }}>
              <div className="bebas gold-text" style={{ fontSize: '72px', letterSpacing: '8px', lineHeight: 1 }}>
                {score?.fullTime?.home ?? 0} - {score?.fullTime?.away ?? 0}
              </div>
              {score?.halfTime?.home !== null && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                  HT: {score?.halfTime?.home} - {score?.halfTime?.away}
                </p>
              )}
              {lastUpdated && (
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>
                  Updated {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              )}
            </div>

            {/* Away Team */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              {awayTeam?.crest && (
                <img src={awayTeam.crest} alt={awayTeam.name}
                  style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px' }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
              <p className="bebas" style={{ fontSize: '22px', letterSpacing: '2px' }}>
                {awayTeam?.name}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                {awayTeam?.shortName}
              </p>
            </div>
          </div>
        </div>

        {/* Goal Scorers */}
        {scorers.length > 0 && (
          <div className="gold-card fade-in" style={{ padding: '28px', marginBottom: '24px' }}>
            <h2 className="bebas" style={{ fontSize: '24px', letterSpacing: '3px', marginBottom: '24px', color: '#FFD700' }}>
              ⚽ GOAL SCORERS
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

              {/* Home Goals */}
              <div>
                <p style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase', letterSpacing: '1px',
                  marginBottom: '12px', fontWeight: '700'
                }}>
                  {homeTeam?.shortName}
                </p>
                {homeGoals.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>No goals yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {homeGoals.map((goal, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'rgba(255,215,0,0.05)',
                        border: '1px solid rgba(255,215,0,0.1)',
                        borderRadius: '8px', padding: '10px 14px'
                      }}>
                        <span style={{ fontSize: '18px' }}>⚽</span>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '700' }}>
                            {goal.scorer?.name}
                          </p>
                          {goal.assist?.name && (
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                              Assist: {goal.assist.name}
                            </p>
                          )}
                        </div>
                        <span className="bebas gold-text" style={{ fontSize: '18px', marginLeft: 'auto' }}>
                          {getMinuteDisplay(goal.minute, goal.injuryTime)}'
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Away Goals */}
              <div>
                <p style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase', letterSpacing: '1px',
                  marginBottom: '12px', fontWeight: '700'
                }}>
                  {awayTeam?.shortName}
                </p>
                {awayGoals.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>No goals yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {awayGoals.map((goal, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'rgba(255,215,0,0.05)',
                        border: '1px solid rgba(255,215,0,0.1)',
                        borderRadius: '8px', padding: '10px 14px'
                      }}>
                        <span style={{ fontSize: '18px' }}>⚽</span>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '700' }}>
                            {goal.scorer?.name}
                          </p>
                          {goal.assist?.name && (
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                              Assist: {goal.assist.name}
                            </p>
                          )}
                        </div>
                        <span className="bebas gold-text" style={{ fontSize: '18px', marginLeft: 'auto' }}>
                          {getMinuteDisplay(goal.minute, goal.injuryTime)}'
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Match Info */}
        <div className="gold-card fade-in" style={{ padding: '28px', marginBottom: '24px' }}>
          <h2 className="bebas" style={{ fontSize: '24px', letterSpacing: '3px', marginBottom: '20px', color: '#FFD700' }}>
            📋 MATCH INFO
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Competition', value: match.competition?.name, icon: '🏆' },
              { label: 'Matchday', value: `Day ${match.matchday}`, icon: '📅' },
              { label: 'Venue', value: match.venue || 'TBC', icon: '🏟️' },
              { label: 'Referee', value: match.referees?.[0]?.name || 'TBC', icon: '👔' },
              { label: 'Date', value: new Date(match.utcDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), icon: '🗓' },
              { label: 'Kick Off', value: new Date(match.utcDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC', icon: '⏰' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px', padding: '14px'
              }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {item.icon} {item.label}
                </p>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Auto refresh notice */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '20px' }}>
          ⟳ Match data refreshes automatically every 30 seconds
        </p>
      </div>
    </div>
  );
}