import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // ✅ استيراد ملف الأنماط هنا

// يتم هنا ربط المكون الرئيسي (App) بعنصر الـ DOM ذي الهوية 'root'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
