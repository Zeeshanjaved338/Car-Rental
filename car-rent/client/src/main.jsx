import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import {MotionConfig} from 'motion/react'
import { AppProvider } from './context/AppContext';
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AppProvider>
    <MotionConfig viewport = {{once: true}}>
      <App />
    </MotionConfig>
  </AppProvider> 
  </BrowserRouter>
);
