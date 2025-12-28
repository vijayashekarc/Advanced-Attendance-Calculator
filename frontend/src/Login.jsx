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

  return (
    <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
      <div className="card" style={{textAlign:'center', width:'300px'}}>
        <h2>Attendance App</h2>
        <button onClick={() => googleLogin()} style={{padding:'10px', width:'100%', cursor:'pointer'}}>Sign in with KLU Mail</button>
        {error && <p style={{color:'red'}}>{error}</p>}
      </div>
    </div>
  );
}
export default Login;