import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    console.log("hello")
    if (!(localStorage.getItem('token') !== null)) {
        // Nếu chưa đăng nhập, chuyển hướng về trang login
        return <Navigate to="/login" replace />;
    }

    // Nếu đã đăng nhập, render children
    return <>{children}</>;
};

export default ProtectedRoute; 