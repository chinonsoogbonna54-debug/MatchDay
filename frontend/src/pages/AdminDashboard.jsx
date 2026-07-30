import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [sales, setSales] = useState([]);
  const [activeTab, setActiveTab] = useState('matches');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clubForm, setClubForm] = useState({ name: '', short_name: '', country: '', logo_url: '' });
  const [stadiumForm, setStadiumForm] = useState({ name: '', city: '', country: '', capacity: '' });
  const [matchForm, setMatchForm] = useState({ home_club_id: '', away_club_id: '', stadium_id: '', date: '', season: '' });
  const [goalForm, setGoalForm] = useState({ match_id: '', scorer: '', minute: '', team: 'home' });
  const [sectionForm, setSectionForm] = useState({ stadium_id: '', name: '', price: '', total_seats: '' });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

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
      setSuccess('Club added!');
      setClubForm({ name: '', short_name: '', country: '', logo_url: '' });
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
  };

  const handleAddStadium = async () => {
    try {
      await API.post('/admin/stadiums', { ...stadiumForm, capacity: parseInt(stadiumForm.capacity) });
      setSuccess('Stadium added!');
      setStadiumForm({ name: '', city: '', country: '', capacity: '' });
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
  };

  const handleAddSection = async () => {
    try {
      await API.post(`/admin/stadiums/${sectionForm.stadium_id}/sections`, {
        name: sectionForm.name,
        price: parseFloat(sectionForm.price),
        total_seats: parseInt(sectionForm.total_seats)
      });
      setSuccess('Section added!');
      setSectionForm({ stadium_id: '', name: '', price: '', total_seats: '' });
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
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
      setSuccess('Match created!');
      setMatchForm({ home_club_id: '', away_club_id: '', stadium_id: '', date: '', season: '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
  };

  const handleRecordGoal = async () => {
    try {
      await API.post('/notifications/goal', {
        match_id: parseInt(goalForm.match_id),
        scorer: goalForm.scorer,
        minute: parseInt(goalForm.minute),
        team: goalForm.team
      });
      setSuccess(`Goal! ${goalForm.scorer} scores!`);
      setGoalForm({ match_id: '', scorer: '', minute: '', team: 'home' });
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
  };

  const handleUpdateMatchStatus = async (matchId, status) => {
    try {
      await API.post('/notifications/match-update', { match_id: matchId, status });
      setSuccess(`Match ${status}!`);
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
  };

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="football-loader">⚽</div>
        <div className="loader-text">LOADING ADMIN</div>
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>
    );
  }

  const inputStyle = { marginBottom: '12px' };
  const labelStyle = { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' };
  const tabs = ['matches', 'clubs', 'stadiums', 'sections', 'goals', 'sales'];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <video className="video-bg" autoPlay muted loop playsInline>
        <source src="/videos/football.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <nav className="navbar">
        <div className="navbar-logo">🛡️ ADMIN</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#FFD700' }}>Admin Panel</span>
          <button onClick={handleLogout} style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '6px 12px', color: '#ef4444',
            cursor: 'pointer', fontSize: '12px', fontWeight: '700'
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '32px 20px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <div style={{ marginBottom: '32px' }} className="fade-in">
          <h1 className="bebas" style={{ fontSize: 'clamp(32px, 6vw, 52px)', letterSpacing: '4px' }}>
            ADMIN <span className="gold-text">DASHBOARD</span>
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Matches', value: matches.length, icon: '🏟️' },
            { label: 'Tickets Sold', value: sales.length, icon: '🎟️' },
            { label: 'Revenue', value: `₦${sales.reduce((sum, t) => sum + t.section.price, 0).toLocaleString()}`, icon: '💰' },
          ].map((stat, i) => (
            <div key={i} className="gold-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{stat.icon}</div>
              <p className="bebas gold-text" style={{ fontSize: '28px' }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '16px' }} onClick={() => setError('')}>{error} ✕</div>}
        {success && <div className="success-msg" style={{ marginBottom: '16px' }} onClick={() => setSuccess('')}>{success} ✕</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? 'linear-gradient(135deg, #FFD700, #FFC200)' : 'rgba(0,0,0,0.5)',
              border: activeTab === tab ? 'none' : '1px solid rgba(255,215,0,0.3)',
              borderRadius: '8px', padding: '7px 16px',
              color: activeTab === tab ? '#000' : '#FFD700',
              cursor: 'pointer', fontSize: '12px', fontWeight: '800',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}>{tab}</button>
          ))}
        </div>

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="fade-in">
            <div className="gold-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h2 className="bebas" style={{ fontSize: '22px', letterSpacing: '2px', marginBottom: '16px', color: '#FFD700' }}>
                ➕ ADD MATCH
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Home Club ID', key: 'home_club_id', placeholder: 'e.g. 1' },
                  { label: 'Away Club ID', key: 'away_club_id', placeholder: 'e.g. 2' },
                  { label: 'Stadium ID', key: 'stadium_id', placeholder: 'e.g. 1' },
                  { label: 'Season', key: 'season', placeholder: '2025/2026' },
                ].map(f => (
                  <div key={f.key} style={inputStyle}>
                    <label style={labelStyle}>{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder}
                      value={matchForm[f.key]}
                      onChange={e => setMatchForm({ ...matchForm, [f.key]: e.target.value })} />
                  </div>
                ))}
                <div style={{ ...inputStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Date (YYYY-MM-DD HH:MM)</label>
                  <input className="input-field" placeholder="2026-08-15 20:00"
                    value={matchForm.date}
                    onChange={e => setMatchForm({ ...matchForm, date: e.target.value })} />
                </div>
              </div>
              <button className="btn-gold" style={{ marginTop: '8px' }} onClick={handleAddMatch}>+ Create Match</button>
            </div>

            <h2 className="bebas" style={{ fontSize: '22px', letterSpacing: '2px', marginBottom: '16px' }}>📋 ALL MATCHES</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {matches.map(match => (
                <div key={match.id} className="gold-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <p className="bebas" style={{ fontSize: '18px' }}>
                        {match.home_club.name} <span className="gold-text">VS</span> {match.away_club.name}
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        🏟️ {match.stadium.name} | ⚽ {match.home_score} - {match.away_score} | ID: {match.id}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className={`badge ${match.status === 'live' ? 'badge-live' : ''}`} style={{ fontSize: '11px' }}>
                        {match.status.toUpperCase()}
                      </span>
                      {match.status === 'upcoming' && (
                        <button onClick={() => handleUpdateMatchStatus(match.id, 'live')} style={{
                          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                          borderRadius: '6px', padding: '4px 8px', color: '#ef4444',
                          cursor: 'pointer', fontSize: '11px', fontWeight: '700'
                        }}>▶ Start</button>
                      )}
                      {match.status === 'live' && (
                        <button onClick={() => handleUpdateMatchStatus(match.id, 'finished')} style={{
                          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                          borderRadius: '6px', padding: '4px 8px', color: '#10b981',
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
            <div className="gold-card" style={{ padding: '24px' }}>
              <h2 className="bebas" style={{ fontSize: '22px', letterSpacing: '2px', marginBottom: '16px', color: '#FFD700' }}>
                ➕ ADD CLUB
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Club Name', key: 'name', placeholder: 'FC Barcelona' },
                  { label: 'Short Name', key: 'short_name', placeholder: 'BAR' },
                  { label: 'Country', key: 'country', placeholder: 'Spain' },
                  { label: 'Logo URL', key: 'logo_url', placeholder: 'https://...' },
                ].map(f => (
                  <div key={f.key} style={inputStyle}>
                    <label style={labelStyle}>{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder}
                      value={clubForm[f.key]}
                      onChange={e => setClubForm({ ...clubForm, [f.key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <button className="btn-gold" style={{ marginTop: '8px' }} onClick={handleAddClub}>+ Add Club</button>
            </div>
          </div>
        )}

        {/* Stadiums Tab */}
        {activeTab === 'stadiums' && (
          <div className="fade-in">
            <div className="gold-card" style={{ padding: '24px' }}>
              <h2 className="bebas" style={{ fontSize: '22px', letterSpacing: '2px', marginBottom: '16px', color: '#FFD700' }}>
                ➕ ADD STADIUM
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Stadium Name', key: 'name', placeholder: 'Camp Nou' },
                  { label: 'City', key: 'city', placeholder: 'Barcelona' },
                  { label: 'Country', key: 'country', placeholder: 'Spain' },
                  { label: 'Capacity', key: 'capacity', placeholder: '99354' },
                ].map(f => (
                  <div key={f.key} style={inputStyle}>
                    <label style={labelStyle}>{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder}
                      value={stadiumForm[f.key]}
                      onChange={e => setStadiumForm({ ...stadiumForm, [f.key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <button className="btn-gold" style={{ marginTop: '8px' }} onClick={handleAddStadium}>+ Add Stadium</button>
            </div>
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="fade-in">
            <div className="gold-card" style={{ padding: '24px' }}>
              <h2 className="bebas" style={{ fontSize: '22px', letterSpacing: '2px', marginBottom: '16px', color: '#FFD700' }}>
                ➕ ADD STADIUM SECTION
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Stadium ID', key: 'stadium_id', placeholder: 'e.g. 1' },
                  { label: 'Section Name', key: 'name', placeholder: 'VIP' },
                  { label: 'Price (₦)', key: 'price', placeholder: '50000' },
                  { label: 'Total Seats', key: 'total_seats', placeholder: '500' },
                ].map(f => (
                  <div key={f.key} style={inputStyle}>
                    <label style={labelStyle}>{f.label}</label>
                    <input className="input-field" placeholder={f.placeholder}
                      value={sectionForm[f.key]}
                      onChange={e => setSectionForm({ ...sectionForm, [f.key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <button className="btn-gold" style={{ marginTop: '8px' }} onClick={handleAddSection}>+ Add Section</button>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="fade-in">
            <div className="gold-card" style={{ padding: '24px' }}>
              <h2 className="bebas" style={{ fontSize: '22px', letterSpacing: '2px', marginBottom: '16px', color: '#FFD700' }}>
                ⚽ RECORD GOAL
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={inputStyle}>
                  <label style={labelStyle}>Match ID</label>
                  <input className="input-field" placeholder="e.g. 1"
                    value={goalForm.match_id}
                    onChange={e => setGoalForm({ ...goalForm, match_id: e.target.value })} />
                </div>
                <div style={inputStyle}>
                  <label style={labelStyle}>Scorer Name</label>
                  <input className="input-field" placeholder="e.g. Lewandowski"
                    value={goalForm.scorer}
                    onChange={e => setGoalForm({ ...goalForm, scorer: e.target.value })} />
                </div>
                <div style={inputStyle}>
                  <label style={labelStyle}>Minute</label>
                  <input className="input-field" type="number" placeholder="e.g. 23"
                    value={goalForm.minute}
                    onChange={e => setGoalForm({ ...goalForm, minute: e.target.value })} />
                </div>
                <div style={inputStyle}>
                  <label style={labelStyle}>Team</label>
                  <select className="input-field" value={goalForm.team}
                    onChange={e => setGoalForm({ ...goalForm, team: e.target.value })}>
                    <option value="home">Home Team</option>
                    <option value="away">Away Team</option>
                  </select>
                </div>
              </div>
              <button className="btn-gold" style={{ marginTop: '8px' }} onClick={handleRecordGoal}>
                ⚽ Record Goal & Notify Fans
              </button>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="fade-in">
            <h2 className="bebas" style={{ fontSize: '22px', letterSpacing: '2px', marginBottom: '16px' }}>💰 TICKET SALES</h2>
            {sales.length === 0 ? (
              <div className="gold-card" style={{ padding: '40px', textAlign: 'center' }}>
                <p className="bebas" style={{ fontSize: '24px', color: '#FFD700' }}>NO SALES YET</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sales.map(ticket => (
                  <div key={ticket.id} className="gold-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '14px' }}>
                          {ticket.fan.firstname} {ticket.fan.lastname}
                        </p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                          {ticket.match.home_club.name} vs {ticket.match.away_club.name} — {ticket.section.name}
                        </p>
                        <p style={{ fontSize: '10px', color: 'rgba(255,215,0,0.5)', fontFamily: 'monospace' }}>
                          {ticket.payment_reference}
                        </p>
                      </div>
                      <p className="bebas gold-text" style={{ fontSize: '20px' }}>
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