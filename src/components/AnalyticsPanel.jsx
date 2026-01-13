import React from 'react';
import { getStats } from '../utils/dateUtils';
import './AnalyticsPanel.css';

const AnalyticsPanel = ({ habitName, habitData }) => {
  const stats = getStats(habitData);

  return (
    <div className="analytics-panel">
      <h3>Analytics</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Days</div>
        </div>

        <div className="stat-card success">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>

        <div className="stat-card danger">
          <div className="stat-value">{stats.missed}</div>
          <div className="stat-label">Missed</div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-value">{stats.percentage}%</div>
          <div className="stat-label">Success Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.longestStreak}</div>
          <div className="stat-label">Longest Streak</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">Current Streak</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
