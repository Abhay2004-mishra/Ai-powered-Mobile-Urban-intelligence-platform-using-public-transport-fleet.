import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { DemoProvider } from './context/DemoContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DemoProvider>
          <App />
        </DemoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
