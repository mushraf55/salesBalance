// src/index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './login';
import Dashboard from './dashboard';

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={<Dashboard setIsAuthenticated={setIsAuthenticated} />}
        />
      </Routes>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <MainApp />
  </BrowserRouter>
);
