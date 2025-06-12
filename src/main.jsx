// File: src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- ADDED THIS LINE
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 👇 WRAPPED APP WITH BROWSERROUTER 👇 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)