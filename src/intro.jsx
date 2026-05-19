import React from 'react'
import ReactDOM from 'react-dom/client'
import IntroApp from './IntroApp'
import './index.css'

const rootElement = document.getElementById('intro-root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <IntroApp />
    </React.StrictMode>
  )
}
