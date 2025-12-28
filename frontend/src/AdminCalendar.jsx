import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

export default function AdminCalendar() {
  const [dates, setDates] = useState({});
  const [range, setRange] = useState({start:'', end:''});

  // 1. New State for Page Loading
  const [pageLoading, setPageLoading] = useState(true);

  // 2. Wrap initialization in a dedicated async function
  useEffect(() => { 
    const initPage = async () => {
        setPageLoading(true);

        // Wait for Fetch AND 2-second timer (Fake Load)
        await Promise.all([
            fetchCal(),
            new Promise(resolve => setTimeout(resolve, 200))
        ]);

        setPageLoading(false);
    };

    initPage();
  }, []);

  const fetchCal = async (retries = 3) => {
    try {
        const res = await axios.get('/api/calendar/list/');
        const map = {};
        res.data.forEach(d => map[d.date] = d.is_working_day);
        setDates(map);
    } catch (error) {
        // Keep retry logic as a safety net behind the loading screen
        if (error.response && error.response.status === 401 && retries > 0) {
            setTimeout(() => fetchCal(retries - 1), 500);
        } else {
            console.error("Error fetching calendar:", error);
        }
    }
  };

  const toggle = async (date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    setDates(prev => ({...prev, [dStr]: !prev[dStr]}));
    try {
        await axios.post('/api/calendar/toggle/', {date: dStr});
    } catch (error) {
        console.error("Error toggling date:", error);
        setDates(prev => ({...prev, [dStr]: !prev[dStr]}));
    }
  };

  const init = async () => {
    if (!range.start || !range.end) {
        alert("Please select both start and end dates.");
        return;
    }
    
    try {
        await axios.post('/api/calendar/init/', {
            start_date: range.start,
            end_date: range.end
        });
        alert("Semester Initialized!");
        fetchCal();
    } catch (error) {
        console.error(error);
        alert("Error initializing semester.");
    }
  };

  // 3. Loading Screen UI
  if (pageLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', color: '#555'
      }}>
        <div className="spinner" style={{
           width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '15px'
        }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p>Loading Calendar...</p>
      </div>
    );
  }

  // 4. Main Content (Visible after 2s)
  return (
    <div>
      <div className="card">
        <h4>Init Semester</h4>
        <div className="input-row">
            <div>
                <label>Start Date:</label>
                <input type="date" onChange={e=>setRange({...range, start:e.target.value})} />
            </div>
            <div>
                <label>End Date:</label>
                <input type="date" onChange={e=>setRange({...range, end:e.target.value})} />
            </div>
        </div>
        <button onClick={init} style={{width:'100%', padding:'10px', background:'#3498db', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>Generate Calendar</button>
      </div>

      <div className="card">
        <Calendar 
            onClickDay={toggle} 
            tileClassName={({date}) => {
                const dStr = format(date, 'yyyy-MM-dd');
                const isWorking = dates[dStr];
                
                if(isWorking === true) return 'working-day';
                if(isWorking === false) return 'holiday';
                return null;
            }} 
        />
        
        <div style={{ marginTop: '15px', display: 'flex', gap: '15px', fontSize:'0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', background: '#ffe0b2', border: '1px solid #e65100' }}></div>
                <span>Working Day</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', background: '#c8e6c9', border: '1px solid #1b5e20' }}></div>
                <span>Holiday / Weekend</span>
            </div>
        </div>
      </div>
    </div>
  );
}