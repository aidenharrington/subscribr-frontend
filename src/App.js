import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import UserHome from './user/userHome.tsx';
import LauncherHome from './launcher/launcherHome.tsx';

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LauncherHome />} />
          <Route path="/users/:userId" element={<UserHome />} />
        </Routes>
      </Router>
    );
}

export default App;
