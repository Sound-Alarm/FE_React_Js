// components/RoleProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getRoleFromToken } from "../utils/jwtUtils";

interface Props {
    allowedRoles: string[];
    children: React.ReactNode;
}

const RoleProtectedRoute: React.FC<Props> = ({ allowedRoles, children }) => {
    const role = getRoleFromToken(localStorage.getItem("token") || "");

    if (!allowedRoles.includes(role || "")) {
        return <div>Access Denied</div>; // hoặc Navigate to="/" nếu muốn redirect
    }

    return <>{children}</>;
};

export default RoleProtectedRoute;
