'use client';

import React, { useEffect, useState } from 'react';
import { Checkbox, Col, Form, GetProp, Row, Select, Spin, message, Button } from 'antd';
import { workshopService } from '../services/workshopService';
import '../Map/style.scss';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import AudibleCheckbox from './AudibleCheckbox';

interface Workshop {
    id: string;
    code: string;
    name: string;
    manager: string;
    conveyorBelts: ConveyorBelt[];
}

interface Teams {
    name: string;
    index: number;
}

interface Clusters {
    name: string;
    index: number;
    teams: Teams[];
}

interface ConveyorBelt {
    name: string;
    index: number;
    clusters: Clusters[];
}

interface NotificationRequest {
    id: string;
    tieuDe: string;
    noiDung: string;
    type: string;
    jobTypeId: number;
    indexTeam: number[];
    totalTeam: Teams[];
    thoiGianTao?: string;
    nameJobType: string;
    custer: Clusters,
    conveyorBelt: ConveyorBelt,
}

interface JobType {
    id: number;
    title: string;
    color: string;
    teams?: Teams[];
}

interface SelectedJobType {
    id: number;
    teams?: Teams[];
}

interface SelectedTeam {
    teamId: number;
    jobTypeId: number;
    indexTeam: number[];
}

const NotificationScreen = () => {
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<Teams[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<SelectedTeam[]>([]);
    const [selectedJobTypeEnum, setSelectedJobTypeEnum] = useState<JobType[]>([]);
    const [formRef] = Form.useForm();
    const [notifications, setNotifications] = useState<NotificationRequest[]>([]);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentReadingIndex, setCurrentReadingIndex] = useState<number>(0);

    let jobTypeEnum: JobType[] = [{
        id: 1,
        title: "Cơ điện",
        color: "red",
    },
    {
        id: 2,
        title: " Tổ cắt",
        color: "green",
    },
    {
        id: 3,
        title: "Tổ trưởng",
        color: "blue",
    },
    {
        id: 4,
        title: "Kỹ thuật",
        color: "#B8860B",
    }];

    const processTeamsAndSelectedTeams = (notifications: NotificationRequest[]) => {
        if (!notifications || notifications.length === 0) {
            return;
        }

        // Tìm notification có totalTeam dài nhất
        const notificationWithMostTeams = notifications.reduce((prev, current) =>
            (current.totalTeam.length > prev.totalTeam.length) ? current : prev
        );
        setTeams(notificationWithMostTeams.totalTeam);

        // Xử lý selectedTeams
        let mappedSelectedTeams: SelectedTeam[] = notifications.flatMap(notification =>
            notification.indexTeam.map(index => ({
                teamId: index,
                jobTypeId: notification.jobTypeId,
                indexTeam: [index]
            }))
        );
        setSelectedTeams(mappedSelectedTeams);
    };

    const fetchNotifications = async () => {
        try {
            let notification = await workshopService.getNotifications();
            setNotifications(notification);
            setLoading(false);
            processTeamsAndSelectedTeams(notification);

        } catch (error: any) {
            if (error?.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            } else if (error?.response?.status === 403) {
                message.error('Bạn không có quyền truy cập vào tài nguyên này');
            }
            else if (error?.response?.status === 405) {
                message.error('aaa');
            } else {
                message.error('Không thể tải thông tin phân xưởng');
            }
            setLoading(false);
        }
    }
    const turnOffNotifications = (id: string, indexTeam: number[]) => {
        console.log('turnOffNotification');
        console.log(id, indexTeam);
        workshopService.turnOffNotification(id, indexTeam).then(response => {
            console.log(response);
        });
        setNotifications(prev => {
            const updatedNotifications = prev.map(notification => {
                if (notification.id === id) {
                    // Lọc ra các indexTeam không nằm trong indexTeam cần tắt
                    const newIndexTeam = notification.indexTeam.filter(
                        index => !indexTeam.includes(index)
                    );
                    return {
                        ...notification,
                        indexTeam: newIndexTeam
                    };
                }
                return notification;
            });
            processTeamsAndSelectedTeams(updatedNotifications);
            return updatedNotifications;
        });
    };
    useEffect(() => {
        fetchNotifications();
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                console.log('notifications', notifications);
                client.subscribe('/topic/thongbao', (message) => {
                    const thongBao = JSON.parse(message.body);
                    setNotifications(prev => {
                        const exists = prev.some(notification => notification.id === thongBao.id);
                        if (exists) {
                            // Nếu đã có, thay thế phần tử đó
                            return prev.map(notification =>
                                notification.id === thongBao.id ? thongBao : notification
                            );
                        } else {
                            // Nếu chưa có, thêm mới vào đầu mảng
                            return [thongBao, ...prev];
                        }
                    });
                });

                // Subscribe cho thông báo xóa
                client.subscribe('/topic/thongbao/delete', (message) => {
                    const data = JSON.parse(message.body);
                    setNotifications(prev => {
                        // Lọc ra các notification không bị xóa
                        const newNotifications = prev.filter(notification =>
                            notification.id !== data.id
                        );
                        processTeamsAndSelectedTeams(newNotifications);
                        return newNotifications;
                    });
                    console.log('Deleted notification:', {
                        id: data.id,
                        type: data.type,
                        message: data.message
                    });
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
            }
        });
        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    useEffect(() => {
        // Lấy danh sách giọng đọc có sẵn
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);

            // Tìm giọng tiếng Việt
            const vietnameseVoice = availableVoices.find(
                voice => voice.lang === 'vi-VN' || voice.name.includes('Vietnamese')
            );

            if (vietnameseVoice) {
                setSelectedVoice(vietnameseVoice);
            } else {
                message.warning('Không tìm thấy giọng đọc tiếng Việt. Vui lòng cài đặt gói ngôn ngữ tiếng Việt cho hệ thống.');
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // Tự động đọc notification khi có notifications
    useEffect(() => {
        if (notifications.length === 0) {
            setIsSpeaking(false);
            return;
        }
        if (!isSpeaking) {
            setCurrentReadingIndex(0);
        }
    }, [notifications]);

    useEffect(() => {
        if (
            notifications.length > 0 &&
            !isSpeaking
        ) {
            speakNotification(notifications[currentReadingIndex]);
        }
        // eslint-disable-next-line
    }, [currentReadingIndex, notifications]);

    const speakNotification = (notification: NotificationRequest) => {
        if (!notification.noiDung) {
            message.warning('Không có nội dung để đọc');
            return;
        }

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(notification.noiDung);

            if (selectedVoice) {
                utterance.voice = selectedVoice;
                utterance.lang = selectedVoice.lang;
            } else {
                message.error('Không tìm thấy giọng đọc tiếng Việt');
                return;
            }

            utterance.rate = 0.68;
            utterance.pitch = 2.0;
            utterance.volume = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                setTimeout(() => {
                    setCurrentReadingIndex(prev => {
                        if (notifications.length === 0) return 0;
                        // Đọc lặp lại từ đầu nếu còn notifications
                        return (prev + 1) % notifications.length;
                    });
                }, 1000); // nghỉ 0.5s giữa các lần đọc
            };
            utterance.onerror = (event) => {
                setIsSpeaking(false);
                message.error('Có lỗi xảy ra khi đọc thông báo');
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <div className='wrapper-job'>
                {jobTypeEnum.length > 0 ? jobTypeEnum.map((item) =>
                    <div
                        className='wrapper-job-element'
                        key={item?.id}
                        style={{ cursor: 'pointer' }}
                    >
                        <div
                            style={{
                                backgroundColor: `${item?.color}`,
                                cursor: 'pointer',
                                opacity: 1
                            }}
                            className='wrapper-job-element-top'
                        >
                            <p>{item?.title}</p>
                        </div>
                        {notifications
                            .filter(notification => notification.jobTypeId === item.id)
                            .map((notification) => {
                                return (
                                    <div
                                        key={notification.id}
                                        style={{
                                            background: '#fff',
                                            borderRadius: 12,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            margin: '16px 0',
                                            padding: 16,
                                            borderLeft: `6px solid ${item.color}`,
                                            transition: 'box-shadow 0.2s',
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: 8,
                                            gap: 16,
                                        }}>
                                            <h4 style={{
                                                margin: 0,
                                                color: item.color,
                                                fontWeight: 700,
                                                fontSize: 18,
                                                flex: 1,
                                            }}>
                                                {notification.conveyorBelt.name}
                                            </h4>
                                            <h4 style={{
                                                margin: 0,
                                                color: '#555',
                                                fontWeight: 500,
                                                fontSize: 16,
                                                flex: 1,
                                            }}>
                                                {notification.custer.name}
                                            </h4>
                                            <span style={{
                                                background: '#f5f5f5',
                                                borderRadius: 8,
                                                padding: '2px 10px',
                                                fontSize: 13,
                                                color: '#888',
                                            }}>
                                                {notification.nameJobType}
                                            </span>
                                        </div>
                                        <div className='wrapper-job-element-bottom' style={{ marginTop: 8 }}>
                                            {notification.totalTeam.map((team) => {
                                                let isChecked = notification?.indexTeam.includes(team.index) || false;
                                                return (
                                                    <div
                                                        key={`${item.title}-${team.index}`}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            marginBottom: 6,
                                                            background: isChecked ? '#ffeaea' : 'transparent',
                                                            borderRadius: 6,
                                                            padding: '4px 8px',
                                                        }}
                                                    >
                                                        <div onClick={isChecked && notification.id ? () => turnOffNotifications(notification.id, [team.index]) : () => { }}>
                                                            <AudibleCheckbox
                                                                label={`Tổ ${team.index}`}
                                                                isWarning={isChecked}
                                                                disabled={true}
                                                            />
                                                        </div>
                                                        {notification && (
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                onClick={() => speakNotification(notification!)}
                                                                disabled={isSpeaking}
                                                                style={{
                                                                    color: isChecked ? '#d4380d' : '#888',
                                                                    fontSize: 18,
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    boxShadow: 'none',
                                                                }}
                                                            >
                                                                🔊
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                ) : null}
            </div>
            {isSpeaking && (
                <Button
                    danger
                    onClick={stopSpeaking}
                    style={{ position: 'fixed', bottom: '20px', right: '20px' }}
                >
                    Dừng đọc
                </Button>
            )}
        </div>
    );
};

export default NotificationScreen; 