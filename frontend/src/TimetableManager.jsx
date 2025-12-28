import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TimetableManager() {
  const [subs, setSubs] = useState([]);
  const [newSub, setNewSub] = useState('');
  const [sched, setSched] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
        const s = await axios.get('/api/subjects/');
        const t = await axios.get('/api/timetable/');
        setSubs(s.data); setSched(t.data);
    } catch (e) { console.error(e); }
  };

  const addSub = async () => {
    if(!newSub) return;
    await axios.post('/api/subjects/', {name: newSub});
    setNewSub(''); load();
  };

  const delSub = async (id) => {
    if(confirm("Delete subject?")) { await axios.delete(`/api/subjects/${id}/`); load(); }
  };

  const addClass = async (day, subId) => {
    await axios.post('/api/timetable/', {day_of_week: day, subject: subId}); load();
  };

  const delClass = async (id) => {
    await axios.delete(`/api/timetable/${id}/`); load();
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div style={{paddingBottom:'20px'}}>
      
      {/* 1. Subject Manager (Top Fixed) */}
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

      {/* 2. Vertical Stack Layout (Mobile Friendly) */}
      <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
        {days.map((d, i) => (
          <div key={d} className="card" style={{margin:0, padding:'15px', borderTop:'4px solid #3498db'}}>
            
            {/* Header: Day Name + Add Button */}
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
            
            {/* Class List */}
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