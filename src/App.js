import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './login';
import Dashboard from './dashboard';
import ServiceReport from './serviceReport'; 
import ServiceReportInput from './ServiceReportInput';
import Signature from "./signatureCanvas"

function App() {
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
              <>
                <Dashboard setIsAuthenticated={setIsAuthenticated} />
              </>
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={<Dashboard setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/serviceReport"
          element={<ServiceReport setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/serviceInput"
          element={<ServiceReportInput setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/signature"
          element={<Signature setIsAuthenticated={setIsAuthenticated} />}
        />
        
      </Routes>
    </div>
  );
}

export default App;
