"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Checkbox,
  Col,
  Form,
  GetProp,
  Row,
  Select,
  Spin,
  message,
  Button,
  Input,
} from "antd";
import { workshopService } from "../services/workshopService";
import "../Map/style.scss";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import AudibleCheckbox from "./AudibleCheckbox";
import NoteNofication from "../components/NoteNofication";
import Marquee from "../components/Marquee/Marquee";
import TextReader from "../components/TextReader";
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
  title: string;
  content: string;
  type: string;
  jobTypeId: number;
  indexTeam: number[];
  totalTeam: Teams[];
  thoiGianTao?: string;
  nameJobType: string;
  custer: Clusters;
  conveyorBelt: ConveyorBelt;
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<Teams[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<SelectedTeam[]>([]);
  const [selectedJobTypeEnum, setSelectedJobTypeEnum] = useState<JobType[]>([]);
  const [formRef] = Form.useForm();
  const [notifications, setNotifications] = useState<NotificationRequest[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentReadingIndex, setCurrentReadingIndex] = useState<number>(0);
  const [canAutoSpeak, setCanAutoSpeak] = useState(false);

  let jobTypeEnum: JobType[] = [
    {
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
    },
  ];

  const processTeamsAndSelectedTeams = (
    notifications: NotificationRequest[]
  ) => {
    if (!notifications || notifications.length === 0) {
      return;
    }

    // Tìm notification có totalTeam dài nhất
    const notificationWithMostTeams = notifications.reduce((prev, current) =>
      current.totalTeam.length > prev.totalTeam.length ? current : prev
    );
    setTeams(notificationWithMostTeams.totalTeam);

    // Xử lý selectedTeams
    let mappedSelectedTeams: SelectedTeam[] = notifications.flatMap(
      (notification) =>
        notification.indexTeam.map((index) => ({
          teamId: index,
          jobTypeId: notification.jobTypeId,
          indexTeam: [index],
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
        message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else if (error?.response?.status === 403) {
        message.error("Bạn không có quyền truy cập vào tài nguyên này");
      } else if (error?.response?.status === 405) {
        message.error("aaa");
      } else {
        message.error("Không thể tải thông tin phân xưởng");
      }
      setLoading(false);
    }
  };
  const turnOffNotifications = (id: string, indexTeam: number[]) => {
    console.log("turnOffNotification");
    console.log(id, indexTeam);
    workshopService.turnOffNotification(id, indexTeam).then((response) => {
      console.log(response);
    });
    setNotifications((prev) => {
      const updatedNotifications = prev.map((notification) => {
        if (notification.id === id) {
          // Lọc ra các indexTeam không nằm trong indexTeam cần tắt
          const newIndexTeam = notification.indexTeam.filter(
            (index) => !indexTeam.includes(index)
          );
          return {
            ...notification,
            indexTeam: newIndexTeam,
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
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to WebSocket");
        console.log("notifications", notifications);
        client.subscribe("/topic/thongbao", (message) => {
          const thongBao = JSON.parse(message.body);
          setNotifications((prev) => {
            const exists = prev.some(
              (notification) => notification.id === thongBao.id
            );
            if (exists) {
              // Nếu đã có, thay thế phần tử đó
              return prev.map((notification) =>
                notification.id === thongBao.id ? thongBao : notification
              );
            } else {
              // Nếu chưa có, thêm mới vào đầu mảng
              return [thongBao, ...prev];
            }
          });
        });

        // Subscribe cho thông báo xóa
        client.subscribe("/topic/thongbao/delete", (message) => {
          const data = JSON.parse(message.body);
          setNotifications((prev) => {
            // Lọc ra các notification không bị xóa
            const newNotifications = prev.filter(
              (notification) => notification.id !== data.id
            );
            processTeamsAndSelectedTeams(newNotifications);
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

  // useEffect(() => {
  //   // Lấy danh sách giọng đọc có sẵn
  //   const loadVoices = () => {
  //     const availableVoices = window.speechSynthesis.getVoices();
  //     console.log("Available voices:", availableVoices); // Log danh sách voices
  //     setVoices(availableVoices);

  //     // Ưu tiên tiếng Việt, fallback sang giọng đầu tiên
  //     const vietnameseVoice = availableVoices.find(
  //       (voice) => voice.lang === "vi-VN" || voice.name.toLowerCase().includes("vietnamese")
  //     );
  //     setSelectedVoice(vietnameseVoice || availableVoices[0] || null);
  //     if (!vietnameseVoice) {
  //       message.warning("Không tìm thấy giọng đọc tiếng Việt, sẽ dùng giọng mặc định.");
  //     }
  //   };

  //   loadVoices();
  //   window.speechSynthesis.onvoiceschanged = loadVoices;

  //   return () => {
  //     window.speechSynthesis.onvoiceschanged = null;
  //   };
  // }, []);

  // Tự động đọc notification khi có notifications
  // useEffect(() => {
  //   if (notifications.length === 0) {
  //     setIsSpeaking(false);
  //     return;
  //   }
  //   if (!isSpeaking) {
  //     setCurrentReadingIndex(0);
  //   }
  // }, [notifications]);

  // useEffect(() => {
  //   // Khi người dùng click hoặc nhấn phím, cho phép tự động đọc
  //   const handleUserInteraction = () => setCanAutoSpeak(true);
  //   window.addEventListener('click', handleUserInteraction, { once: true });
  //   window.addEventListener('keydown', handleUserInteraction, { once: true });
  //   return () => {
  //     window.removeEventListener('click', handleUserInteraction);
  //     window.removeEventListener('keydown', handleUserInteraction);
  //   };
  // }, []);

  useEffect(() => {
    if (canAutoSpeak && notifications.length > 0 && !isSpeaking) {
      const safeIndex = Math.min(currentReadingIndex, notifications.length - 1);
      const notification = notifications[safeIndex];
      if (notification && notification.content) {
        speakNotification(notification);
      }
    }
    // eslint-disable-next-line
  }, [canAutoSpeak, currentReadingIndex, notifications]);

  const speakNotification = (notification?: NotificationRequest) => {
    if (!notification || !notification.content || typeof notification.content !== 'string') {
      message.warning("Không có nội dung để đọc");
      return;
    }

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(notification.content);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } // Nếu không có selectedVoice, dùng giọng mặc định

      utterance.rate = 0.68;
      utterance.pitch = 2.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        timeoutRef.current = setTimeout(() => {
          setCurrentReadingIndex((prev) => {
            if (notifications.length === 0) return 0;
            return (prev + 1) % notifications.length;
          });
        }, 1000); // nghỉ 0.5s giữa các lần đọc
      };
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error("SpeechSynthesis error:", event);
        message.error("Có lỗi xảy ra khi đọc thông báo: " + (event.error || JSON.stringify(event)));
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div>
        <Marquee
          content={notifications}
        // onMarqueeChange={(notification) => {
        //   if (canAutoSpeak && notification && notification.content) {
        //     speakNotification(notification);
        //   }
        // }}
        />
        <div >
          <Row gutter={[0, 16]}>
            {jobTypeEnum.length > 0
              ? jobTypeEnum.map((item) => (
                <Col key={item?.id} xs={24} sm={24} md={24} lg={24} xl={6}>
                  <div style={{ cursor: "pointer" }}>
                    <div
                      style={{
                        backgroundColor: `${item?.color}`,
                        cursor: "pointer",
                        opacity: 1,
                      }}
                      className="wrapper-job-element-top"
                    >
                      <p>{item?.title}</p>
                    </div>
                    <div className="content-bottom">
                      {notifications
                        .filter(
                          (notification) => notification.jobTypeId === item.id
                        )
                        .map((notification) => {
                          return (
                            <div
                              key={notification.id}
                              className="notification-block"
                              style={{
                                background: "#fff",
                                borderRadius: 5,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                margin: "16px 0",
                                padding: 16,
                                borderLeft: `6px solid ${item.color}`,
                                transition: "box-shadow 0.2s",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: 8,
                                  gap: 16,
                                }}
                              >
                                <h4
                                  style={{
                                    margin: 0,
                                    color: item.color,
                                    fontWeight: 700,
                                    fontSize: 18,
                                    flex: 1,
                                  }}
                                >
                                  {notification.conveyorBelt.name}
                                </h4>
                                <h4
                                  style={{
                                    margin: 0,
                                    color: "#555",
                                    fontWeight: 500,
                                    fontSize: 16,
                                    flex: 1,
                                  }}
                                >
                                  {notification.custer.name}
                                </h4>
                                <span
                                  style={{
                                    background: "#f5f5f5",
                                    borderRadius: 8,
                                    padding: "2px 10px",
                                    fontSize: 13,
                                    color: "#888",
                                  }}
                                >
                                  {notification.nameJobType}
                                </span>
                              </div>
                              <div
                                className="wrapper-job-element-bottom"
                                style={{ marginTop: 8 }}
                              >
                                {notification.totalTeam.map((team: any) => {
                                  let isChecked =
                                    notification?.indexTeam.includes(
                                      team?.index
                                    ) || false;
                                  return (
                                    <div
                                      key={`${item.title}-${team?.index}`}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        marginBottom: 6,
                                        background: isChecked
                                          ? "#1A1A40"
                                          : "rgb(194, 190, 190)",
                                        borderRadius: 6,
                                        // padding: "4px 8px",
                                        border: "1px solid #000",
                                        marginTop: 6,
                                        color: isChecked
                                          ? "white !important"
                                          : "black !important",
                                      }}
                                    >
                                      <div
                                        onClick={
                                          isChecked && notification.id
                                            ? () =>
                                              turnOffNotifications(
                                                notification.id,
                                                [team.index]
                                              )
                                            : () => { }
                                        }
                                      >
                                        <AudibleCheckbox
                                          label={` ${team?.index}`}
                                          isWarning={isChecked}
                                          disabled={true}
                                        />
                                      </div>
                                      {/* {notification && (
                                        <Button
                                          type="text"
                                          size="small"
                                          onClick={() =>
                                            speakNotification(notification!)
                                          }
                                          disabled={isSpeaking}
                                          style={{
                                            color: isChecked
                                              ? "#d4380d"
                                              : "#888",
                                            fontSize: 18,
                                            background: "none",
                                            border: "none",
                                            boxShadow: "none",
                                          }}
                                        >
                                          🔊
                                        </Button>
                                      )} */}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </Col>
              ))
              : null}
          </Row>
        </div>
      </div>
      <TextReader />
    </div>
  );
};

export default NotificationScreen;
