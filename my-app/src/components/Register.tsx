import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Select, message } from "antd";
import { userService } from "../services/userService";

interface RegisterFormValues {
  username: string;
  password: string;
  email: string;
  code: string;
}
interface Role {
  name: string;
  code: string;
}
const RegisterForm: React.FC = () => {

  const [roles, setRoles] = useState<Role[]>([]);
  const onFinish = async (values: RegisterFormValues) => {
    try {
      console.log("Thông tin đăng ký:", values);
      const response = await userService.register(values);
      console.log(response);
      message.success("Đăng ký thành công!");
    } catch (error: any) {
      let msg = "Đăng ký thất bại!";
      const resData = error?.response?.data;

      if (typeof resData === "string") {
        msg = resData;
      } else if (resData?.message) {
        msg = resData.message;
      } else if (resData?.error) {
        msg = resData.error;
      }

      console.error("Lỗi đăng ký:", resData);
      message.error(msg);
    }
  };

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const roles = await userService.getAllRole();
        console.log("roles");
        console.log(roles);
        setRoles(roles);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRole();
  }, []);

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
                <Select.Option key={role.code} value={role.code}>
                  {role.name}
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
