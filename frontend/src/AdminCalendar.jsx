import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

export default function AdminCalendar() {
  const [dates, setDates] = useState({});
  // Keeping state as 'start' and 'end' for the inputs is fine...
  const [range, setRange] = useState({start:'', end:''});

  const fetchCal = async () => {
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/calendar/list/');
        const map = {};
        res.data.forEach(d => map[d.date] = d.is_working_day);
        setDates(map);
    } catch (error) {
        console.error("Error fetching calendar:", error);
    }
  };
  
  useEffect(() => { fetchCal(); }, []);

  const toggle = async (date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    // Optimistic update (update UI instantly)
    setDates(prev => ({...prev, [dStr]: !prev[dStr]}));
    await axios.post('http://127.0.0.1:8000/api/calendar/toggle/', {date: dStr});
  };

  const init = async () => {
    if (!range.start || !range.end) {
        alert("Please select both start and end dates.");
        return;
    }
    
    try {
        // --- FIX IS HERE: MAPPING 'start' -> 'start_date' ---
        await axios.post('http://127.0.0.1:8000/api/calendar/init/', {
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
                // Default logic: If not in DB, assume working (unless weekend logic handled in backend, but UI needs a state)
                // However, our backend initializes DB. So if it's missing, it's just missing.
                if(isWorking === true) return 'working-day';
                if(isWorking === false) return 'holiday';
                return null;
            }} 
        />
        
        {/* Legend */}
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