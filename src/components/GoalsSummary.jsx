import { useState, useEffect } from 'react';
import './GoalsSummary.css';

const STORAGE_KEY = 'habitgrid_goals';

const loadGoals = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const getDaysLeft = (startDate, totalDays) => {
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + totalDays);
  const diffMs = deadline - new Date();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

const formatDeadline = (startDate, totalDays) => {
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + totalDays);
  return deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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

const GoalsSummary = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const refresh = () => setGoals(loadGoals());
    refresh();
    // Refresh every 30 seconds so countdowns stay fresh
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalGoals = goals.length;
  const totalSubs = goals.reduce((acc, g) => acc + g.subTargets.length, 0);
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const failedGoals = goals.filter(g => g.status === 'failed').length;
  const overdueCount = goals.filter(
    g => g.status === 'active' && getDaysLeft(g.startDate, g.totalDays) === 0
  ).length;

  // Flatten all ACTIVE goals + sub-targets into one urgency-sorted list
  const urgencyList = goals
    .flatMap(goal => [
      { ...goal, itemType: 'goal', parentTitle: null },
      ...goal.subTargets.map(sub => ({
        ...sub,
        itemType: 'sub',
        parentTitle: goal.title
      }))
    ])
    .filter(item => item.status === 'active')
    .sort(
      (a, b) =>
        getDaysLeft(a.startDate, a.totalDays) -
        getDaysLeft(b.startDate, b.totalDays)
    );

  return (
    <div className="goals-summary">
      {/* Header */}
      <div className="gs-header">
        <div>
          <h2 className="gs-title">Goals Overview</h2>
          <p className="gs-subtitle">Combined view of all goals &amp; sub-targets with time remaining</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="gs-stats-grid">
        <div className="gs-stat">
          <span className="gs-stat-num">{totalGoals}</span>
          <span className="gs-stat-lbl">Total Goals</span>
        </div>
        <div className="gs-stat">
          <span className="gs-stat-num">{totalSubs}</span>
          <span className="gs-stat-lbl">Sub-targets</span>
        </div>
        <div className="gs-stat gs-stat-active">
          <span className="gs-stat-num">{activeGoals}</span>
          <span className="gs-stat-lbl">Active</span>
        </div>
        <div className="gs-stat gs-stat-done">
          <span className="gs-stat-num">{completedGoals}</span>
          <span className="gs-stat-lbl">Completed</span>
        </div>
        <div className="gs-stat gs-stat-fail">
          <span className="gs-stat-num">{failedGoals}</span>
          <span className="gs-stat-lbl">Failed</span>
        </div>
        {overdueCount > 0 && (
          <div className="gs-stat gs-stat-overdue">
            <span className="gs-stat-num">{overdueCount}</span>
            <span className="gs-stat-lbl">Overdue</span>
          </div>
        )}
      </div>

      {goals.length === 0 && (
        <div className="gs-empty">
          <div className="gs-empty-icon">📊</div>
          <p>No goals yet. Head to the <strong>Goals</strong> section to add your first goal!</p>
        </div>
      )}

      {/* Urgency Timeline */}
      {urgencyList.length > 0 && (
        <div className="gs-section">
          <h3 className="gs-section-title">
            Active Deadlines — Sorted by Urgency
          </h3>
          <div className="gs-timeline">
            {urgencyList.map(item => {
              const daysLeft = getDaysLeft(item.startDate, item.totalDays);
              const progress = getProgressPercent(item.startDate, item.totalDays);
              const deadline = formatDeadline(item.startDate, item.totalDays);
              const isOverdue = daysLeft === 0;
              const isUrgent = daysLeft <= 7 && !isOverdue;

              return (
                <div
                  key={`${item.itemType}-${item.id}`}
                  className={`gs-timeline-item type-${item.itemType}${isOverdue ? ' tl-overdue' : isUrgent ? ' tl-urgent' : ''}`}
                >
                  <div className="gs-tl-dot"></div>
                  <div className="gs-tl-body">
                    {item.itemType === 'sub' && (
                      <span className="gs-tl-parent">↳ {item.parentTitle}</span>
                    )}
                    <div className="gs-tl-top">
                      <span className="gs-tl-title">{item.title}</span>
                      <span
                        className={`gs-tl-days ${isOverdue ? 'tl-text-overdue' : isUrgent ? 'tl-text-urgent' : 'tl-text-safe'}`}
                      >
                        {isOverdue ? 'Overdue!' : `${daysLeft}d left`}
                      </span>
                    </div>
                    <div className="gs-tl-meta">
                      <span>{item.totalDays} days total</span>
                      <span>Due: {deadline}</span>
                      <span>{progress}% elapsed</span>
                    </div>
                    <div className="gs-tl-progress">
                      <div
                        className="gs-tl-progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Breakdown */}
      {goals.length > 0 && (
        <div className="gs-section">
          <h3 className="gs-section-title">
            All Goals &amp; Sub-targets Breakdown
          </h3>
          <div className="gs-breakdown">
            {goals.map(goal => {
              const daysLeft = getDaysLeft(goal.startDate, goal.totalDays);
              const progress = getProgressPercent(goal.startDate, goal.totalDays);
              const deadline = formatDeadline(goal.startDate, goal.totalDays);
              const completedSubs = goal.subTargets.filter(s => s.status === 'completed').length;
              const isOverdue = daysLeft === 0 && goal.status === 'active';
              const isUrgent = daysLeft <= 7 && daysLeft > 0 && goal.status === 'active';

              return (
                <div
                  key={goal.id}
                  className={`gs-goal-row status-${goal.status}`}
                >
                  {/* Goal row */}
                  <div className="gs-goal-header">
                    <div className="gs-goal-left">
                      <span className="gs-goal-title">{goal.title}</span>
                      <span className={`gs-badge gs-badge-${goal.status}`}>
                        {goal.status === 'active'
                          ? 'Active'
                          : goal.status === 'completed'
                          ? '✓ Done'
                          : '✗ Failed'}
                      </span>
                    </div>
                    <div className="gs-goal-right">
                      <span className="gs-goal-meta-item">{goal.totalDays}d</span>
                      {goal.status === 'active' && (
                        <span
                          className={`gs-goal-meta-item ${isOverdue ? 'tl-text-overdue' : isUrgent ? 'tl-text-urgent' : 'tl-text-safe'}`}
                        >
                          {isOverdue ? 'Overdue!' : `${daysLeft}d left`}
                        </span>
                      )}
                      <span className="gs-goal-meta-item">Due: {deadline}</span>
                    </div>
                  </div>

                  {goal.status === 'active' && (
                    <div className="gs-goal-progress-wrap">
                      <div className="gs-goal-progress">
                        <div
                          className="gs-goal-progress-fill"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="gs-goal-progress-pct">{progress}%</span>
                    </div>
                  )}

                  {/* Sub-target rows */}
                  {goal.subTargets.length > 0 && (
                    <div className="gs-sub-list">
                      <div className="gs-sub-count">
                        {completedSubs}/{goal.subTargets.length} sub-targets completed
                      </div>
                      {goal.subTargets.map(sub => {
                        const subLeft = getDaysLeft(sub.startDate, sub.totalDays);
                        const subPct = getProgressPercent(sub.startDate, sub.totalDays);
                        const subDeadline = formatDeadline(sub.startDate, sub.totalDays);
                        const subOverdue = subLeft === 0 && sub.status === 'active';
                        const subUrgent = subLeft <= 3 && subLeft > 0 && sub.status === 'active';

                        return (
                          <div
                            key={sub.id}
                            className={`gs-sub-row sub-status-${sub.status}`}
                          >
                            <span className={`gs-sub-dot dot-${sub.status}`}></span>
                            <div className="gs-sub-body">
                              <div className="gs-sub-top">
                                <span className="gs-sub-title">{sub.title}</span>
                                <div className="gs-sub-right">
                                  <span className="gs-sub-meta-item">{sub.totalDays}d</span>
                                  {sub.status === 'active' && (
                                    <span
                                      className={`gs-sub-meta-item ${subOverdue ? 'tl-text-overdue' : subUrgent ? 'tl-text-urgent' : 'tl-text-safe'}`}
                                    >
                                      {subOverdue ? 'Overdue!' : `${subLeft}d left`}
                                    </span>
                                  )}
                                  <span className="gs-sub-meta-item">Due: {subDeadline}</span>
                                  <span className={`gs-sub-badge gs-badge-${sub.status}`}>
                                    {sub.status === 'active' ? 'Active' : sub.status === 'completed' ? '✓' : '✗'}
                                  </span>
                                </div>
                              </div>
                              {sub.status === 'active' && (
                                <div className="gs-sub-progress">
                                  <div
                                    className="gs-sub-progress-fill"
                                    style={{ width: `${subPct}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSummary;
