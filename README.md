# HabitGrid - 2026 Habit Tracker

A beautiful, GitHub-style habit tracking application built with React. Track your daily habits with a full-year calendar grid visualization.

## Features

### 🎯 Habit Management
- Create unlimited habits (Gym, Coding, Reading, etc.)
- Each habit has its own 365-day calendar for 2026
- Delete habits with confirmation
- Easy habit switching in sidebar

### 📅 Interactive Calendar Grid
- Full 2026 calendar in GitHub contribution-style heatmap
- 365 squares, one for each day
- Click cycle: Gray (no data) → Green (completed) → Red (missed) → Gray
- Smooth hover effects
- Tooltips showing date and status

### 📊 Real-time Analytics
- **Total Days**: Number of days tracked
- **Completed**: Days you succeeded
- **Missed**: Days you missed
- **Success Rate**: Percentage of completion
- **Longest Streak**: Your best consecutive days
- **Current Streak**: Your ongoing streak

### 💾 Offline Storage
- All data stored in browser localStorage
- Works completely offline
- Data persists after page reload
- No backend required

### 🎨 Dark Theme
- GitHub-inspired dark design
- Background: `#0d1117`
- Modern, clean interface
- Smooth animations

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## How to Use

1. **Create a Habit**
   - Click the `+` button in the sidebar
   - Enter habit name (e.g., "Gym", "Meditation")
   - Press Enter or click "Add"

2. **Track Your Days**
   - Click any day square to mark as completed (green)
   - Click again to mark as missed (red)
   - Click once more to reset (gray)

3. **View Analytics**
   - Check your statistics at the bottom
   - Monitor your streaks and success rate

4. **Switch Habits**
   - Click on any habit in the sidebar to view its calendar

5. **Delete a Habit**
   - Click the `×` button next to the habit name
   - Confirm deletion

## Project Structure

```
Habbit/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx           # Habits list & legend
│   │   ├── Sidebar.css
│   │   ├── HabitGrid.jsx         # 365-day calendar grid
│   │   ├── HabitGrid.css
│   │   ├── AnalyticsPanel.jsx    # Statistics display
│   │   └── AnalyticsPanel.css
│   ├── utils/
│   │   ├── storage.js            # localStorage functions
│   │   └── dateUtils.js          # Date & stats calculations
│   ├── App.jsx                   # Main component
│   ├── App.css
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Data Structure

Data is stored in localStorage under the key `habitgrid_data`:

```javascript
{
  "Gym": {
    "2026-01-01": "done",
    "2026-01-02": "missed",
    "2026-01-03": "done"
  },
  "Coding": {
    "2026-01-01": "done",
    "2026-01-05": "done"
  }
}
```

## Color Scheme

| Status | Color | Hex |
|--------|-------|-----|
| No data | Dark Gray | `#161b22` |
| Completed | Green | `#238636` |
| Missed | Red | `#da3633` |
| Background | Black | `#0d1117` |

## Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **CSS Grid & Flexbox** - Layout
- **LocalStorage** - Data persistence
- **Functional Components** - Modern React patterns
- **React Hooks** - State management

## Browser Support

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## License

MIT License - Feel free to use for personal projects!

---

Built with ❤️ for habit tracking
