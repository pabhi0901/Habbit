import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HabitGrid from './components/HabitGrid';
import Targets from './components/Targets';
import { loadHabits, saveHabits, addHabit, deleteHabit, updateHabitDay } from './utils/storage';
import './App.css';

function App() {
  const [habits, setHabits] = useState({});
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [currentView, setCurrentView] = useState('habits'); // 'habits' or 'targets'

  // Load habits from localStorage on mount
  useEffect(() => {
    const loadedHabits = loadHabits();
    setHabits(loadedHabits);
    
    // Select first habit if available
    const habitNames = Object.keys(loadedHabits);
    if (habitNames.length > 0 && !selectedHabit) {
      setSelectedHabit(habitNames[0]);
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(habits).length > 0 || localStorage.getItem('habitgrid_data')) {
      saveHabits(habits);
    }
  }, [habits]);

  const handleAddHabit = (habitName) => {
    const newHabits = addHabit(habits, habitName);
    setHabits(newHabits);
    setSelectedHabit(habitName);
  };

  const handleDeleteHabit = (habitName) => {
    const newHabits = deleteHabit(habits, habitName);
    setHabits(newHabits);
    
    // If deleted habit was selected, select another one
    if (selectedHabit === habitName) {
      const remainingHabits = Object.keys(newHabits);
      setSelectedHabit(remainingHabits.length > 0 ? remainingHabits[0] : null);
    }
  };

  const handleUpdateDay = (date, status) => {
    if (!selectedHabit) return;
    const newHabits = updateHabitDay(habits, selectedHabit, date, status);
    setHabits(newHabits);
  };

  const handleSelectHabit = (habitName) => {
    setSelectedHabit(habitName);
  };

  return (
    <div className="app">
      <Sidebar
        habits={habits}
        selectedHabit={selectedHabit}
        onSelectHabit={handleSelectHabit}
        onAddHabit={handleAddHabit}
        onDeleteHabit={handleDeleteHabit}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main className="main-content">
        {currentView === 'targets' ? (
          <Targets />
        ) : selectedHabit ? (
          <HabitGrid
            habitName={selectedHabit}
            habitData={habits[selectedHabit] || {}}
            onUpdateDay={handleUpdateDay}
          />
        ) : (
          <div className="empty-state-main">
            <h2>Welcome to HabitGrid!</h2>
            <p>Create your first habit to start tracking your progress.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
