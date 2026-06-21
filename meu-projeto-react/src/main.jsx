import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './GoalTracker.jsx'
import App from './GoalTracker.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
