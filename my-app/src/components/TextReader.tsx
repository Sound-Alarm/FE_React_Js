import React, { useState, useEffect, useRef } from 'react';
import { workshopService } from '../services/workshopService';
import { message } from 'antd';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
// Định nghĩa kiểu dữ liệu mới
type NotificationReadResponse = {
    id: string;
    code: string;
    content: string;
    title: string;
    oneRead: boolean;
    readAt: string; // epoch seconds dưới dạng string
};

const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const tsNum = Number(timestamp);
    if (isNaN(tsNum)) return '';
    const date = new Date(tsNum * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const TextReader: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationReadResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
    const isReadingAllRef = useRef(false);
    const notificationsRef = useRef(notifications);
    const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    // Tự động bắt đầu đọc khi có thông báo mới, nếu đang bật đọc
    useEffect(() => {
        if (notifications.length > 0 && isReadingAllRef.current && !isSpeaking) {
            readAllTexts(0);
        }
    }, [notifications, isSpeaking]);

    useEffect(() => {
        const synth = window.speechSynthesis;
        const loadVoices = () => {
            const availableVoices = synth.getVoices();
            setVoices(availableVoices);
            const voice = availableVoices.find(v => v.lang.includes('vi')) ||
                availableVoices.find(v => v.lang.includes('en')) || null;
            setSelectedVoice(voice);
        };
        if (synth.getVoices().length > 0) {
            loadVoices();
        }
        synth.onvoiceschanged = loadVoices;
        return () => {
            synth.onvoiceschanged = null;
            synth.cancel();
        };
    }, []);

    useEffect(() => {
        const fetchWorkshop = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return message.error('Vui lòng đăng nhập lại');

                const res = await workshopService.getNotificationReading();
                setNotifications(res);
            } catch (error: any) {
                message.error('Không thể tải thông tin thông báo');
            }
        };
        fetchWorkshop();
    }, []);

    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("Connected to WebSocket");
                console.log("notifications", notifications);
                client.subscribe("/topic/notification_read", (message) => {
                    const notificationResponse = JSON.parse(message.body);
                    setNotifications((prev) => {
                        const exists = prev.some(
                            (notification) => notification.id === notificationResponse.id
                        );
                        if (exists) {
                            // Nếu đã có, thay thế phần tử đó
                            return prev.map((notification) =>
                                notification.id === notificationResponse.id ? notificationResponse : notification
                            );
                        } else {
                            // Nếu chưa có, thêm mới vào đầu mảng
                            return [notificationResponse, ...prev];
                        }
                    });
                });
                client.subscribe("/topic/notification_read_first", (message) => {
                    const notificationResponse = JSON.parse(message.body);
                    console.log("notificationResponse", notificationResponse);
                    setNotifications((prev) => {
                        return [notificationResponse, ...prev];
                    });
                    console.log("notifications", notificationResponse);
                });

                // Subscribe cho thông báo xóa
                client.subscribe("/topic/notification_read/delete", (message) => {
                    const data = JSON.parse(message.body);
                    setNotifications((prev) => {
                        // Lọc ra các notification không bị xóa
                        const newNotifications = prev.filter(
                            (notification) => notification.id !== data.id
                        );
                        return newNotifications;
                    });
                    console.log("Deleted notification:", {
                        id: data.id,
                        type: data.type,
                        message: data.message,
                    });
                });
            },
            onDisconnect: () => {
                console.log("Disconnected from WebSocket");
            },
        });
        client.activate();

        return () => {
            client.deactivate();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const speakText = (text: string, onEnd: () => void, onError: () => void) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
        }
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.onend = onEnd;
        utterance.onerror = onError;
        synth.speak(utterance);
    };

    const readAllTexts = (index = 0) => {

        const list = notificationsRef.current;
        notifications.map(item => {
            console.log(item.readAt)
        });
        if (!isReadingAllRef.current || list.length === 0) {
            setIsSpeaking(false);
            setCurrentTextIndex(0);
            return;
        }

        if (index >= list.length) {
            // Đã duyệt hết danh sách mà không tìm thấy thông báo phù hợp
            // Dừng đọc và đặt timer 60s sau gọi lại
            setIsSpeaking(false);
            setCurrentTextIndex(0);

            if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
            checkTimeoutRef.current = setTimeout(() => {
                if (isReadingAllRef.current && notificationsRef.current.length > 0) {
                    readAllTexts(0);
                }
            }, 60000); // 60 giây

            return;
        }

        setIsSpeaking(true);
        setCurrentTextIndex(index);
        const currentText = list[index];

        const now = new Date();
        const currentTime = new Date().toTimeString().slice(0, 5); // "HH:mm"
        const textReadTime = currentText.readAt; // Đã là "HH:mm"
        console.log('Current time:', currentTime);
        console.log('Text read time:', textReadTime);
        console.log(textReadTime && textReadTime !== currentTime);

        if (textReadTime && textReadTime !== currentTime) {
            // Chuyển sang thông báo tiếp theo
            readAllTexts(index + 1);
            return;
        }

        // Nếu đang có timer check chờ, hủy đi vì đã tìm được thông báo phù hợp
        if (checkTimeoutRef.current) {
            clearTimeout(checkTimeoutRef.current);
            checkTimeoutRef.current = null;
        }

        speakText(
            currentText.content,
            () => {
                if (currentText.oneRead) {
                    setNotifications(prev => {
                        const updated = prev.filter(item => item.id !== currentText.id);
                        notificationsRef.current = updated;
                        return updated;
                    });

                    if (notificationsRef.current.length === 0) {
                        isReadingAllRef.current = false;
                        setIsSpeaking(false);
                        setCurrentTextIndex(0);
                        return;
                    }
                }
                const nextIndex = index + 1 >= notificationsRef.current.length ? 0 : index + 1;
                readAllTexts(nextIndex);
            },
            () => {
                setIsSpeaking(false);
                setCurrentTextIndex(0);
                isReadingAllRef.current = false;
            }
        );
    };

    const startReadingAll = () => {
        if (!isSpeaking && notificationsRef.current.length > 0) {
            isReadingAllRef.current = true;
            readAllTexts(0);
        }
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        isReadingAllRef.current = false;
        setIsSpeaking(false);
        setCurrentTextIndex(0);
    };

    const handleDeleteText = (id: string) => {
        setNotifications(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div style={{ padding: 20 }}>
            <div>
                <h3>Danh sách thông báo:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {notifications.map((item, index) => (
                        <>
                            {item.content.length > 0 && item.title.length > 0 && <div key={item.id} style={{
                                padding: 10,
                                background: currentTextIndex === index && isSpeaking ? '#4CAF50' : item.oneRead ? '#fff3cd' : '#f0f0f0',
                                color: currentTextIndex === index && isSpeaking ? 'white' : 'black',
                                borderRadius: 4,
                                position: 'relative'
                            }}>
                                <strong>{item.title}</strong>
                                {item.oneRead && <span style={{ marginLeft: 5 }}>📌</span>}
                                {item.readAt && (
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        Đọc lúc: {item.readAt}
                                    </div>
                                )}
                                <div>{item.content}</div>
                                <button onClick={() => handleDeleteText(item.id)} style={{
                                    position: 'absolute',
                                    top: 5,
                                    right: 5,
                                    background: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 24,
                                    height: 24,
                                    cursor: 'pointer'
                                }}>×</button>
                            </div>}

                        </>

                    ))}
                </div>
            </div>

            <div style={{ marginTop: 20 }}>
                <label>Chọn giọng đọc:</label>
                <select value={selectedVoice?.name || ''} onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice || null);
                }}>
                    {voices.map(voice => (
                        <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginTop: 20 }}>
                <button onClick={startReadingAll} disabled={isSpeaking || notifications.length === 0}>
                    🔊 {isSpeaking ? 'Đang đọc...' : 'Đọc tất cả'}
                </button>
                <button onClick={stopSpeaking} disabled={!isSpeaking} style={{ marginLeft: 10 }}>
                    🛑 Dừng đọc
                </button>
            </div>

            {isSpeaking && (
                <div style={{ marginTop: 10 }}>
                    Đang đọc thông báo {currentTextIndex + 1}/{notifications.length}
                </div>
            )}
        </div>
    );
};

export default TextReader;
