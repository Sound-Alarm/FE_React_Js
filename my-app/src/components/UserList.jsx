// UserList.jsx
import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserList() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra đăng nhập
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/login');
            return;
        }

        // Kết nối WebSocket
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                // Subscribe to user updates
                client.subscribe('/topic/users', (message) => {
                    const updatedUsers = JSON.parse(message.body);
                    setUsers(updatedUsers);
                });
                // Subscribe to notifications
                client.subscribe('/topic/notifications', (message) => {
                    const notification = JSON.parse(message.body);
                    if (notification.type === 'LOGIN') {
                        toast.info(`${notification.username} vừa đăng nhập vào hệ thống!`, {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    }
                });
            }
        });

        client.activate();

        // Lấy danh sách user
        fetchUsers();

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users/online');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleLogout = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            await fetch(`http://localhost:8080/api/users/logout/${user.id}`, {
                method: 'POST'
            });
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="user-list-container">
            <ToastContainer />
            <h2>Danh Sách Người Dùng</h2>
            <button onClick={handleLogout} className="logout-btn">Đăng Xuất</button>
            <div className="user-list">
                {users.map(user => (
                    <div key={user.id} className="user-item">
                        <span className="username">{user.username}</span>
                        <span className={`status ${user.online ? 'online' : 'offline'}`}>
                            {user.online ? 'Online' : 'Offline'}
                        </span>
                        {!user.online && user.timeSinceLogout && (
                            <span className="last-logout">
                                Đăng xuất {user.timeSinceLogout}
                            </span>
                        )}
                        <span className="last-login">
                            Đăng nhập lúc: {new Date(user.lastLogin).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserList;