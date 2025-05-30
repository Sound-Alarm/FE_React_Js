import React from "react";
import { Card, Form, Input, Button, Select } from "antd";

interface RegisterFormValues {
  username: string;
  password: string;
  email: string;
  role: "manager" | "employee";
}

const RegisterForm: React.FC = () => {
  const roles = [
    { label: "Quản lý", value: "code-01" },
    { label: "Nhân viên", value: "code-02" },
  ];
  const onFinish = (values: RegisterFormValues) => {
    console.log("Thông tin đăng ký:", values);
    // Gửi request đăng ký tại đây
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card title="Đăng ký tài khoản" style={{ width: 400 }}>
        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            label="Chức vụ"
            name="code"
            style={{ textAlign: "left" }}
            rules={[{ required: true, message: "Vui lòng chọn chức vụ!" }]}
          >
            <Select size="large" placeholder="Chọn chức vụ">
              {roles.map((role: any) => (
                <Select.Option key={role.value} value={role.value}>
                  {role.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button size="large" type="primary" htmlType="submit" block>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterForm;
