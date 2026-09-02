import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Assessment from './pages/Assessment';
import Score from './pages/Score';
import Practice from './pages/Practice';
import PracticeModule from './pages/PracticeModule';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="navbar">
          <div className="brand">
            <span>⚡</span> iQPAC Student Module
          </div>
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink to="/register" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Register
                </NavLink>
              </li>
              <li>
                <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink to="/assessment" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Assessment
                </NavLink>
              </li>
              <li>
                <NavLink to="/score" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Score
                </NavLink>
              </li>
              <li>
                <NavLink to="/practice" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Practice
                </NavLink>
              </li>
            </ul>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/score" element={<Score />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:moduleId" element={<PracticeModule />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
