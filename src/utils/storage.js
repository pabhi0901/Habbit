// LocalStorage utilities
const STORAGE_KEY = 'habitgrid_data';

export const loadHabits = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading habits:', error);
    return {};
  }
};

export const saveHabits = (habits) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error('Error saving habits:', error);
  }
};

export const addHabit = (habits, habitName) => {
  if (!habitName || habits[habitName]) return habits;
  return { ...habits, [habitName]: {} };
};

export const deleteHabit = (habits, habitName) => {
  const newHabits = { ...habits };
  delete newHabits[habitName];
  return newHabits;
};

export const updateHabitDay = (habits, habitName, date, status) => {
  const newHabits = { ...habits };
  if (!newHabits[habitName]) {
    newHabits[habitName] = {};
  }
  
  if (status === null) {
    delete newHabits[habitName][date];
  } else {
    newHabits[habitName][date] = status;
  }
  
  return newHabits;
};
