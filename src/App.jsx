import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HabitGrid from './components/HabitGrid';
import Targets from './components/Targets';
import Home from './components/Home';
import Login from './components/Login';
import { loadHabits, saveHabits, addHabit, deleteHabit, updateHabitDay } from './utils/storage';
import { formatDate } from './utils/dateUtils';
import { isAuthenticated, saveAuth, verifyPassword, getStoredHash } from './utils/auth';
import './App.css';

function App() {
  const [habits, setHabits] = useState({});
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'habits', 'targets'
  const [showHabitInput, setShowHabitInput] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const hasAuth = isAuthenticated();
      if (!hasAuth) {
        setIsFirstTime(true);
        setIsLoggedIn(false);
      } else {
        // User needs to enter password even if hash exists
        setIsLoggedIn(false);
        setIsFirstTime(false);
      }
    };
    checkAuth();
  }, []);

  // Load habits from localStorage on mount (only when logged in)
  useEffect(() => {
    if (isLoggedIn) {
      const loadedHabits = loadHabits();
      setHabits(loadedHabits);
      setIsInitialized(true);
      
      // Select first habit if available
      const habitNames = Object.keys(loadedHabits);
      if (habitNames.length > 0 && !selectedHabit) {
        setSelectedHabit(habitNames[0]);
      }
    }
  }, [isLoggedIn]);

  // Save habits to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isInitialized) {
      saveHabits(habits);
    }
  }, [habits, isInitialized]);

  const handleAddHabit = (habitName) => {
    const newHabits = addHabit(habits, habitName);
    setHabits(newHabits);
    setSelectedHabit(habitName);
  };

  const handleAddHabitInline = () => {
    const name = newHabitName.trim();
    if (!name) return;
    handleAddHabit(name);
    setNewHabitName('');
    setShowHabitInput(false);
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

  const handleToggleHabitToday = (habitName) => {
    const todayStr = formatDate(new Date());
    const currentStatus = habits[habitName]?.[todayStr];
    let nextStatus;
    if (!currentStatus) nextStatus = 'done';
    else if (currentStatus === 'done') nextStatus = 'missed';
    else nextStatus = null;

    const updated = updateHabitDay(habits, habitName, todayStr, nextStatus);
    setHabits(updated);
  };

  const handleSelectHabit = (habitName) => {
    setSelectedHabit(habitName);
  };

  const handleGoHome = () => setCurrentView('home');

  const handleLogin = (password) => {
    if (isFirstTime) {
      // First time: set the password
      saveAuth(password);
      setIsLoggedIn(true);
      setIsFirstTime(false);
      return true;
    } else {
      // Verify password
      const storedHash = getStoredHash();
      const isValid = verifyPassword(password, storedHash);
      if (isValid) {
        setIsLoggedIn(true);
        return true;
      }
      return false;
    }
  };

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} isFirstTime={isFirstTime} />;
  }

  return (
    <div className="app">
      <Sidebar
        habits={habits}
        selectedHabit={selectedHabit}
        onSelectHabit={handleSelectHabit}
        onDeleteHabit={handleDeleteHabit}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main className={`main-content ${currentView === 'home' ? 'home-mode' : ''}`}>
        {currentView === 'home' && (
          <Home
            habits={habits}
            onToggleHabitToday={handleToggleHabitToday}
            selectedHabit={selectedHabit}
            setSelectedHabit={setSelectedHabit}
          />
        )}

        {currentView === 'habits' && (
          selectedHabit ? (
            <div className="habit-view">
              <div className="habit-toolbar">
                <button className="add-habit-main" onClick={() => setShowHabitInput(!showHabitInput)}>
                  {showHabitInput ? 'Cancel' : 'Add Habit'}
                </button>
                {showHabitInput && (
                  <div className="habit-inline-form">
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddHabitInline();
                        if (e.key === 'Escape') {
                          setShowHabitInput(false);
                          setNewHabitName('');
                        }
                      }}
                      placeholder="New habit name"
                      autoFocus
                    />
                    <button onClick={handleAddHabitInline}>Add</button>
                  </div>
                )}
              </div>
              <HabitGrid
                habitName={selectedHabit}
                habitData={habits[selectedHabit] || {}}
                onUpdateDay={handleUpdateDay}
                onGoHome={handleGoHome}
              />
            </div>
          ) : (
            <div className="empty-state-main">
              <h2>Welcome to HabitGrid!</h2>
              <p>Create your first habit to start tracking your progress.</p>
              <div className="habit-toolbar" style={{ justifyContent: 'center', marginTop: '16px' }}>
                <button className="add-habit-main" onClick={() => setShowHabitInput(!showHabitInput)}>
                  {showHabitInput ? 'Cancel' : 'Add Habit'}
                </button>
                {showHabitInput && (
                  <div className="habit-inline-form" style={{ maxWidth: '360px' }}>
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddHabitInline();
                        if (e.key === 'Escape') {
                          setShowHabitInput(false);
                          setNewHabitName('');
                        }
                      }}
                      placeholder="New habit name"
                      autoFocus
                    />
                    <button onClick={handleAddHabitInline}>Add</button>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {currentView === 'targets' && <Targets />}
      </main>
    </div>
  );
}

export default App;
