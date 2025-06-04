import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Space, Button, message, Form, Input, TimePicker, Progress, InputNumber, Slider, Modal } from 'antd';
import { DeleteOutlined, PlusOutlined, SoundOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';

const { Text } = Typography;
const { confirm } = Modal;

interface OfflineNotification {
    id: string;
    content: string;
    timeAt: string;
    typeNotification: {
        name: string;
    };
    listOfReleaseDates: string[];
    readingDuration?: number;
    repeatTimes?: number;
    readingSpeed?: number;
}

const OfflineNotificationReader: React.FC = () => {
    const [form] = Form.useForm();
    const [notifications, setNotifications] = useState<OfflineNotification[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAddingNotification, setIsAddingNotification] = useState(false);
    const [countdowns, setCountdowns] = useState<{ [key: string]: number }>({});
    const [currentRepeat, setCurrentRepeat] = useState<{ [key: string]: number }>({});
    const [readingSpeed, setReadingSpeed] = useState(0.9);
    const [notificationSound] = useState(new Audio('/notification.mp3')); // Thêm file âm thanh vào public folder

    // Tính toán thời gian đọc dựa trên độ dài nội dung
    const calculateReadingDuration = (text: string): number => {
        const words = text.split(/\s+/).length;
        return Math.ceil(words / 3);
    };

    // Cập nhật countdown mỗi giây
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });

            const newCountdowns: { [key: string]: number } = {};
            notifications.forEach(notification => {
                const [hours, minutes] = notification.timeAt.split(':').map(Number);
                const targetTime = new Date();
                targetTime.setHours(hours, minutes, 0);

                const diff = targetTime.getTime() - now.getTime();
                const secondsUntilReading = Math.floor(diff / 1000);

                if (secondsUntilReading > 0) {
                    newCountdowns[notification.id] = secondsUntilReading;
                }
            });

            setCountdowns(newCountdowns);
        }, 1000);

        return () => clearInterval(timer);
    }, [notifications]);

    // Thêm useEffect để kiểm tra thời gian và tự động đọc
    useEffect(() => {
        const checkTimeAndRead = () => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });

            notifications.forEach(notification => {
                if (notification.timeAt === currentTime && !isPlaying) {
                    message.info(`Đang đọc thông báo: ${notification.content}`);
                    setCurrentRepeat(prev => ({
                        ...prev,
                        [notification.id]: 0
                    }));
                    speakText(notification.content, notification.id, notification);
                }
            });
        };

        const interval = setInterval(checkTimeAndRead, 60000);
        checkTimeAndRead();
        return () => clearInterval(interval);
    }, [notifications, isPlaying]);

    const playNotificationSound = () => {
        notificationSound.currentTime = 0;
        notificationSound.play().catch(error => {
            console.log('Không thể phát âm thanh:', error);
        });
    };

    const speakText = (text: string, notificationId: string, notification: OfflineNotification) => {
        if (!notifications.find(n => n.id === notificationId)) {
            return;
        }

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.rate = readingSpeed;
            utterance.onstart = () => {
                playNotificationSound();
            };
            utterance.onend = () => {
                if (!notifications.find(n => n.id === notificationId)) {
                    setIsPlaying(false);
                    return;
                }

                const currentRepeatCount = currentRepeat[notificationId] || 0;
                const totalRepeats = notification.repeatTimes || 1;

                if (currentRepeatCount >= totalRepeats - 1) {
                    setIsPlaying(false);
                    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
                    setNotifications(updatedNotifications);
                    setCurrentRepeat(prev => {
                        const newState = { ...prev };
                        delete newState[notificationId];
                        return newState;
                    });
                    message.success('Đã đọc xong thông báo');
                    return;
                }

                setCurrentRepeat(prev => ({
                    ...prev,
                    [notificationId]: currentRepeatCount + 1
                }));

                speakText(text, notificationId, notification);
            };
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        } else {
            message.error('Trình duyệt của bạn không hỗ trợ chức năng đọc văn bản');
        }
    };

    // Thêm hàm đọc nội dung ngay lập tức
    const speakImmediately = (text: string) => {
        if (!text.trim()) {
            message.warning('Vui lòng nhập nội dung thông báo');
            return;
        }

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.rate = readingSpeed;
            utterance.onstart = () => {
                playNotificationSound();
            };
            utterance.onend = () => {
                setIsPlaying(false);
            };
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        } else {
            message.error('Trình duyệt của bạn không hỗ trợ chức năng đọc văn bản');
        }
    };

    const deleteNotification = (id: string) => {
        confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa thông báo này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }

                const updatedNotifications = notifications.filter(notif => notif.id !== id);
                setNotifications(updatedNotifications);

                setIsPlaying(false);
                setCurrentRepeat(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });

                message.success('Đã xóa thông báo');
            }
        });
    };

    const onFinish = (values: any) => {
        const timeValue = values.time ? values.time.format('HH:mm') : null;
        const readingDuration = calculateReadingDuration(values.content);

        const newNotification = {
            id: Date.now().toString(),
            content: values.content,
            timeAt: timeValue || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            typeNotification: {
                name: values.type || 'Thông báo thường'
            },
            listOfReleaseDates: [new Date().toLocaleDateString('en-US', { weekday: 'long' })],
            readingDuration,
            repeatTimes: values.repeatTimes || 1,
            readingSpeed
        };

        const updatedNotifications = [newNotification, ...notifications];
        setNotifications(updatedNotifications);

        form.resetFields();
        setIsAddingNotification(false);
        message.success('Đã thêm thông báo mới');
    };

    const formatCountdown = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours} giờ ${minutes} phút ${remainingSeconds} giây`;
        } else if (minutes > 0) {
            return `${minutes} phút ${remainingSeconds} giây`;
        } else {
            return `${remainingSeconds} giây`;
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: '18px' }}>Thông báo Offline</Text>
                    <Space>
                        <div style={{ width: 200, marginRight: 20 }}>
                            <Text type="secondary">Tốc độ đọc:</Text>
                            <Slider
                                min={0.5}
                                max={2}
                                step={0.1}
                                value={readingSpeed}
                                onChange={setReadingSpeed}
                                tooltip={{ formatter: value => `${value}x` }}
                            />
                        </div>
                        {!isAddingNotification && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsAddingNotification(true)}
                            >
                                Thêm thông báo
                            </Button>
                        )}
                    </Space>
                </div>

                {isAddingNotification && (
                    <Card title="Thêm thông báo mới">
                        <Form
                            form={form}
                            onFinish={onFinish}
                            layout="vertical"
                        >
                            <Form.Item
                                name="content"
                                label="Nhập nội dung thông báo"
                                rules={[{ required: true, message: 'Vui lòng nhập nội dung thông báo' }]}
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Nhập nội dung thông báo cần đọc"
                                    maxLength={500}
                                    showCount
                                    style={{ maxWidth: '800px', width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<SoundOutlined />}
                                        onClick={() => {
                                            const content = form.getFieldValue('content');
                                            speakImmediately(content);
                                        }}
                                        disabled={isPlaying}
                                    >
                                        Phát ngay
                                    </Button>

                                </Space>
                            </Form.Item>
                            <Form.Item
                                name="type"
                                label="Loại thông báo"
                            >
                                <Input placeholder="Nhập loại thông báo (tùy chọn)" />
                            </Form.Item>
                            <Form.Item
                                name="time"
                                label="Thời gian"
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                            >
                                <TimePicker format="HH:mm" placeholder="Chọn thời gian" />
                            </Form.Item>
                            <Form.Item
                                name="repeatTimes"
                                label="Số lần đọc thông báo"
                                initialValue={1}
                                tooltip="Số lần thông báo sẽ được đọc. Sau khi đọc đủ số lần, thông báo sẽ tự động bị xóa."
                            >
                                <InputNumber min={1} max={10} />
                            </Form.Item>
                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        Lưu thông báo
                                    </Button>
                                    <Button onClick={() => {
                                        setIsAddingNotification(false);
                                        form.resetFields();
                                    }}>
                                        Hủy
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                )}

                <List
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item>
                            <Card
                                title={`${item.typeNotification.name} - ${item.timeAt}`}
                                extra={
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => deleteNotification(item.id)}
                                    />
                                }
                                className={currentRepeat[item.id] !== undefined ? 'reading-animation' : ''}
                            >
                                <Text>{item.content}</Text>
                                <div style={{ marginTop: '10px' }}>
                                    <Text type="secondary">Ngày phát: {item.listOfReleaseDates.join(', ')}</Text>
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <Text type="secondary">Thời gian đọc: {item.readingDuration} giây</Text>
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <Text type="secondary">Số lần đọc: {item.repeatTimes}</Text>
                                </div>
                                {currentRepeat[item.id] !== undefined && (
                                    <div style={{ marginTop: '10px' }}>
                                        <Text type="secondary">
                                            <SoundOutlined style={{ marginRight: 8 }} />
                                            Đã đọc lần thứ {currentRepeat[item.id] + 1}/{item.repeatTimes}
                                        </Text>
                                    </div>
                                )}
                                {countdowns[item.id] && (
                                    <div style={{ marginTop: '10px' }}>
                                        <Text type="secondary">Còn {formatCountdown(countdowns[item.id])} nữa sẽ đọc</Text>
                                        <Progress
                                            percent={Math.round((countdowns[item.id] / (24 * 3600)) * 100)}
                                            size="small"
                                            status="active"
                                        />
                                    </div>
                                )}
                            </Card>
                        </List.Item>
                    )}
                />
            </Space>
        </div>
    );
};

export default OfflineNotificationReader; 