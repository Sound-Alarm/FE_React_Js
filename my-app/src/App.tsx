import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Map from './Map/Map';
import WorkshopDetail from './components/WorkshopDetail';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Notification from './components/Notification';
import './globals.scss';
import NotificationScreen from './NotificationScreen/NotificationScreen';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <Map />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workshop/:id"
            element={
              <ProtectedRoute>
                <WorkshopDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification"
            element={
              <ProtectedRoute>
                <Notification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification1"
            element={
              <ProtectedRoute>
                <NotificationScreen />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
