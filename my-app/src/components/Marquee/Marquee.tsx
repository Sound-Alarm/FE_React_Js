import React, { useEffect, useState } from 'react';
import './style.scss';

interface NotificationRequest {
    id: string;
    title: string;
    content: string;
    type: string;
    jobTypeId: number;
    indexTeam: number[];
    thoiGianTao?: string;
    nameJobType: string;
}

const Marquee: React.FC<{ content: NotificationRequest[] }> = ({ content }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);

    // Reset currentIndex nếu mảng content thay đổi
    useEffect(() => {
        setCurrentIndex(0);
    }, [content]);

    if (!content || content.length === 0) return null;

    // Đảm bảo currentIndex luôn hợp lệ
    const safeIndex = currentIndex < content.length ? currentIndex : 0;
    const currentContent = content[safeIndex]?.content || '';

    const handleAnimationEnd = () => {
        setIsAnimating(false); // tắt animation để reset
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % content.length);
            setIsAnimating(true); // bật lại animation sau khi cập nhật
        }, 100); // delay nhỏ để trigger reflow
    };

    const screenWidth = window.innerWidth;
    const isMobile = screenWidth <= 575;

    // Độ dài chuỗi hiện tại
    const textLength = currentContent.length;


    const baseSpeed = 12;
    const mobileSpeed = 12;

    const duration = isMobile
        ? Math.max(3, textLength / mobileSpeed)
        : Math.max(9, textLength / baseSpeed);

    return (
        <div className="marquee-container">
            <div
                className={`marquee-content ${isAnimating ? 'animate' : ''}`}
                onAnimationEnd={handleAnimationEnd}
                style={{ animationDuration: `${duration}s` }}
            >
                {currentContent}
            </div>
        </div>
    );
};

export default Marquee;
