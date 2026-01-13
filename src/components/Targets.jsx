import { useState, useEffect } from 'react';
import { getRandomQuote } from '../utils/spiritualQuotes';
import './Targets.css';

const Targets = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [targets, setTargets] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [newTarget, setNewTarget] = useState('');
  const [dailyQuote] = useState(() => getRandomQuote());
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    daysLeftInWeek: 0,
    daysLeftInMonth: 0
  });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculate time left
  const calculateTimeLeft = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const msLeft = endOfDay - now;
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    // Days left in week (Sunday = 0, Saturday = 6)
    const dayOfWeek = now.getDay();
    const daysLeftInWeek = 6 - dayOfWeek;
    
    // Days left in month
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysLeftInMonth = lastDayOfMonth - currentDay;
    
    setTimeLeft({
      hours: hoursLeft,
      minutes: minutesLeft,
      daysLeftInWeek,
      daysLeftInMonth
    });
  };

  // Check and auto-miss expired targets
  const checkAndAutoMissTargets = (currentTargets) => {
    const now = new Date();
    const today = now.toDateString();
    let updated = false;
    const newTargets = { ...currentTargets };

    // Check daily targets
    newTargets.daily = newTargets.daily.map(target => {
      if (target.date !== today && target.status === 'pending') {
        updated = true;
        return { ...target, status: 'missed' };
      }
      return target;
    });

    // Check weekly targets
    const currentWeek = getWeekNumber(now);
    newTargets.weekly = newTargets.weekly.map(target => {
      if (target.week < currentWeek && target.status === 'pending') {
        updated = true;
        return { ...target, status: 'missed' };
      }
      return target;
    });

    // Check monthly targets
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    newTargets.monthly = newTargets.monthly.map(target => {
      if (target.month !== currentMonth && target.status === 'pending') {
        updated = true;
        return { ...target, status: 'missed' };
      }
      return target;
    });

    if (updated) {
      setTargets(newTargets);
    }
  };

  const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  // Load targets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('habitgrid_targets');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTargets(parsed);
      checkAndAutoMissTargets(parsed);
    }
  }, []);

  // Save targets to localStorage
  useEffect(() => {
    if (targets) {
      localStorage.setItem('habitgrid_targets', JSON.stringify(targets));
    }
  }, [targets]);

  // Update time left every minute
  useEffect(() => {
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Check for expired targets every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndAutoMissTargets(targets);
    }, 60000);
    return () => clearInterval(interval);
  }, [targets]);

  const addTarget = () => {
    if (!newTarget.trim()) return;

    const now = new Date();
    const newTargetObj = {
      id: Date.now(),
      text: newTarget.trim(),
      status: 'pending',
      createdAt: now.toISOString()
    };

    if (activeTab === 'daily') {
      newTargetObj.date = now.toDateString();
    } else if (activeTab === 'weekly') {
      newTargetObj.week = getWeekNumber(now);
      newTargetObj.year = now.getFullYear();
    } else if (activeTab === 'monthly') {
      newTargetObj.month = `${now.getFullYear()}-${now.getMonth()}`;
      newTargetObj.monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    setTargets(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newTargetObj]
    }));
    setNewTarget('');
  };

  const toggleTargetStatus = (id) => {
    setTargets(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(target =>
        target.id === id
          ? { ...target, status: target.status === 'completed' ? 'pending' : 'completed' }
          : target
      )
    }));
  };

  const deleteTarget = (id) => {
    setTargets(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(target => target.id !== id)
    }));
  };

  const getStats = (type) => {
    const list = targets[type];
    const total = list.length;
    const completed = list.filter(t => t.status === 'completed').length;
    const missed = list.filter(t => t.status === 'missed').length;
    const pending = list.filter(t => t.status === 'pending').length;
    return { total, completed, missed, pending };
  };

  const renderTimeLeft = () => {
    if (activeTab === 'daily') {
      return (
        <div className="time-left-badge daily">
          <span className="time-icon">⏰</span>
          <span className="time-text">{timeLeft.hours}h {timeLeft.minutes}m left today</span>
        </div>
      );
    } else if (activeTab === 'weekly') {
      return (
        <div className="time-left-badge weekly">
          <span className="time-icon">📅</span>
          <span className="time-text">{timeLeft.daysLeftInWeek} days left this week</span>
        </div>
      );
    } else if (activeTab === 'monthly') {
      return (
        <div className="time-left-badge monthly">
          <span className="time-icon">📆</span>
          <span className="time-text">{timeLeft.daysLeftInMonth} days left this month</span>
        </div>
      );
    }
  };

  // Group targets by period
  const groupTargetsByPeriod = () => {
    const now = new Date();
    const grouped = {};

    if (activeTab === 'daily') {
      targets.daily.forEach(target => {
        const key = target.date;
        if (!grouped[key]) {
          grouped[key] = {
            targets: [],
            isCurrent: key === now.toDateString(),
            label: key === now.toDateString() ? 'Today' : new Date(key).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
          };
        }
        grouped[key].targets.push(target);
      });
    } else if (activeTab === 'weekly') {
      targets.weekly.forEach(target => {
        const key = `${target.year}-W${target.week}`;
        const currentWeek = getWeekNumber(now);
        const isCurrent = target.week === currentWeek && target.year === now.getFullYear();
        if (!grouped[key]) {
          grouped[key] = {
            targets: [],
            isCurrent,
            label: isCurrent ? 'This Week' : `Week ${target.week}, ${target.year}`
          };
        }
        grouped[key].targets.push(target);
      });
    } else if (activeTab === 'monthly') {
      targets.monthly.forEach(target => {
        const key = target.month;
        const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
        const isCurrent = key === currentMonth;
        if (!grouped[key]) {
          grouped[key] = {
            targets: [],
            isCurrent,
            label: isCurrent ? 'This Month' : target.monthName
          };
        }
        grouped[key].targets.push(target);
      });
    }

    // Sort by key descending (most recent first)
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  };

  // Get targets for selected date/week/month
  const getSelectedPeriodTargets = () => {
    if (activeTab === 'daily') {
      const dateStr = selectedDate.toDateString();
      return targets.daily.filter(t => t.date === dateStr);
    } else if (activeTab === 'weekly') {
      const week = getWeekNumber(selectedDate);
      const year = selectedDate.getFullYear();
      return targets.weekly.filter(t => t.week === week && t.year === year);
    } else if (activeTab === 'monthly') {
      const monthKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;
      return targets.monthly.filter(t => t.month === monthKey);
    }
    return [];
  };

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Check if date has targets
  const dateHasTargets = (date) => {
    if (!date) return false;
    
    if (activeTab === 'daily') {
      const dateStr = date.toDateString();
      return targets.daily.some(t => t.date === dateStr);
    } else if (activeTab === 'weekly') {
      const week = getWeekNumber(date);
      const year = date.getFullYear();
      return targets.weekly.some(t => t.week === week && t.year === year);
    } else if (activeTab === 'monthly') {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      return targets.monthly.some(t => t.month === monthKey);
    }
    return false;
  };

  // Navigate calendar
  const navigateCalendar = (direction) => {
    const newDate = new Date(calendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCalendarDate(newDate);
  };

  // Select date from calendar
  const selectDateFromCalendar = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const stats = getStats(activeTab);
  const groupedTargets = groupTargetsByPeriod();
  const selectedPeriodTargets = getSelectedPeriodTargets();
  const calendarDays = getCalendarDays();

  return (
    <div className="targets-container">
      <div className="targets-header">
        <div className="spiritual-banner">
          <div className="om-symbol">ॐ</div>
          <h1 className="targets-title">🎯 Targets</h1>
          <div className="radhe-text">✨ राधे राधे ✨</div>
        </div>
        <div className="sanskrit-motivation">
          <p className="sanskrit-text">{dailyQuote.sanskrit}</p>
          <p className="translation-text">"{dailyQuote.translation}" - {dailyQuote.deity}</p>
        </div>
        <p className="targets-subtitle">Set and track your daily, weekly, and monthly goals</p>
      </div>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          <span className="tab-icon">☀️</span>
          <span className="tab-text">Daily</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          <span className="tab-icon">📅</span>
          <span className="tab-text">Weekly</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          <span className="tab-icon">📆</span>
          <span className="tab-text">Monthly</span>
        </button>
        <div className="tab-indicator" style={{
          transform: `translateX(${activeTab === 'daily' ? '0' : activeTab === 'weekly' ? '100%' : '200%'})`
        }}></div>
      </div>

      <div className="targets-content">
        <div className="content-header">
          {renderTimeLeft()}
          <div className="stats-row">
            <div className="stat-chip pending">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{stats.pending}</span>
            </div>
            <div className="stat-chip completed">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{stats.completed}</span>
            </div>
            <div className="stat-chip missed">
              <span className="stat-label">Missed</span>
              <span className="stat-value">{stats.missed}</span>
            </div>
          </div>
        </div>

        <div className="add-target-form">
          <input
            type="text"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTarget()}
            placeholder={`Add a ${activeTab} target...`}
            className="target-input"
          />
          <button onClick={addTarget} className="add-btn">
            <span className="add-icon">+</span>
          </button>
        </div>

        <div className="main-layout">
          {/* Compact Calendar Sidebar */}
          <div className="calendar-sidebar">
            <div className="mini-calendar">
              <div className="mini-calendar-header">
                <button className="mini-nav-btn" onClick={() => navigateCalendar('prev')}>‹</button>
                <span className="mini-calendar-month">
                  {calendarDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button className="mini-nav-btn" onClick={() => navigateCalendar('next')}>›</button>
              </div>
              <div className="mini-calendar-grid">
                <div className="mini-weekday">S</div>
                <div className="mini-weekday">M</div>
                <div className="mini-weekday">T</div>
                <div className="mini-weekday">W</div>
                <div className="mini-weekday">T</div>
                <div className="mini-weekday">F</div>
                <div className="mini-weekday">S</div>
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="mini-day empty"></div>;
                  }
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const hasTargets = dateHasTargets(date);
                  return (
                    <div
                      key={index}
                      className={`mini-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasTargets ? 'has-targets' : ''}`}
                      onClick={() => selectDateFromCalendar(date)}
                      title={date.toDateString()}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Tasks Area */}
          <div className="tasks-area">
            {selectedDate.toDateString() !== new Date().toDateString() && (
              <button className="jump-today-btn" onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCalendarDate(today);
              }}>
                <span>⏪</span> Jump to Today
              </button>
            )}
            
            <h3 className="viewing-date-title">
              {activeTab === 'daily' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {activeTab === 'weekly' && `Week ${getWeekNumber(selectedDate)}, ${selectedDate.getFullYear()}`}
              {activeTab === 'monthly' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>

            {selectedPeriodTargets.length === 0 ? (
              <div className="no-targets-message">
                <span className="no-targets-icon">📭</span>
                <p>No {activeTab} targets on this {activeTab === 'daily' ? 'day' : activeTab === 'weekly' ? 'week' : 'month'}</p>
              </div>
            ) : (
              <div className="selected-targets-list">
                {selectedPeriodTargets.map((target, index) => {
                  const now = new Date();
                  const isCurrent = activeTab === 'daily' 
                    ? target.date === now.toDateString()
                    : activeTab === 'weekly'
                    ? target.week === getWeekNumber(now) && target.year === now.getFullYear()
                    : target.month === `${now.getFullYear()}-${now.getMonth()}`;
                  
                  return (
                    <div
                      key={target.id}
                      className={`target-item ${target.status} ${isCurrent ? 'current-period' : 'past-period'}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <button
                        className="checkbox"
                        onClick={() => toggleTargetStatus(target.id)}
                        disabled={target.status === 'missed' || !isCurrent}
                      >
                        {target.status === 'completed' && <span className="check-icon">✓</span>}
                        {target.status === 'missed' && <span className="miss-icon">✗</span>}
                      </button>
                      <div className="target-content">
                        <p className="target-text">{target.text}</p>
                        {target.status === 'missed' && (
                          <span className="missed-label">Auto-missed</span>
                        )}
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => deleteTarget(target.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="targets-list" style={{ display: 'none' }}>>
          {targets[activeTab].length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <p className="empty-text">No {activeTab} targets yet</p>
              <p className="empty-subtext">Add your first target to get started!</p>
            </div>
          ) : (
            groupedTargets.map(([periodKey, periodData]) => (
              <div key={periodKey} className="period-group">
                <div className="period-header">
                  <h3 className={`period-title ${periodData.isCurrent ? 'current' : 'past'}`}>
                    {periodData.isCurrent && <span className="current-badge">●</span>}
                    {periodData.label}
                  </h3>
                  <div className="period-stats">
                    <span className="period-stat completed">
                      ✓ {periodData.targets.filter(t => t.status === 'completed').length}
                    </span>
                    <span className="period-stat missed">
                      ✗ {periodData.targets.filter(t => t.status === 'missed').length}
                    </span>
                    <span className="period-stat pending">
                      ○ {periodData.targets.filter(t => t.status === 'pending').length}
                    </span>
                  </div>
                </div>
                <div className="period-targets">
                  {periodData.targets.map((target, index) => (
                    <div
                      key={target.id}
                      className={`target-item ${target.status} ${periodData.isCurrent ? 'current-period' : 'past-period'}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <button
                        className="checkbox"
                        onClick={() => toggleTargetStatus(target.id)}
                        disabled={target.status === 'missed' || !periodData.isCurrent}
                      >
                        {target.status === 'completed' && <span className="check-icon">✓</span>}
                        {target.status === 'missed' && <span className="miss-icon">✗</span>}
                      </button>
                      <div className="target-content">
                        <p className="target-text">{target.text}</p>
                        {target.status === 'missed' && (
                          <span className="missed-label">Auto-missed</span>
                        )}
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => deleteTarget(target.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Targets;