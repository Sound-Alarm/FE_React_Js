import { getRoleFromToken } from '../utils/jwtUtils';
import React from "react";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {

    const role = getRoleFromToken(localStorage.getItem("token") || "");
    if (role !== "ADMIN") {
        // Redirect nếu không phải ADMIN
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

export default AdminRoute; 