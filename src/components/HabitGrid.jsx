import React, { useState } from 'react';
import { getDaysInYear, formatDate, formatDateDisplay, getStats } from '../utils/dateUtils';
import { getRandomQuote } from '../utils/spiritualQuotes';
import './HabitGrid.css';

const HabitGrid = ({ habitName, habitData, onUpdateDay, onGoHome }) => {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const [dailyQuote] = useState(() => getRandomQuote());
  const days = getDaysInYear(2026);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPastDay = (date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isFutureDay = (date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  };

  const isCurrentDay = (date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  const handleDayClick = (date) => {
    // Only allow editing current day
    if (!isCurrentDay(date)) {
      return;
    }

    const dateStr = formatDate(date);
    const currentStatus = habitData[dateStr];
    
    let newStatus;
    if (!currentStatus) {
      newStatus = 'done';
    } else if (currentStatus === 'done') {
      newStatus = 'missed';
    } else {
      newStatus = null; // Reset to no data
    }
    
    onUpdateDay(dateStr, newStatus);
  };

  const handleMouseEnter = (e, date) => {
    const dateStr = formatDate(date);
    const status = habitData[dateStr];
    const past = isPastDay(date);
    const future = isFutureDay(date);
    const current = isCurrentDay(date);
    
    let statusText;
    if (status === 'done') {
      statusText = 'Completed';
    } else if (status === 'missed') {
      statusText = 'Missed';
    } else if (past && !status) {
      statusText = 'Auto-missed (past date)';
    } else if (future) {
      statusText = 'Future date (cannot edit)';
    } else if (current) {
      statusText = 'Today - Click to mark';
    } else {
      statusText = 'No data';
    }
    
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content: `${formatDateDisplay(date)}\n${statusText}`
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: '' });
  };

  const getDayClass = (date) => {
    const dateStr = formatDate(date);
    const status = habitData[dateStr];
    const past = isPastDay(date);
    const future = isFutureDay(date);
    const current = isCurrentDay(date);
    
    // If day is past and no status, show as missed (visually only)
    if (past && !status) {
      return 'day-cell auto-missed';
    }
    
    return `day-cell ${status || 'no-data'} ${past ? 'past' : ''} ${future ? 'future' : ''} ${current ? 'current' : ''}`;
  };

  // Create 12 month grids (traditional calendar view)
  const monthsData = [];
  
  for (let month = 0; month < 12; month++) {
    const monthStart = new Date(2026, month, 1);
    const monthEnd = new Date(2026, month + 1, 0);
    const daysInMonth = monthEnd.getDate();
    
    const monthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      monthDays.push(new Date(2026, month, day));
    }
    
    // Calculate padding days (empty cells before month starts)
    const firstDayOfWeek = monthStart.getDay();
    const paddingDays = firstDayOfWeek;
    
    monthsData.push({
      monthIndex: month,
      monthName: ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'][month],
      shortName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month],
      days: monthDays,
      paddingDays
    });
  }
  
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="habit-grid-container">
      <div className="grid-header">
        <div className="spiritual-banner">
          <div className="om-symbol">ॐ</div>
          <h2 className="grid-title">{habitName}</h2>
          <div className="radhe-text">✨ राधे राधे ✨</div>
        </div>
        {/* <p className="grid-subtitle">Click today's date to track: Gray → Green (Done) → Red (Missed). Past untracked days are auto-missed.</p> */}
        <div>
        <p className="sanskrit-motiva">{dailyQuote.sanskrit}</p>
          <p className="translation-text">"{dailyQuote.translation}" - {dailyQuote.deity}</p>
        </div>
        <div className="grid-header-actions">
          <button 
            className="jump-to-analytics-btn"
            onClick={() => document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            📊 View Analytics
          </button>
          {onGoHome && (
            <button className="go-home-btn" onClick={onGoHome}>
              🏠 Go Home
            </button>
          )}
        </div>
      </div>
      
      <div className="year-grid">
        {monthsData.map((monthData) => (
          <div key={monthData.monthIndex} className="month-card">
            <div className="month-header">
              <h3>{monthData.shortName}</h3>
            </div>
            
            <div className="month-weekdays">
              {weekdays.map((day, idx) => (
                <div key={idx} className="weekday-cell">{day}</div>
              ))}
            </div>
            
            <div className="month-days">
              {Array(monthData.paddingDays).fill(null).map((_, idx) => (
                <div key={`empty-${idx}`} className="day-cell empty" />
              ))}
              
              {monthData.days.map((day, idx) => (
                <div
                  key={idx}
                  className={getDayClass(day)}
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={(e) => handleMouseEnter(e, day)}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="day-number">{day.getDate()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {tooltip.show && (
        <div
          className="tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Analytics Section */}
      <div id="analytics-section" className="analytics-section">
        <div className="analytics-header-row">
          <h2 className="analytics-title">Year Overview</h2>
          {onGoHome && (
            <button className="go-home-btn" onClick={onGoHome}>
              🏠 Go Home
            </button>
          )}
        </div>
        <div className="stats-container">
          {(() => {
            const stats = getStats(habitData);
            return (
              <>
                <div className="stat-box">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-label">Total Tracked</div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-bar">
                      <div className="stat-bar-fill" style={{ width: '100%', background: '#58a6ff' }}></div>
                    </div>
                  </div>
                </div>

                <div className="stat-box success">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value">{stats.completed}</div>
                    <div className="stat-bar">
                      <div className="stat-bar-fill success-bar" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="stat-box danger">
                  <div className="stat-icon">❌</div>
                  <div className="stat-content">
                    <div className="stat-label">Missed</div>
                    <div className="stat-value">{stats.missed}</div>
                    <div className="stat-bar">
                      <div className="stat-bar-fill danger-bar" style={{ width: `${stats.total > 0 ? (stats.missed / stats.total * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="stat-box highlight">
                  <div className="stat-icon">📈</div>
                  <div className="stat-content">
                    <div className="stat-label">Success Rate</div>
                    <div className="stat-value">{stats.percentage}%</div>
                    <div className="stat-circle">
                      <svg viewBox="0 0 36 36" className="circular-chart">
                        <path className="circle-bg"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path className="circle"
                          strokeDasharray={`${stats.percentage}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="stat-box streak">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-content">
                    <div className="stat-label">Longest Streak</div>
                    <div className="stat-value">{stats.longestStreak}</div>
                    <div className="stat-sublabel">days in a row</div>
                  </div>
                </div>

                <div className="stat-box streak">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-content">
                    <div className="stat-label">Current Streak</div>
                    <div className="stat-value">{stats.currentStreak}</div>
                    <div className="stat-sublabel">days active</div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default HabitGrid;
