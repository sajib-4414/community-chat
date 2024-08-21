import React from 'react';
import './main.css'
import ReactDOM from "react-dom/client";
import  AppWrapper from './App';
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
)

root.render(
  <React.StrictMode>
      <AppWrapper/>
  </React.StrictMode>
)