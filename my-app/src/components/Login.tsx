import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosConfig";

interface LoginForm {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  username: string;
  role: string;
  refreshToken: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: LoginForm) => {
    try {
      // Gọi API đăng nhập
      const response = await axios.post<LoginResponse>(
        "http://localhost:8080/api/users/login",
        values
      );
      console.log(response);
      // Lưu token vào localStorage
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      message.success("Đăng nhập thành công!");
      navigate("/"); // Chuyển hướng về trang chủ
    } catch (error) {
      message.error("Đăng nhập thất bại!");
    }
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
      <Card title="Đăng nhập" style={{ width: 400 }}>
        <Form name="login" onFinish={onFinish} layout="vertical">
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
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item>
            <Button size="large" type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
