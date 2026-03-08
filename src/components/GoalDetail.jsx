import { useState, useEffect } from 'react';
import './GoalDetail.css';

const STORAGE_KEY = 'habitgrid_goals';

const loadGoals = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveGoals = (goals) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
};

const getDaysLeft = (startDate, totalDays) => {
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + totalDays);
  const diffMs = deadline - new Date();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

const getHoursLeft = (startDate, totalDays) => {
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + totalDays);
  const diffMs = deadline - new Date();
  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, expired: false };
};

const formatDeadline = (startDate, totalDays) => {
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + totalDays);
  return deadline.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const getProgressPercent = (startDate, totalDays) => {
  const start = new Date(startDate);
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + totalDays);
  const elapsed = new Date() - start;
  const total = deadline - start;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

const formatStartDate = (startDate) => {
  return new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const GoalDetail = ({ goalId, onBack }) => {
  const [goals, setGoals] = useState(() => loadGoals());
  const [subTitle, setSubTitle] = useState('');
  const [subDays, setSubDays] = useState('');
  const [showAddSub, setShowAddSub] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  const goal = goals.find(g => g.id === goalId);

  if (!goal) {
    return (
      <div className="gd-container">
        <div className="gd-not-found">
          <p>Goal not found.</p>
          <button className="gd-back-btn" onClick={onBack}>← Back to Goals</button>
        </div>
      </div>
    );
  }

  const timeLeft = getHoursLeft(goal.startDate, goal.totalDays);
  const deadline = formatDeadline(goal.startDate, goal.totalDays);
  const progress = getProgressPercent(goal.startDate, goal.totalDays);
  const daysLeft = getDaysLeft(goal.startDate, goal.totalDays);
  const isOverdue = daysLeft === 0 && goal.status === 'active';
  const completedSubs = goal.subTargets.filter(s => s.status === 'completed').length;
  const totalSubs = goal.subTargets.length;

  const handleStatusChange = (status) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status } : g));
  };

  const handleAddSubTarget = () => {
    const title = subTitle.trim();
    const days = parseInt(subDays);
    if (!title || !days || days < 1) return;

    const newSub = {
      id: Date.now(),
      title,
      totalDays: days,
      startDate: new Date().toISOString(),
      status: 'active'
    };

    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, subTargets: [...g.subTargets, newSub] }
        : g
    ));
    setSubTitle('');
    setSubDays('');
    setShowAddSub(false);
  };

  const handleSubStatusChange = (subId, status) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, subTargets: g.subTargets.map(s => s.id === subId ? { ...s, status } : s) }
        : g
    ));
  };

  const handleDeleteSubTarget = (subId) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, subTargets: g.subTargets.filter(s => s.id !== subId) }
        : g
    ));
  };

  return (
    <div className="gd-container">
      {/* Back Button */}
      <button className="gd-back-btn" onClick={onBack}>← Back to Goals</button>

      {/* Hero Section */}
      <div className="gd-hero">
        <div className="gd-hero-top">
          <h1 className="gd-hero-title">{goal.title}</h1>
          <span className={`gd-status-badge gd-badge-${goal.status}`}>
            {goal.status === 'active' ? '● Active' : goal.status === 'completed' ? '✓ Completed' : '✗ Failed'}
          </span>
        </div>

        {/* Big Countdown */}
        <div className={`gd-countdown ${timeLeft.expired ? 'expired' : ''}`}>
          {timeLeft.expired ? (
            <div className="gd-countdown-expired">⏰ Deadline Passed</div>
          ) : (
            <div className="gd-countdown-grid">
              <div className="gd-countdown-unit">
                <span className="gd-countdown-num">{timeLeft.days}</span>
                <span className="gd-countdown-label">Days</span>
              </div>
              <span className="gd-countdown-sep">:</span>
              <div className="gd-countdown-unit">
                <span className="gd-countdown-num">{timeLeft.hours}</span>
                <span className="gd-countdown-label">Hours</span>
              </div>
              <span className="gd-countdown-sep">:</span>
              <div className="gd-countdown-unit">
                <span className="gd-countdown-num">{timeLeft.minutes}</span>
                <span className="gd-countdown-label">Min</span>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="gd-info-cards">
          <div className="gd-info-card">
            <span className="gd-info-icon">📅</span>
            <div>
              <span className="gd-info-label">Started</span>
              <span className="gd-info-value">{formatStartDate(goal.startDate)}</span>
            </div>
          </div>
          <div className="gd-info-card">
            <span className="gd-info-icon">🏁</span>
            <div>
              <span className="gd-info-label">Deadline</span>
              <span className="gd-info-value">{deadline}</span>
            </div>
          </div>
          <div className="gd-info-card">
            <span className="gd-info-icon">⏳</span>
            <div>
              <span className="gd-info-label">Total Duration</span>
              <span className="gd-info-value">{goal.totalDays} days</span>
            </div>
          </div>
          <div className="gd-info-card">
            <span className="gd-info-icon">📊</span>
            <div>
              <span className="gd-info-label">Sub-targets</span>
              <span className="gd-info-value">{completedSubs}/{totalSubs} done</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {goal.status === 'active' && (
          <div className="gd-progress-section">
            <div className="gd-progress-header">
              <span>Time Elapsed</span>
              <span>{progress}%</span>
            </div>
            <div className="gd-progress-bar">
              <div className="gd-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {/* Goal Actions */}
        <div className="gd-goal-actions">
          {goal.status === 'active' && (
            <>
              <button className="gd-action-btn gd-action-complete" onClick={() => handleStatusChange('completed')}>
                ✓ Mark Completed
              </button>
              <button className="gd-action-btn gd-action-fail" onClick={() => handleStatusChange('failed')}>
                ✗ Mark Failed
              </button>
            </>
          )}
          {goal.status !== 'active' && (
            <button className="gd-action-btn gd-action-reopen" onClick={() => handleStatusChange('active')}>
              ↺ Reopen Goal
            </button>
          )}
        </div>
      </div>

      {/* Sub-targets Section */}
      <div className="gd-sub-section">
        <div className="gd-sub-header">
          <h2 className="gd-sub-title">Sub-targets ({totalSubs})</h2>
          <button
            className="gd-add-sub-btn"
            onClick={() => setShowAddSub(!showAddSub)}
          >
            {showAddSub ? '✕ Cancel' : '+ Add Sub-target'}
          </button>
        </div>

        {/* Add sub-target form */}
        {showAddSub && (
          <div className="gd-add-sub-form">
            <input
              type="text"
              placeholder="Sub-target title (e.g. CAP Theorem, Load Balancing)"
              value={subTitle}
              onChange={e => setSubTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubTarget()}
              className="gd-input"
              autoFocus
            />
            <div className="gd-days-field">
              <input
                type="number"
                placeholder="Days"
                value={subDays}
                onChange={e => setSubDays(e.target.value)}
                min="1"
                className="gd-input gd-days-input"
                onKeyDown={e => e.key === 'Enter' && handleAddSubTarget()}
              />
              <span className="gd-days-label">days</span>
            </div>
            <button className="gd-save-btn" onClick={handleAddSubTarget}>Add</button>
          </div>
        )}

        {/* Sub-targets list */}
        {totalSubs === 0 && !showAddSub ? (
          <div className="gd-sub-empty">
            <div className="gd-sub-empty-icon">📝</div>
            <p>No sub-targets yet.</p>
            <p className="gd-sub-empty-hint">Break this goal into smaller, manageable steps!</p>
          </div>
        ) : (
          <div className="gd-sub-list">
            {goal.subTargets.map((sub, index) => {
              const subTime = getHoursLeft(sub.startDate, sub.totalDays);
              const subDaysLeft = getDaysLeft(sub.startDate, sub.totalDays);
              const subProgress = getProgressPercent(sub.startDate, sub.totalDays);
              const subDeadline = formatDeadline(sub.startDate, sub.totalDays);
              const subOverdue = subDaysLeft === 0 && sub.status === 'active';
              const subUrgent = subDaysLeft <= 3 && subDaysLeft > 0 && sub.status === 'active';

              return (
                <div
                  key={sub.id}
                  className={`gd-sub-card gd-sub-${sub.status}${subOverdue ? ' gd-sub-overdue' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="gd-sub-card-top">
                    <div className="gd-sub-card-left">
                      <span className="gd-sub-num">#{index + 1}</span>
                      <h3 className="gd-sub-card-title">{sub.title}</h3>
                      <span className={`gd-sub-status-badge gd-sbadge-${sub.status}`}>
                        {sub.status === 'active' ? 'Active' : sub.status === 'completed' ? '✓ Done' : '✗ Failed'}
                      </span>
                    </div>
                    <div className="gd-sub-card-actions">
                      {sub.status === 'active' && (
                        <>
                          <button
                            className="gd-sbtn gd-sbtn-done"
                            onClick={() => handleSubStatusChange(sub.id, 'completed')}
                            title="Mark done"
                          >✓</button>
                          <button
                            className="gd-sbtn gd-sbtn-fail"
                            onClick={() => handleSubStatusChange(sub.id, 'failed')}
                            title="Mark failed"
                          >✗</button>
                        </>
                      )}
                      {sub.status !== 'active' && (
                        <button
                          className="gd-sbtn gd-sbtn-reopen"
                          onClick={() => handleSubStatusChange(sub.id, 'active')}
                          title="Reopen"
                        >↺</button>
                      )}
                      <button
                        className="gd-sbtn gd-sbtn-delete"
                        onClick={() => handleDeleteSubTarget(sub.id)}
                        title="Delete"
                      >×</button>
                    </div>
                  </div>

                  {/* Sub-target countdown + details */}
                  <div className="gd-sub-card-body">
                    <div className="gd-sub-time-row">
                      {sub.status === 'active' && (
                        <div className={`gd-sub-countdown ${subTime.expired ? 'expired' : subUrgent ? 'urgent' : ''}`}>
                          {subTime.expired
                            ? '⏰ Expired'
                            : `⏱ ${subTime.days}d ${subTime.hours}h ${subTime.minutes}m left`}
                        </div>
                      )}
                      <div className="gd-sub-meta">
                        <span>{sub.totalDays} days total</span>
                        <span>Due: {subDeadline}</span>
                        <span>Started: {formatStartDate(sub.startDate)}</span>
                      </div>
                    </div>
                    {sub.status === 'active' && (
                      <div className="gd-sub-progress-wrap">
                        <div className="gd-sub-progress">
                          <div className="gd-sub-progress-fill" style={{ width: `${subProgress}%` }}></div>
                        </div>
                        <span className="gd-sub-progress-pct">{subProgress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalDetail;
