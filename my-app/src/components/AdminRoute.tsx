import React from "react";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
        // Redirect nếu không phải ADMIN
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

export default AdminRoute; 