import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Map from "./Map/Map";
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
import { getRoleFromToken } from "./utils/jwtUtils";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import SpeechAssistant from "./components/TextReader";
import NoteNoficationModal from './components/NoteNofication/NoteNoficationModal';
// import TextToSpeech from "./components/TextToSpeech";
function App() {

  const role = getRoleFromToken(localStorage.getItem('token') as string);
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<AdminRoute><RegisterForm /></AdminRoute>} />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <div>
                  <HeaderAdmin />
                  <Map />
                </div>

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
                <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <div>
                    <HeaderAdmin />
                    <NotificationScreen />
                  </div>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/enter-notification"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <NoteNoficationModal isOpen={true} onClose={() => window.history.back()} />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route path="/text11" element={<SpeechAssistant />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;
