import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import UserHome from './pages/userHome/UserHome.tsx';
import LauncherHome from './pages/launcher/Launcher.tsx';
import ErrorPage from './pages/error/ErrorPage.tsx'

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LauncherHome />} />
          <Route path="/users/:userIdParam" element={<UserHome />} />
          <Route path="/error" element={<ErrorPage />} />

          {/* Catch-all route for /users without userId */}
          <Route path="/users" element={<Navigate to="/error" />} />
        </Routes>
      </Router>
    );
}

export default App;
