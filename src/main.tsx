import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from './App'
import './styles/theme.css'
import './index.css'
import './screens/Screen.css'
import './screens/SplashScreen.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
