// Date utilities for 2026 calendar
export const getDaysInYear = (year) => {
  const days = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const getWeekNumber = (date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

export const calculateStreaks = (habitData) => {
  const dates = Object.keys(habitData).sort();
  if (dates.length === 0) return { longest: 0, current: 0 };
  
  let longest = 0;
  let current = 0;
  let tempStreak = 0;
  
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));
  
  for (let i = 0; i < dates.length; i++) {
    if (habitData[dates[i]] === 'done') {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
      
      // Check if this is part of current streak
      if (dates[i] === today || dates[i] === yesterday) {
        current = tempStreak;
      }
    } else {
      // Check if this break affects current streak
      if (dates[i] <= today) {
        current = 0;
      }
      tempStreak = 0;
    }
  }
  
  // Final check for current streak
  const lastDoneDate = dates.reverse().find(d => habitData[d] === 'done');
  if (lastDoneDate === today || lastDoneDate === yesterday) {
    current = longest; // Simplified - could be improved
  } else {
    current = 0;
  }
  
  return { longest, current };
};

export const getStats = (habitData) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Count auto-missed days (past days without status)
  const allDays = getDaysInYear(2026);
  let autoMissed = 0;
  
  allDays.forEach(day => {
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    const dateStr = formatDate(day);
    
    // If day is past and has no status, it's auto-missed
    if (dayDate < today && !habitData[dateStr]) {
      autoMissed++;
    }
  });
  
  const totalManuallyTracked = Object.keys(habitData).length;
  const completed = Object.values(habitData).filter(v => v === 'done').length;
  const missedManual = Object.values(habitData).filter(v => v === 'missed').length;
  const totalMissed = missedManual + autoMissed;
  const totalTracked = totalManuallyTracked + autoMissed;
  const totalTrackedAll = completed + totalMissed;
  const percentage = totalTrackedAll > 0 ? Math.round((completed / totalTrackedAll) * 100) : 0;
  const streaks = calculateStreaks(habitData);
  
  return {
    total: totalTracked,
    completed,
    missed: totalMissed,
    autoMissed,
    percentage,
    longestStreak: streaks.longest,
    currentStreak: streaks.current
  };
};
