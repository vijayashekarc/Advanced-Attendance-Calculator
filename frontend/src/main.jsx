// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // or App.css
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const apiUrl = import.meta.env.VITE_API_URL;

axios.defaults.baseURL = apiUrl || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap your entire App in the Provider */}
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)