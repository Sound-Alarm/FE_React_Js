// ThongBaoComponent.jsx
import React, { useEffect, useState, useRef } from 'react';
import { List, Card, Typography, Badge } from 'antd';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { SoundOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Notification = () => {
    const [thongBaoList, setThongBaoList] = useState([]);
    const [isReading, setIsReading] = useState(false);
    const speechRef = useRef(null);

    // Hàm đọc thông báo bằng Web Speech API
    const readNotification = (text) => {
        if ('speechSynthesis' in window) {
            // Dừng đọc nếu đang đọc
            window.speechSynthesis.cancel();

            // Tạo utterance mới
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN'; // Ngôn ngữ tiếng Việt
            utterance.rate = 1.0; // Tốc độ đọc
            utterance.pitch = 1.0; // Cao độ

            // Lưu utterance vào ref để có thể dừng sau này
            speechRef.current = utterance;

            // Bắt đầu đọc
            window.speechSynthesis.speak(utterance);
            setIsReading(true);

            // Khi đọc xong
            utterance.onend = () => {
                setIsReading(false);
            };

            // Xử lý lỗi
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                setIsReading(false);
            };
        }
    };

    // Hàm dừng đọc
    const stopReading = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsReading(false);
        }
    };

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                client.subscribe('/topic/thongbao', (message) => {
                    const thongBao = JSON.parse(message.body);
                    setThongBaoList(prev => [thongBao, ...prev]);
                    console.log(thongBao.noiDung);
                    readNotification(thongBao.noiDung);

                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
            }
        });

        client.activate();

        return () => {
            client.deactivate();
            stopReading(); // Dừng đọc khi component unmount
        };
    }, []);

    return (
        <div style={{ padding: '24px' }}>
            <Card title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SoundOutlined spin={isReading} />
                    <span>Thông báo</span>
                    {isReading && (
                        <button
                            onClick={stopReading}
                            style={{
                                marginLeft: 'auto',
                                padding: '4px 8px',
                                border: 'none',
                                background: '#ff4d4f',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Dừng đọc
                        </button>
                    )}
                </div>
            }>
                <List
                    dataSource={thongBaoList}
                    renderItem={(thongBao) => (
                        <List.Item>
                            <Card style={{ width: '100%' }}>
                                <Badge status="processing" text={thongBao.tieuDe} />
                                <Text>{thongBao.noiDung}</Text>
                            </Card>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default Notification;