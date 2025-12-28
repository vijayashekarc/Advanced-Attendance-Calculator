import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TimetableManager() {
  const [subs, setSubs] = useState([]);
  const [newSub, setNewSub] = useState('');
  const [sched, setSched] = useState([]);

  // 1. New State for Page Loading
  const [pageLoading, setPageLoading] = useState(true);

  // 2. Wrap initialization in a dedicated async function
  useEffect(() => {
    const initPage = async () => {
        setPageLoading(true);

        // Wait for Fetch AND 2-second timer
        await Promise.all([
            load(),
            new Promise(resolve => setTimeout(resolve, 500))
        ]);

        setPageLoading(false);
    };
    initPage();
  }, []);

  const load = async (retries = 3) => {
    try {
        const s = await axios.get('/api/subjects/');
        const t = await axios.get('/api/timetable/');
        setSubs(s.data); 
        setSched(t.data);
    } catch (e) { 
        // Retry logic (Safety net behind the loading screen)
        if (e.response && e.response.status === 401 && retries > 0) {
            setTimeout(() => load(retries - 1), 500);
        } else {
            console.error(e); 
        }
    }
  };

  const addSub = async () => {
    if(!newSub) return;
    try {
        await axios.post('/api/subjects/', {name: newSub});
        setNewSub(''); 
        load();
    } catch (e) { console.error(e); }
  };

  const delSub = async (id) => {
    if(window.confirm("Delete subject?")) { 
        try {
            await axios.delete(`/api/subjects/${id}/`); 
            load(); 
        } catch (e) { console.error(e); }
    }
  };

  const addClass = async (day, subId) => {
    try {
        await axios.post('/api/timetable/', {day_of_week: day, subject: subId}); 
        load();
    } catch (e) { console.error(e); }
  };

  const delClass = async (id) => {
    try {
        await axios.delete(`/api/timetable/${id}/`); 
        load();
    } catch (e) { console.error(e); }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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
        <p>Loading Timetable...</p>
      </div>
    );
  }

  // 4. Main Content (Visible after 2s)
  return (
    <div style={{paddingBottom:'20px'}}>
      
      {/* Subject Manager */}
      <div className="card" style={{padding:'15px', marginBottom:'15px', borderLeft:'4px solid #27ae60'}}>
        <h4 style={{marginTop:0, marginBottom:'10px', color:'#27ae60'}}>Subjects</h4>
        <div style={{display:'flex', gap:'8px', marginBottom:'10px'}}>
            <input 
                value={newSub} 
                onChange={e=>setNewSub(e.target.value)} 
                placeholder="New Subject Name" 
                style={{padding:'10px', fontSize:'1rem'}}
            />
            <button onClick={addSub} className="btn-success" style={{padding:'10px 20px'}}>Add</button>
        </div>
        <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
          {subs.map(s => (
            <span key={s.id} style={{background:'#f1f2f6', border:'1px solid #ddd', padding:'6px 12px', borderRadius:'15px', fontSize:'0.85rem', display:'flex', alignItems:'center'}}>
              {s.name} 
              <span onClick={()=>delSub(s.id)} style={{color:'#e74c3c', marginLeft:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'1.1rem'}}>×</span>
            </span>
          ))}
        </div>
      </div>

      {/* Timetable Stack */}
      <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
        {days.map((d, i) => (
          <div key={d} className="card" style={{margin:0, padding:'15px', borderTop:'4px solid #3498db'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                <h3 style={{margin:0, color:'#2c3e50'}}>{d}</h3>
                <select 
                    onChange={e=>addClass(i, e.target.value)} 
                    value="" 
                    style={{width:'auto', padding:'5px', fontSize:'0.8rem', borderColor:'#3498db'}}
                >
                    <option value="" disabled>+ Add Class</option>
                    {subs.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            
            {sched.filter(x=>x.day_of_week===i).length === 0 ? (
                <div style={{padding:'10px', textAlign:'center', color:'#ccc', fontStyle:'italic', fontSize:'0.9rem', border:'1px dashed #eee', borderRadius:'6px'}}>
                    No classes scheduled
                </div>
            ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                    {sched.filter(x=>x.day_of_week===i).map(x => (
                    <div key={x.id} style={{
                        background:'#f8f9fa', 
                        padding:'12px', 
                        borderRadius:'8px', 
                        display:'flex', 
                        justifyContent:'space-between',
                        alignItems:'center',
                        borderLeft: '3px solid #3498db',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                        <span style={{fontWeight:'500', color:'#333'}}>{x.subject_name}</span>
                        <button 
                            onClick={()=>delClass(x.id)} 
                            style={{background:'none', border:'none', color:'#e74c3c', fontSize:'1.2rem', cursor:'pointer', padding:'0 5px'}}
                        >×</button>
                    </div>
                    ))}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}