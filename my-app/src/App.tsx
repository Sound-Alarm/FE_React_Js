import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Map from "./Map/Map";
import WorkshopDetail from "./components/WorkshopDetail";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Notification from "./components/Notification";
import "./globals.scss";
import NotificationScreen from "./NotificationScreen/NotificationScreen";
import NoteNofication from "./components/NoteNofication";
import Register from "./components/Register";
import HeaderAdmin from "./components/HeaderAdmin/HeaderAdmin";
import AdminRoute from "./components/AdminRoute";
import RegisterForm from "./components/Register";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<AdminRoute><RegisterForm /></AdminRoute>} />
          <Route
            path="/map"
            element={
              // <ProtectedRoute>
              <div>
                <HeaderAdmin />
                <Map />
              </div>

              // </ProtectedRoute>
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
              // <ProtectedRoute>
              <div>
                <HeaderAdmin />
                <NotificationScreen />
              </div>
              // </ProtectedRoute>
            }
          />
          <Route
            path="/enter-notification"
            element={
              <ProtectedRoute>
                <NoteNofication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={<Register />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
