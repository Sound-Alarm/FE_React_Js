// src/services/websocket.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

export const connectWebSocket = (onMessageReceived) => {
    const socket = new SockJS('http://localhost:8080/ws'); // Đường dẫn endpoint WS backend
    stompClient = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
            console.log('WebSocket connected');
            stompClient.subscribe('/topic/thong-bao', (message) => {
                if (message.body) {
                    const data = JSON.parse(message.body);
                    onMessageReceived(data);
                }
            });
        },
        onStompError: (frame) => {
            console.error('Broker reported error: ', frame.headers['message']);
        },
    });

    stompClient.activate();
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
    }
};
