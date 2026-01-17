import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calculator, Map } from 'lucide-react';
import Dashboard from './Dashboard';
import Budget from './Budget';

function Navigation() {
  const location = useLocation();
  const isDashboard = location.pathname === '/' || location.pathname === '';
  const isBudget = location.pathname === '/budget';

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
        <Route path="/budget" element={<Budget />} />
      </Routes>
    </Router>
  );
}
