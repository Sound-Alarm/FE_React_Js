import React, { useEffect, useState } from "react";
import { Button, Col, Form, message, Row, Select, TimePicker } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router-dom";
import { workshopService } from "../services/workshopService";

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

interface NotificationReponse {
  id: string;
  name: string;
  code: string;
}

const NoteNofication = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationReponse[]>([]);
  const [disableDay, setDisableDay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [releaseDates, setReleaseDates] = useState<string[]>([]);
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const onFinish = async (values: any) => {
    try {
      let listOfReleaseDatesToSend = values.day;
      if (disableDay) {
        const today = new Date();
        const todayName = daysMap[today.getDay()];
        listOfReleaseDatesToSend = [todayName];
        setReleaseDates(listOfReleaseDatesToSend);
      }
      const response = await workshopService.postNotification({
        content: values.nofication,
        typeNotification: notifications.find(item => item.code === values.code) || { id: '', code: '', name: '' },
        timeAt: values.time,
        listOfReleaseDates: listOfReleaseDatesToSend,
      });
      console.log("Phản hồi từ API:", response);
      message.success("Tạo thông báo thành công!");
      form.resetFields();
      setReleaseDates([]);
      setDisableDay(false)
    } catch (error: any) {
      console.error("Lỗi khi tạo thông báo:", error);
      setReleaseDates([]);
      setDisableDay(false)
      if (error.response?.data?.message) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Không thể tạo thông báo. Vui lòng thử lại sau.");
      }
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await workshopService.getNoteNotifications();
        setNotifications(response);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        } else if (error?.response?.status === 403) {
          message.error("Bạn không có quyền truy cập vào tài nguyên này");
        } else {
          message.error("Không thể tải thông báo");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const optionsDaysOfWeek = [
    { label: "Thứ Hai", value: "Monday" },
    { label: "Thứ Ba", value: "Tuesday" },
    { label: "Thứ Tư", value: "Wednesday" },
    { label: "Thứ Năm", value: "Thursday" },
    { label: "Thứ Sáu", value: "Friday" },
    { label: "Thứ Bảy", value: "Saturday" },
    { label: "Chủ Nhật", value: "Sunday" },
  ];

  const notificationOptions = notifications.map((item) => ({
    label: item.name,
    value: item.code,
  }));

  const onNotificationChange = (value: string) => {
    if (value === "notification_emergency_0101222") {
      setDisableDay(true);
      // Nếu muốn reset ngày khi disable
      form.setFieldsValue({ day: [] });
    } else {
      setDisableDay(false);
    }
  };

  return (
    <div className="container">
      <div style={{ marginTop: "32px" }}>
        <Form
          onFinish={onFinish}
          layout="vertical"
          form={form}
          initialValues={{ gender: true }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item name="nofication" label="Nhập thông báo">
                <TextArea placeholder="Nhập thông báo" rows={3} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={4} lg={4} xl={4}>
              <Form.Item name="time" label="Chọn giờ">
                <TimePicker
                  size="large"
                  placeholder="Chọn giờ"
                  format="HH:mm:ss"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={4} lg={4} xl={4}>
              <Form.Item name="code" label="Loại thông báo">
                <Select
                  size="large"
                  style={{ textAlign: "left" }}
                  placeholder="Chọn thông báo"
                  options={notificationOptions}
                  onChange={onNotificationChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item name="day" label="Chọn thứ">
                <Select
                  size="large"
                  style={{ textAlign: "left" }}
                  placeholder="Chọn thứ"
                  mode="multiple"
                  options={optionsDaysOfWeek}
                  disabled={disableDay}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button size="large" type="primary" htmlType="submit">
              Tạo thông báo
            </Button>
            <Button style={{ border: " none", boxShadow: "none", textDecoration: "underline", backgroundColor: 'unset' }} size="large" block onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NoteNofication;
