import React from 'react';
import './main.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import AppWrapper from './App';
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWrapper/>
    </BrowserRouter>
  </React.StrictMode>
)