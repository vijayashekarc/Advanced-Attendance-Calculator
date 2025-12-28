import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import AdminCalendar from './AdminCalendar';
import TimetableManager from './TimetableManager';
import AnalysisDashboard from './AnalysisDashboard';
import './App.css';



export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tab, setTab] = useState('dash');

  useEffect(() => {
    if(token) axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  }, [token]);

  const logout = () => {
      localStorage.clear();
      setToken(null);
      // Optional: Reset axios header
      delete axios.defaults.headers.common['Authorization'];
  };

  if(!token) return <Login setToken={setToken} />;

  return (
    <div className="app-container">
      {/* Fixed Top Navigation */}
      <nav className="navbar">
        <div className="nav-tabs">
          <button className={`nav-btn ${tab==='dash'?'active':''}`} onClick={()=>setTab('dash')}>Analysis</button>
          <button className={`nav-btn ${tab==='time'?'active':''}`} onClick={()=>setTab('time')}>Timetable</button>
          <button className={`nav-btn ${tab==='cal'?'active':''}`} onClick={()=>setTab('cal')}>Calendar</button>
        </div>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </nav>

      {/* Main Content Area */}
      <div className="content-area">
        {tab==='dash' && <AnalysisDashboard />}
        {tab==='time' && <TimetableManager />}
        {tab==='cal' && <AdminCalendar />}
      </div>
    </div>
  );
}