import { useState, useEffect } from 'react';
import './GoalTracker.css';

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

const GoalTracker = ({ onOpenGoalDetail }) => {
  const [goals, setGoals] = useState(() => loadGoals());
  const [expandedGoals, setExpandedGoals] = useState({});
  const [addingSubTarget, setAddingSubTarget] = useState(null);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDays, setNewGoalDays] = useState('');

  const [subTitle, setSubTitle] = useState('');
  const [subDays, setSubDays] = useState('');

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  const handleAddGoal = () => {
    const title = newGoalTitle.trim();
    const days = parseInt(newGoalDays);
    if (!title || !days || days < 1) return;

    const newGoal = {
      id: Date.now(),
      title,
      totalDays: days,
      startDate: new Date().toISOString(),
      status: 'active',
      subTargets: []
    };

    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalDays('');
    setShowAddGoal(false);
  };

  const handleStatusChange = (goalId, status) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status } : g));
  };

  const handleDeleteGoal = (goalId) => {
    if (!window.confirm('Delete this goal and all its sub-targets?')) return;
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const handleAddSubTarget = (goalId) => {
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
    setAddingSubTarget(null);
  };

  const handleSubStatusChange = (goalId, subId, status) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, subTargets: g.subTargets.map(s => s.id === subId ? { ...s, status } : s) }
        : g
    ));
  };

  const handleDeleteSubTarget = (goalId, subId) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, subTargets: g.subTargets.filter(s => s.id !== subId) }
        : g
    ));
  };

  const toggleExpanded = (goalId) => {
    setExpandedGoals(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const openAddSub = (goalId) => {
    setAddingSubTarget(goalId);
    setSubTitle('');
    setSubDays('');
    setExpandedGoals(prev => ({ ...prev, [goalId]: true }));
  };

  const activeCount = goals.filter(g => g.status === 'active').length;
  const completedCount = goals.filter(g => g.status === 'completed').length;
  const failedCount = goals.filter(g => g.status === 'failed').length;

  return (
    <div className="goal-tracker">
      <div className="goal-tracker-header">
        <div className="goal-tracker-title">
          <h2>Goals &amp; Targets</h2>
          <p>Set long-term goals with deadlines and sub-targets</p>
        </div>
        <div className="goal-stats-row">
          <div className="goal-stat-chip chip-active">
            <span className="chip-num">{activeCount}</span>
            <span className="chip-lbl">Active</span>
          </div>
          <div className="goal-stat-chip chip-done">
            <span className="chip-num">{completedCount}</span>
            <span className="chip-lbl">Done</span>
          </div>
          <div className="goal-stat-chip chip-failed">
            <span className="chip-num">{failedCount}</span>
            <span className="chip-lbl">Failed</span>
          </div>
        </div>
      </div>

      {/* Add Goal */}
      <div className="add-goal-section">
        {!showAddGoal ? (
          <button className="add-goal-btn" onClick={() => setShowAddGoal(true)}>
            + Add New Goal
          </button>
        ) : (
          <div className="add-goal-form">
            <h3>New Goal</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Goal title  (e.g. System Design)"
                value={newGoalTitle}
                onChange={e => setNewGoalTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
                className="goal-input"
                autoFocus
              />
              <div className="days-field">
                <input
                  type="number"
                  placeholder="Days"
                  value={newGoalDays}
                  onChange={e => setNewGoalDays(e.target.value)}
                  min="1"
                  className="goal-input days-input"
                  onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
                />
                <span className="days-label">days</span>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-save" onClick={handleAddGoal}>Add Goal</button>
              <button
                className="btn-cancel-gt"
                onClick={() => {
                  setShowAddGoal(false);
                  setNewGoalTitle('');
                  setNewGoalDays('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Goals List */}
      <div className="goals-list">
        {goals.length === 0 && (
          <div className="goals-empty">
            <div className="goals-empty-icon">🎯</div>
            <p>No goals yet. Add your first goal to get started!</p>
          </div>
        )}

        {goals.map(goal => {
          const daysLeft = getDaysLeft(goal.startDate, goal.totalDays);
          const progress = getProgressPercent(goal.startDate, goal.totalDays);
          const deadline = formatDeadline(goal.startDate, goal.totalDays);
          const isExpanded = expandedGoals[goal.id];
          const isOverdue = daysLeft === 0 && goal.status === 'active';
          const isUrgent = daysLeft <= 7 && daysLeft > 0 && goal.status === 'active';
          const completedSubs = goal.subTargets.filter(s => s.status === 'completed').length;

          return (
            <div
              key={goal.id}
              className={`goal-card goal-${goal.status}${isOverdue ? ' goal-overdue' : ''}`}
            >
              {/* Card Header */}
              <div className="goal-card-header">
                <div
                  className="goal-card-main"
                  onClick={() => toggleExpanded(goal.id)}
                >
                  <div className="goal-top-row">
                    <span className="goal-expand-icon">{isExpanded ? '▼' : '▶'}</span>
                    <h3 className="goal-title">{goal.title}</h3>
                    <span className={`goal-badge badge-${goal.status}`}>
                      {goal.status === 'active' ? 'Active' : goal.status === 'completed' ? '✓ Done' : '✗ Failed'}
                    </span>
                  </div>

                  <div className="goal-meta-row">
                    <span>{goal.totalDays} days total</span>
                    <span>Deadline: {deadline}</span>
                    {goal.status === 'active' && (
                      <span className={
                        isOverdue ? 'text-overdue' : isUrgent ? 'text-urgent' : 'text-safe'
                      }>
                        {isOverdue ? 'Overdue!' : `${daysLeft} days left`}
                      </span>
                    )}
                  </div>

                  {goal.status === 'active' && (
                    <div className="goal-progress-wrap">
                      <div className="goal-progress-bar">
                        <div
                          className="goal-progress-fill"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="goal-progress-pct">{progress}%</span>
                    </div>
                  )}

                  {goal.subTargets.length > 0 && (
                    <div className="goal-sub-summary">
                      {completedSubs}/{goal.subTargets.length} sub-targets done
                    </div>
                  )}
                </div>

                {/* Goal Actions */}
                <div className="goal-card-actions">
                  <button
                    className="gaction-btn gaction-view"
                    onClick={() => onOpenGoalDetail && onOpenGoalDetail(goal.id)}
                    title="View goal details"
                  >→</button>
                  {goal.status === 'active' && (
                    <>
                      <button
                        className="gaction-btn gaction-complete"
                        onClick={() => handleStatusChange(goal.id, 'completed')}
                        title="Mark completed"
                      >✓</button>
                      <button
                        className="gaction-btn gaction-fail"
                        onClick={() => handleStatusChange(goal.id, 'failed')}
                        title="Mark failed"
                      >✗</button>
                    </>
                  )}
                  {goal.status !== 'active' && (
                    <button
                      className="gaction-btn gaction-reopen"
                      onClick={() => handleStatusChange(goal.id, 'active')}
                      title="Reopen"
                    >↺</button>
                  )}
                  <button
                    className="gaction-btn gaction-delete"
                    onClick={() => handleDeleteGoal(goal.id)}
                    title="Delete goal"
                  >🗑</button>
                </div>
              </div>

              {/* Sub-targets Panel */}
              {isExpanded && (
                <div className="sub-targets-panel">
                  <div className="sub-panel-header">
                    <span className="sub-panel-title">Sub-targets</span>
                    <button
                      className="add-sub-btn"
                      onClick={() =>
                        addingSubTarget === goal.id
                          ? setAddingSubTarget(null)
                          : openAddSub(goal.id)
                      }
                    >
                      {addingSubTarget === goal.id ? '✕ Cancel' : '+ Add Sub-target'}
                    </button>
                  </div>

                  {addingSubTarget === goal.id && (
                    <div className="add-sub-form">
                      <input
                        type="text"
                        placeholder="Sub-target title (e.g. CAP Theorem)"
                        value={subTitle}
                        onChange={e => setSubTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddSubTarget(goal.id)}
                        className="goal-input"
                        autoFocus
                      />
                      <div className="days-field">
                        <input
                          type="number"
                          placeholder="Days"
                          value={subDays}
                          onChange={e => setSubDays(e.target.value)}
                          min="1"
                          className="goal-input days-input"
                          onKeyDown={e => e.key === 'Enter' && handleAddSubTarget(goal.id)}
                        />
                        <span className="days-label">days</span>
                      </div>
                      <button
                        className="btn-save"
                        onClick={() => handleAddSubTarget(goal.id)}
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {goal.subTargets.length === 0 && addingSubTarget !== goal.id && (
                    <p className="sub-empty-msg">
                      No sub-targets yet. Break this goal into smaller steps!
                    </p>
                  )}

                  {goal.subTargets.map(sub => {
                    const subLeft = getDaysLeft(sub.startDate, sub.totalDays);
                    const subProgress = getProgressPercent(sub.startDate, sub.totalDays);
                    const subDeadline = formatDeadline(sub.startDate, sub.totalDays);
                    const subOverdue = subLeft === 0 && sub.status === 'active';
                    const subUrgent = subLeft <= 3 && subLeft > 0 && sub.status === 'active';

                    return (
                      <div
                        key={sub.id}
                        className={`sub-item sub-${sub.status}${subOverdue ? ' sub-overdue' : ''}`}
                      >
                        <div className="sub-item-info">
                          <div className="sub-item-top">
                            <span className="sub-item-title">{sub.title}</span>
                            <span className={`sub-badge sub-badge-${sub.status}`}>
                              {sub.status === 'active' ? 'Active' : sub.status === 'completed' ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="sub-item-meta">
                            <span>{sub.totalDays}d total</span>
                            <span>Due: {subDeadline}</span>
                            {sub.status === 'active' && (
                              <span className={
                                subOverdue ? 'text-overdue' : subUrgent ? 'text-urgent' : 'text-safe'
                              }>
                                {subOverdue ? 'Overdue!' : `${subLeft}d left`}
                              </span>
                            )}
                          </div>
                          {sub.status === 'active' && (
                            <div className="sub-progress-bar">
                              <div
                                className="sub-progress-fill"
                                style={{ width: `${subProgress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        <div className="sub-item-actions">
                          {sub.status === 'active' && (
                            <>
                              <button
                                className="saction-btn saction-complete"
                                onClick={() => handleSubStatusChange(goal.id, sub.id, 'completed')}
                                title="Mark done"
                              >✓</button>
                              <button
                                className="saction-btn saction-fail"
                                onClick={() => handleSubStatusChange(goal.id, sub.id, 'failed')}
                                title="Mark failed"
                              >✗</button>
                            </>
                          )}
                          {sub.status !== 'active' && (
                            <button
                              className="saction-btn saction-reopen"
                              onClick={() => handleSubStatusChange(goal.id, sub.id, 'active')}
                              title="Reopen"
                            >↺</button>
                          )}
                          <button
                            className="saction-btn saction-delete"
                            onClick={() => handleDeleteSubTarget(goal.id, sub.id)}
                            title="Delete"
                          >×</button>
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
  );
};

export default GoalTracker;
