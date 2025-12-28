import React, { useState } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

function Login({ setToken }) {
  const [error, setError] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (res) => {
      try {
        const backendRes = await axios.post('/api/auth/google/', { access_token: res.access_token });
        localStorage.setItem('token', backendRes.data.auth_token);
        setToken(backendRes.data.auth_token);
      } catch (err) { setError("Login Failed. Must use @klu.ac.in"); }
    },
    onError: () => setError("Google Login Failed")
  });

  const linkStyle = { textDecoration: 'none', color: '#333', fontWeight: 'bold' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      
      {/* 1. NAVBAR */}
      <nav style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        borderBottom: '1px solid #eee',
        flexShrink: 0
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#27ae60' }}>
            Att Manager
        </div>
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            
            {/* GITHUB LOGO LINK */}
            <a href="https://github.com/your-username" target="_blank" rel="noreferrer" style={linkStyle} title="GitHub">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" 
                    alt="GitHub" 
                    style={{ width: '26px', height: '26px', opacity: 0.8, transition: 'opacity 0.2s' }}
                    onMouseOver={(e) => e.target.style.opacity = 1}
                    onMouseOut={(e) => e.target.style.opacity = 0.8}
                />
            </a>
            
            {/* PERSONAL WEBSITE LOGO (Globe Icon) */}
            <a href="https://your-website.com" target="_blank" rel="noreferrer" style={linkStyle} title="My Portfolio">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c4/Globe_icon.svg" 
                    alt="Portfolio" 
                    style={{ width: '26px', height: '26px', opacity: 0.8, transition: 'opacity 0.2s' }}
                    onMouseOver={(e) => e.target.style.opacity = 1}
                    onMouseOut={(e) => e.target.style.opacity = 0.8}
                />
            </a>

        </div>
      </nav>

      {/* 2. MAIN CONTENT AREA */}
      <div style={{
        flex: 1,                 // Pushes footer down, takes available height
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Centers VERTICALLY
        alignItems: 'center',     // Centers HORIZONTALLY
        padding: '20px',
        background: '#efefefff',
        width: '100%',            // Ensures it spans full width for horizontal centering
        boxSizing: 'border-box',
        gap: '30px'               // Creates space between Login Box and Details Box
      }}>
        
        {/* --- LOGIN BOX --- */}
        <div className="card" style={{
          
            textAlign: 'center', 
            width: '100%',
            maxWidth: '400px',
            boxSizing: 'border-box',
            padding: '80px 25px',
            // marginBottom: '30px', // Removed this, using 'gap' in parent instead
            backgroundColor: '#b6ffccff', 
            border: '1px solid #73bc9bff',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{marginTop:0, fontSize:'1.8rem', color:'#1565c0'}}>Attendance App</h2>
          <p style={{marginBottom:'25px', color:'#555', lineHeight:'1.5'}}>
            Manage your 75% safely.<br/>Login to continue.
          </p>
          
          <button onClick={() => googleLogin()} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              
              padding: '12px', 
              width: '100%', 
              cursor: 'pointer', 
              fontSize: '1rem',
              fontWeight: '600',
              background: '#fff',
              border: '1px solid #90caf9',
              borderRadius: '6px',
              color: '#1565c0',
              transition: 'all 0.2s ease'
          }}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
              alt="G" 
              style={{ width: '20px', height: '20px' }} 
            />
            Sign in with KLU Mail
          </button>
          
          {error && <p style={{color:'#d32f2f', marginTop:'15px', fontSize:'0.9rem', fontWeight:'bold'}}>{error}</p>}
        </div>
        
        {/* --- HOW IT WORKS --- */}
        <div className="card" style={{
            width: '100%', 
            maxWidth: '600px', // FIX: Was 'px', changed to '600px'
            boxSizing: 'border-box',
            padding: '25px', 
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{marginTop: 0, borderBottom:'2px solid #eee', paddingBottom:'10px', color:'#333'}}>How it Works</h3>
          
          <div style={{display:'flex', flexDirection:'column', gap:'15px', textAlign:'left'}}>
            <div>
              <strong style={{color:'#2c3e50'}}>1. Set Timetable:</strong>
              <p style={{margin:'5px 0 0 0', color:'#666', fontSize:'0.9rem', lineHeight:'1.4'}}>
                 Enter your weekly schedule once. The app remembers your subjects.
              </p>
            </div>
            
            <div>
              <strong style={{color:'#2c3e50'}}>2. Sync Calendar:</strong>
              <p style={{margin:'5px 0 0 0', color:'#666', fontSize:'0.9rem', lineHeight:'1.4'}}>
                 Mark holidays or mass bunks in the calendar so they aren't counted as classes.
              </p>
            </div>

            <div>
              <strong style={{color:'#2c3e50'}}>3. Analyze:</strong>
              <p style={{margin:'5px 0 0 0', color:'#666', fontSize:'0.9rem', lineHeight:'1.4'}}>
                 Click "Analyze" to see how many classes you can skip (or must attend) to maintain 75%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOOTER */}
      <footer style={{
        padding: '20px',
        textAlign: 'center',
        background: '#fff',
        borderTop: '1px solid #eee',
        fontSize: '0.85rem',
        color: '#888',
        flexShrink: 0
      }}>
        <h3>Design and Developed by Vijayashekar C</h3> 
        &copy; 2025 Advanced Attendance Calculator.
      </footer>
    </div>
  );
}
export default Login;