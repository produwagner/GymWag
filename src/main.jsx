import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Bloqueia cópia e recorte de texto fora de campos editáveis (inputs/textareas)
const preventCopyCut = (e) => {
  const target = e.target;
  const isEditable = 
    target.tagName === 'INPUT' || 
    target.tagName === 'TEXTAREA' || 
    target.isContentEditable;
    
  if (!isEditable) {
    e.preventDefault();
  }
};

document.addEventListener('copy', preventCopyCut);
document.addEventListener('cut', preventCopyCut);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
