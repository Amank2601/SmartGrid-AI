import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './theme.css'; // 👈 ADD THIS

import App from './App';
import reportWebVitals from './reportWebVitals';

// 👇 IMPORT THEME PROVIDER
import { ThemeProvider } from './context/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider>   {/* 🔥 WRAP APP */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();