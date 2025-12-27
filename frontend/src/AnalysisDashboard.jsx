import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnalysisDashboard() {
  const [subs, setSubs] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/subjects/');
      setSubs(res.data);
    } catch (err) { console.error(err); }
  };

  const handleInputChange = (id, field, value) => {
    const newSubs = subs.map(s => s.id === id ? { ...s, [field]: value } : s);
    setSubs(newSubs);
    saveToDb(id, field, value);
  };

  const saveToDb = async (id, field, value) => {
    try { await axios.patch(`http://127.0.0.1:8000/api/subjects/${id}/`, { [field]: value }); } 
    catch (err) { console.error(err); }
  };

  const analyze = async () => {
    setLoading(true);
    const inputPayload = {};
    subs.forEach(s => {
        inputPayload[s.name] = { attended: s.attended_classes, conducted: s.conducted_classes };
    });

    try {
        const r = await axios.post('http://127.0.0.1:8000/api/analyze/', inputPayload);
        setReport(r.data);
    } catch (err) { alert("Error analyzing"); } 
    finally { setLoading(false); }
  };

  return (
    <div>
      {/* Input Section */}
      {subs.map(s => (
        <div key={s.id} className="card">
            <h3 style={{marginTop:0, fontSize:'1.1rem'}}>{s.name}</h3>
            <div className="grid-2">
            <div>
                <label>Attended</label>
                <input type="number" value={s.attended_classes} onChange={e => handleInputChange(s.id, 'attended_classes', e.target.value)}/>
            </div>
            <div>
                <label>Conducted</label>
                <input type="number" value={s.conducted_classes} onChange={e => handleInputChange(s.id, 'conducted_classes', e.target.value)}/>
            </div>
            </div>
        </div>
      ))}
      
      {subs.length === 0 && <p style={{textAlign:'center', color:'#888'}}>No subjects. Go to Timetable to add.</p>}

      <button onClick={analyze} disabled={loading} className="btn-primary" style={{margin:'10px 0 25px 0'}}>
        {loading ? 'Calculating...' : 'Analyze Attendance'}
      </button>

      {/* Results Section */}
      {report.map(r => {
        let color = '#27ae60'; // Safe
        if (r.status === 'Too Low' || r.status === 'Critical') color = '#e74c3c';
        if (r.status === 'Impossible') color = '#2c3e50';

        const classesLeft = r.classes_left !== undefined ? r.classes_left : 0;
        const mustAttend = r.must_attend !== undefined ? r.must_attend : 0;
        const neededTillEnd = r.needed_till_end !== undefined ? r.needed_till_end : 0;

        return (
            <div key={r.subject} className="card" style={{borderLeft: `5px solid ${color}`}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                    <b style={{fontSize:'1.1rem'}}>{r.subject}</b>
                    <span style={{color: color, fontWeight:'bold', fontSize:'0.9rem'}}>{r.status}</span>
                </div>

                <div style={{textAlign:'center', padding:'10px 0'}}>
                    <div style={{fontSize:'2.5rem', fontWeight:'800', color: color, lineHeight:1}}>
                        {r.status === 'Impossible' ? 'X' : r.bunkable}
                    </div>
                    <small style={{color:'#7f8c8d', textTransform:'uppercase', fontSize:'0.7rem'}}>
                        {r.bunkable >= 0 ? 'Bunks Available' : 'Recovery Needed'}
                    </small>
                </div>

                <p style={{background:'#f8f9fa', padding:'10px', borderRadius:'6px', fontSize:'0.9rem', color:'#555', fontStyle:'italic'}}>
                    "{r.advice}"
                </p>

                <div style={{marginTop:'15px', fontSize:'0.85rem', lineHeight: '1.8', borderTop:'1px solid #eee', paddingTop:'10px'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <span>Current %:</span> <b>{r.current_percentage}%</b>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <span>Total Class Left:</span> <b>{classesLeft}</b>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', color: mustAttend > 0 ? '#e74c3c' : '#27ae60'}}>
                        <span>Must Attend (Immediate):</span> <b>{mustAttend}</b>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', color:'#555'}}>
                        <span>Need till end:</span> <b>{neededTillEnd}</b>
                    </div>
                </div>
            </div>
        );
      })}
    </div>
  );
}