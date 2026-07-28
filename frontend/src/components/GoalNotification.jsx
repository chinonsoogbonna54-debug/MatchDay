import React, { useEffect, useRef } from 'react';

export default function GoalNotification({ goal, onDismiss }) {
  const audioRef = useRef(null);

  useEffect(() => {
    // Play crowd roar sound
    const audio = new Audio('https://www.soundjay.com/human/sounds/crowd-cheer-01.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {}); // catch autoplay policy errors silently

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="goal-notification" onClick={onDismiss}>
      <div className="goal-notification-card">
        <div className="goal-icon">⚽</div>
        <div>
          <div className="goal-title">GOAL!</div>
          <div className="goal-details">
            ⏱ {goal.minute}' — <strong>{goal.scorer}</strong>
          </div>
          <div className="goal-score">
            {goal.home_score} - {goal.away_score}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            Click to dismiss
          </div>
        </div>
        <div style={{
          position: 'absolute', top: '8px', right: '12px',
          fontSize: '11px', color: 'rgba(255,215,0,0.5)'
        }}>
          ✕
        </div>
      </div>
    </div>
  );
}