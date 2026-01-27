import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calculator, Map, Moon, Sun, Calendar } from 'lucide-react';
import Dashboard from './Dashboard';
import Budget from './Budget';
import Itinerary from './Itinerary';

function Navigation() {
  const location = useLocation();
  const isDashboard = location.pathname === '/' || location.pathname === '';
  const isBudget = location.pathname === '/budget';
  const isItinerary = location.pathname === '/itinerary';

  // Theme/color mode state
  const [colorMode, setColorMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('trip_theme');
      return savedTheme || 'dark';
    } catch {
      return 'dark';
    }
  });

  const isLight = colorMode === 'light';

  // Apply theme to document
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.dataset.theme = colorMode;
      root.classList.toggle('dark', colorMode === 'dark');
      localStorage.setItem('trip_theme', colorMode);
    } catch (error) {
      console.error('[Navigation] Error applying theme:', error);
    }
  }, [colorMode]);

  // Toggle theme
  const toggleTheme = () => {
    setColorMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="sticky top-0 z-[2000] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                isDashboard
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Map size={18} />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/itinerary"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                isItinerary
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar size={18} />
              <span>Itinerary</span>
            </Link>
            <Link
              to="/budget"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                isBudget
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calculator size={18} />
              <span>Budget</span>
            </Link>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {isLight ? (
              <Moon size={18} className="text-slate-700 dark:text-slate-300" />
            ) : (
              <Sun size={18} className="text-yellow-400" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
    </Router>
  );
}
