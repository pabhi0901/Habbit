import React, { useState } from 'react';
import './Sidebar.css';

import AnalyticsPanel from './AnalyticsPanel';

const Sidebar = ({ habits, selectedHabit, onSelectHabit, onAddHabit, onDeleteHabit, habitData, currentView, onViewChange }) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      onAddHabit(newHabitName.trim());
      setNewHabitName('');
      setShowInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddHabit();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewHabitName('');
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="radhe-radhe-logo">✨ राधे राधे ✨</div>
        <h1>HabitGrid</h1>
        <p className="subtitle">2026</p>
        <div className="sanskrit-quote">
          <p className="sanskrit">कर्मण्येवाधिकारस्ते</p>
          <p className="translation">Focus on your actions, not results</p>
        </div>
      </div>

      {/* View Switcher */}
      <div className="view-switcher">
        <button 
          className={`view-btn ${currentView === 'habits' ? 'active' : ''}`}
          onClick={() => onViewChange('habits')}
        >
          <span className="view-icon">🪷</span>
          <span>Habits</span>
        </button>
        <button 
          className={`view-btn ${currentView === 'targets' ? 'active' : ''}`}
          onClick={() => onViewChange('targets')}
        >
          <span className="view-icon">🎯</span>
          <span>Targets</span>
        </button>
      </div>

      <div className="habits-list">
        <div className="habits-header">
          <h2>Habits</h2>
          <button 
            className="add-habit-btn"
            onClick={() => setShowInput(true)}
            title="Add new habit"
          >
            +
          </button>
        </div>

        {showInput && (
          <div className="habit-input-container">
            <input
              type="text"
              className="habit-input"
              placeholder="Habit name..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
            />
            <div className="habit-input-actions">
              <button className="btn-confirm" onClick={handleAddHabit}>
                Add
              </button>
              <button 
                className="btn-cancel" 
                onClick={() => {
                  setShowInput(false);
                  setNewHabitName('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="habits-items">
          {Object.keys(habits).length === 0 ? (
            <p className="empty-state">No habits yet. Create your first habit!</p>
          ) : (
            Object.keys(habits).map((habitName) => (
              <div
                key={habitName}
                className={`habit-item ${selectedHabit === habitName ? 'active' : ''}`}
                onClick={() => onSelectHabit(habitName)}
              >
                <span className="habit-name">{habitName}</span>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete habit "${habitName}"?`)) {
                      onDeleteHabit(habitName);
                    }
                  }}
                  title="Delete habit"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="legend">
          <h3>Legend</h3>
          <div className="legend-item">
            <div className="legend-box no-data"></div>
            <span>No data / Future</span>
          </div>
          <div className="legend-item">
            <div className="legend-box done"></div>
            <span>Completed</span>
          </div>
          <div className="legend-item">
            <div className="legend-box missed"></div>
            <span>Missed</span>
          </div>
          <div className="legend-item">
            <div className="legend-box auto-missed"></div>
            <span>Auto-missed (Past)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
