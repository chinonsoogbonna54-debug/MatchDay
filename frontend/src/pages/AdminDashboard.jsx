import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [sales, setSales] = useState([]);
  const [activeTab, setActiveTab] = useState('matches');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Club form
  const [clubForm, setClubForm] = useState({ name: '', short_name: '', country: '', logo_url: '' });

  // Add Stadium form
  const [stadiumForm, setStadiumForm] = useState({ name: '', city: '', country: '', capacity: '' });

  // Add Match form
  const [matchForm, setMatchForm] = useState({ home_club_id: '', away_club_id: '', stadium_id: '', date: '', season: '' });

  // Stadiums list
  const [stadiums, setStadiums] = useState([]);

  // Goal form
  const [goalForm, setGoalForm] = useState({ match_id: '', scorer: '', minute: '', team: 'home' });

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchRes, salesRes] = await Promise.all([
        API.get('/admin/matches'),
        API.get('/admin/sales')
      ]);
      setMatches(matchRes.data.matches);
      setSales(salesRes.data.tickets);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClub = async () => {
    try {
      await API.post('/admin/clubs', clubForm);
      setSuccess('Club added successfully!');
      setClubForm({ name: '', short_name: '', country: '', logo_url: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add club');
    }
  };

  const handleAddStadium = async () => {
    try {
      await API.post('/admin/stadiums', { ...stadiumForm, capacity: parseInt(stadiumForm.capacity) });
      setSuccess('Stadium added successfully!');
      setStadiumForm({ name: '', city: '', country: '', capacity: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add stadium');
    }
  };

  const handleAddMatch = async () => {
    try {
      await API.post('/admin/matches', {
        home_club_id: parseInt(matchForm.home_club_id),
        away_club_id: parseInt(matchForm.away_club_id),
        stadium_id: parseInt(matchForm.stadium_id),
        date: matchForm.date,
        season: matchForm.season
      });
      setSuccess('Match created successfully!');
      setMatchForm({ home_club_id: '', away_club_id: '', stadium_id: '', date: '', season: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create match');
    }
  };

  const handleRecordGoal = async () => {
    try {
      await API.post('/notifications/goal', {
        match_id: parseInt(goalForm.match_id),
        scorer: goalForm.scorer,
        minute: parseInt(goalForm.minute),
        team: goalForm.team
      });
      setSuccess(`Goal recorded! ${goalForm.scorer} scores!`);
      setGoalForm({ match_id: '', scorer: '', minute: '', team: 'home' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record goal');
    }
  };

  const handleUpdateMatchStatus = async (matchId, status) => {
    try {
      await API.post('/notifications/match-update', { match_id: matchId, status });
      setSuccess(`Match status updated to ${status}!`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="football-loader">⚽</div>
        <div className="loader-text">LOADING ADMIN</div>
        <div className="loader-bar">
          <div className="loader-bar-fill" />
        </div>
      </div>
    );
  }

  const tabs = ['matches', 'clubs', 'stadiums', 'goals', 'sales'];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      <video className="video-bg" autoPlay muted loop playsInline>
        <source src="/videos/football.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      {/* Admin Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">🛡️ MATCHDAY ADMIN</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '20px', padding: '5px 14px',
            fontSize: '13px', color: '#FFD700', fontWeight: '600'
          }}>
            🛡️ Admin Panel
          </div>
          <button onClick={handleLogout} style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '7px 14px',
            color: '#ef4444', cursor: 'pointer',
            fontSize: '13px', fontWeight: '700'
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '40px 32px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }} className="fade-in">
          <h1 className="bebas" style={{ fontSize: '52px', letterSpacing: '4px' }}>
            ADMIN <span className="gold-text">DASHBOARD</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginTop: '8px' }}>
            Manage matches, clubs, stadiums and sales
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', marginBottom: '40px'
        }}>
          {[
            { label: 'Total Matches', value: matches.length, icon: '🏟️' },
            { label: 'Tickets Sold', value: sales.length, icon: '🎟️' },
            { label: 'Revenue', value: `₦${sales.reduce((sum, t) => sum + t.section.price, 0).toLocaleString()}`, icon: '💰' },
          ].map((stat, i) => (
            <div key={i} className="gold-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
              <p className="bebas gold-text" style={{ fontSize: '32px', letterSpacing: '2px' }}>{stat.value}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Messages */}
        {error && <div className="error-msg" style={{ marginBottom: '20px' }} onClick={() => setError('')}>{error} ✕</div>}
        {success && <div className="success-msg" style={{ marginBottom: '20px' }} onClick={() => setSuccess('')}>{success} ✕</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? 'linear-gradient(135deg, #FFD700, #FFC200)' : 'rgba(0,0,0,0.5)',
              border: activeTab === tab ? 'none' : '1px solid rgba(255,215,0,0.3)',
              borderRadius: '8px', padding: '8px 20px',
              color: activeTab === tab ? '#000' : '#FFD700',
              cursor: 'pointer', fontSize: '13px', fontWeight: '800',
              textTransform: 'uppercase', letterSpacing: '1px',
              transition: 'all 0.2s'
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="fade-in">
            <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '24px' }}>
              🏟️ ADD NEW MATCH
            </h2>
            <div className="gold-card" style={{ padding: '28px', marginBottom: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Home Club ID</label>
                  <input className="input-field" type="number" placeholder="e.g. 1"
                    value={matchForm.home_club_id}
                    onChange={e => setMatchForm({ ...matchForm, home_club_id: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Away Club ID</label>
                  <input className="input-field" type="number" placeholder="e.g. 2"
                    value={matchForm.away_club_id}
                    onChange={e => setMatchForm({ ...matchForm, away_club_id: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Stadium ID</label>
                  <input className="input-field" type="number" placeholder="e.g. 1"
                    value={matchForm.stadium_id}
                    onChange={e => setMatchForm({ ...matchForm, stadium_id: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Season</label>
                  <input className="input-field" type="text" placeholder="e.g. 2025/2026"
                    value={matchForm.season}
                    onChange={e => setMatchForm({ ...matchForm, season: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Match Date & Time</label>
                  <input className="input-field" type="text" placeholder="YYYY-MM-DD HH:MM e.g. 2026-08-15 20:00"
                    value={matchForm.date}
                    onChange={e => setMatchForm({ ...matchForm, date: e.target.value })} />
                </div>
              </div>
              <button className="btn-gold" style={{ marginTop: '20px' }} onClick={handleAddMatch}>
                + Create Match
              </button>
            </div>

            <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '20px' }}>
              📋 ALL MATCHES
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matches.map(match => (
                <div key={match.id} className="gold-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p className="bebas" style={{ fontSize: '20px', letterSpacing: '2px' }}>
                        {match.home_club.name} <span className="gold-text">VS</span> {match.away_club.name}
                      </p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                        🏟️ {match.stadium.name} | 📅 {new Date(match.date).toLocaleDateString()} | ⚽ {match.home_score} - {match.away_score}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge ${match.status === 'live' ? 'badge-live' : ''}`}>
                        {match.status.toUpperCase()}
                      </span>
                      {match.status === 'upcoming' && (
                        <button onClick={() => handleUpdateMatchStatus(match.id, 'live')} style={{
                          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                          borderRadius: '6px', padding: '5px 10px', color: '#ef4444',
                          cursor: 'pointer', fontSize: '11px', fontWeight: '700'
                        }}>▶ Start</button>
                      )}
                      {match.status === 'live' && (
                        <button onClick={() => handleUpdateMatchStatus(match.id, 'finished')} style={{
                          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                          borderRadius: '6px', padding: '5px 10px', color: '#10b981',
                          cursor: 'pointer', fontSize: '11px', fontWeight: '700'
                        }}>■ End</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clubs Tab */}
        {activeTab === 'clubs' && (
          <div className="fade-in">
            <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '24px' }}>
              ⚽ ADD NEW CLUB
            </h2>
            <div className="gold-card" style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Club Name</label>
                  <input className="input-field" placeholder="e.g. FC Barcelona"
                    value={clubForm.name}
                    onChange={e => setClubForm({ ...clubForm, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Short Name</label>
                  <input className="input-field" placeholder="e.g. BAR"
                    value={clubForm.short_name}
                    onChange={e => setClubForm({ ...clubForm, short_name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Country</label>
                  <input className="input-field" placeholder="e.g. Spain"
                    value={clubForm.country}
                    onChange={e => setClubForm({ ...clubForm, country: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Logo URL</label>
                  <input className="input-field" placeholder="https://..."
                    value={clubForm.logo_url}
                    onChange={e => setClubForm({ ...clubForm, logo_url: e.target.value })} />
                </div>
              </div>
              <button className="btn-gold" style={{ marginTop: '20px' }} onClick={handleAddClub}>
                + Add Club
              </button>
            </div>
          </div>
        )}

        {/* Stadiums Tab */}
        {activeTab === 'stadiums' && (
          <div className="fade-in">
            <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '24px' }}>
              🏟️ ADD NEW STADIUM
            </h2>
            <div className="gold-card" style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Stadium Name</label>
                  <input className="input-field" placeholder="e.g. Camp Nou"
                    value={stadiumForm.name}
                    onChange={e => setStadiumForm({ ...stadiumForm, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>City</label>
                  <input className="input-field" placeholder="e.g. Barcelona"
                    value={stadiumForm.city}
                    onChange={e => setStadiumForm({ ...stadiumForm, city: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Country</label>
                  <input className="input-field" placeholder="e.g. Spain"
                    value={stadiumForm.country}
                    onChange={e => setStadiumForm({ ...stadiumForm, country: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Capacity</label>
                  <input className="input-field" type="number" placeholder="e.g. 99354"
                    value={stadiumForm.capacity}
                    onChange={e => setStadiumForm({ ...stadiumForm, capacity: e.target.value })} />
                </div>
              </div>
              <button className="btn-gold" style={{ marginTop: '20px' }} onClick={handleAddStadium}>
                + Add Stadium
              </button>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="fade-in">
            <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '24px' }}>
              ⚽ RECORD A GOAL
            </h2>
            <div className="gold-card" style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Match ID</label>
                  <input className="input-field" type="number" placeholder="e.g. 1"
                    value={goalForm.match_id}
                    onChange={e => setGoalForm({ ...goalForm, match_id: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Scorer Name</label>
                  <input className="input-field" placeholder="e.g. Lewandowski"
                    value={goalForm.scorer}
                    onChange={e => setGoalForm({ ...goalForm, scorer: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Minute</label>
                  <input className="input-field" type="number" placeholder="e.g. 23"
                    value={goalForm.minute}
                    onChange={e => setGoalForm({ ...goalForm, minute: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Team</label>
                  <select className="input-field"
                    value={goalForm.team}
                    onChange={e => setGoalForm({ ...goalForm, team: e.target.value })}>
                    <option value="home">Home Team</option>
                    <option value="away">Away Team</option>
                  </select>
                </div>
              </div>
              <button className="btn-gold" style={{ marginTop: '20px' }} onClick={handleRecordGoal}>
                ⚽ Record Goal & Notify Fans
              </button>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="fade-in">
            <h2 className="bebas" style={{ fontSize: '28px', letterSpacing: '3px', marginBottom: '24px' }}>
              💰 TICKET SALES
            </h2>
            {sales.length === 0 ? (
              <div className="gold-card" style={{ padding: '40px', textAlign: 'center' }}>
                <p className="bebas" style={{ fontSize: '24px', color: '#FFD700' }}>NO SALES YET</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sales.map(ticket => (
                  <div key={ticket.id} className="gold-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: '700', marginBottom: '4px' }}>
                          {ticket.fan.firstname} {ticket.fan.lastname}
                        </p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                          {ticket.match.home_club.name} vs {ticket.match.away_club.name} — {ticket.section.name}
                        </p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,215,0,0.6)', marginTop: '2px', fontFamily: 'monospace' }}>
                          {ticket.payment_reference}
                        </p>
                      </div>
                      <p className="bebas gold-text" style={{ fontSize: '24px' }}>
                        ₦{ticket.section.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}