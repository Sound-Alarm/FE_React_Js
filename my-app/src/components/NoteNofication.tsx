import React from "react";
import { Button, Col, Form, Row, Select, TimePicker } from "antd";
import TextArea from "antd/es/input/TextArea";

const NoteNofication = () => {
  const [form] = Form.useForm();
  const onFinish = async (values: any) => {
    console.log(values);
  };
  const optionsStatus = [
    {
      key: "1",
      value: "test",
      label: "Received",
    },
    {
      key: "2",
      value: "test2",
      label: "Processed",
    },
  ];

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
              <Form.Item name="status" label="Loại thông báo">
                <Select
                  size="large"
                  style={{ textAlign: "left" }}
                  placeholder="Chọn thông báo"
                  options={optionsStatus}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button size="large" type="primary" htmlType="submit">
              Phát thông báo
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NoteNofication;
