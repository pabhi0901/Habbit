import { useEffect, useState, useMemo } from 'react';
import { formatDate } from '../utils/dateUtils';
import './Home.css';
import bannerImg from '../images/banner.png';

const DEFAULT_TARGETS = { daily: [], weekly: [], monthly: [] };

const loadTargets = () => {
  try {
    const raw = localStorage.getItem('habitgrid_targets');
    if (!raw) return DEFAULT_TARGETS;
    const parsed = JSON.parse(raw);
    return {
      daily: parsed.daily || [],
      weekly: parsed.weekly || [],
      monthly: parsed.monthly || []
    };
  } catch (err) {
    console.error('Failed to load targets', err);
    return DEFAULT_TARGETS;
  }
};

const Home = ({ habits, onToggleHabitToday }) => {
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toDateString(), [today]);
  const todayKey = useMemo(() => formatDate(today), [today]);

  useEffect(() => {
    setTargets(loadTargets());
  }, []);

  const saveTargets = (nextTargets) => {
    setTargets(nextTargets);
    localStorage.setItem('habitgrid_targets', JSON.stringify(nextTargets));
  };

  const toggleTarget = (id) => {
    setTargets(prev => {
      const next = {
        ...prev,
        daily: prev.daily.map(t => {
          if (t.id !== id) return t;
          if (t.date !== todayStr || t.status === 'missed') return t;
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          return { ...t, status: nextStatus };
        })
      };
      localStorage.setItem('habitgrid_targets', JSON.stringify(next));
      return next;
    });
  };

  const mergedChecklist = useMemo(() => {
    const habitItems = Object.keys(habits).map(name => ({
      id: `habit-${name}`,
      label: name,
      type: 'habit',
      status: habits[name]?.[todayKey] || 'pending'
    }));

    const dailyTargets = (targets.daily || []).filter(t => t.date === todayStr);
    const targetItems = dailyTargets.map(t => ({
      id: `target-${t.id}`,
      label: t.text,
      type: 'target',
      status: t.status
    }));

    return [...habitItems, ...targetItems];
  }, [habits, targets, todayKey, todayStr]);

  const renderStatus = (status) => {
    if (status === 'completed' || status === 'done') return 'completed';
    if (status === 'missed') return 'missed';
    return 'pending';
  };

  const handleToggle = (item) => {
    if (item.type === 'habit') {
      onToggleHabitToday(item.label);
    } else if (item.type === 'target') {
      const numericId = parseInt(item.id.replace('target-', ''), 10);
      toggleTarget(numericId);
    }
  };

  return (
    <div className="home">
      <div className="home-inner">
        <div className="banner">
          <img src={bannerImg} alt="Radhe Radhe" className="banner-image" />
          <div className="banner-overlay">
            <h1 className="headline">Radhe ji guides every step</h1>
          </div>
        </div>

        <div className="hero-grid">
          <div className="hero-card">
            <h2>Your Day at a Glance</h2>
            <p>Check off habits and daily tasks here—updates sync instantly to your trackers.</p>
          </div>
          <div className="hero-card soft">
            <h3>Today</h3>
            <p>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="checklist-card">
          <div className="checklist-header">
            <h3>Unified Checklist</h3>
            <p>Habits and daily targets together</p>
          </div>
          {mergedChecklist.length === 0 ? (
            <div className="empty-merged">Nothing for today. Add habits or daily targets to begin.</div>
          ) : (
            <div className="checklist-grid">
              {mergedChecklist.map(item => {
                const state = renderStatus(item.status);
                return (
                  <button
                    key={item.id}
                    className={`check-item ${state} ${item.type}`}
                    onClick={() => handleToggle(item)}
                    title={item.type === 'habit' ? "Toggle today's habit status" : "Toggle today's target"}
                  >
                    <span className="pill">{item.type === 'habit' ? 'Habit' : 'Target'}</span>
                    <span className="label">{item.label}</span>
                    <span className="state">{state === 'completed' ? 'Done' : state === 'missed' ? 'Missed' : 'Pending'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
