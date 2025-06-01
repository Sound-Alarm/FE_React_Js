import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Select, message } from "antd";
import { userService } from "../services/userService";

interface RegisterFormValues {
  username: string;
  password: string;
  email: string;
  code: string;
  conveyorBelt: ConveyorBelt;
}
interface Role {
  name: string;
  code: string;
}
export interface ConveyorBelt {
  id: string;
  name: string;
  index: number;
  clusters: Clusters[];
}


interface Clusters {
  name: string;
  index: number;
}
export interface ConveyorBeltRequest {
  id: string;
  name: string;
  index: number;
  clusters: ClustersRequest[];
}


interface ClustersRequest {
  name: string;
  index: number;
}
const RegisterForm: React.FC = () => {

  const [roles, setRoles] = useState<Role[]>([]);
  const [conveyorBelts, setConveyorBelts] = useState<ConveyorBelt[]>([]);
  const [selectedConveyorBelt, setSelectedConveyorBelt] = useState<ConveyorBeltRequest | null>(null);
  const [clusters, setClusters] = useState<Clusters[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<ClustersRequest | null>(null);
  const onFinish = async (values: RegisterFormValues) => {
    try {
      console.log("Thông tin đăng ký:", values);
      if (!selectedConveyorBelt) {
        message.error("Vui lòng chọn băng chuyền!");
        return;
      }
      let userForm = {
        username: values.username,
        password: values.password,
        email: values.email,
        code: values.code,
        conveyorBelt: selectedConveyorBelt,
      }
      const response = await userService.register(userForm);
      console.log(userForm);
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
    const fetchConveyorBelt = async () => {
      try {
        const conveyorBelts = await userService.getAllConveyorBelt();
        console.log("conveyorBelts");
        console.log(conveyorBelts);
        setConveyorBelts(conveyorBelts);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRole();
    fetchConveyorBelt();
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
          <Form.Item
            label="Vị trí làm việc"
            name="code"
            style={{ textAlign: "left" }}
            rules={[{ required: true, message: "Vui lòng chọn chức vụ!" }]}
          >
            <Select
              size="large"
              placeholder="Chọn băng chuyền"
              onChange={(value) => {
                setSelectedConveyorBelt(null);
                setSelectedCluster(null);
                setClusters([]);
                const selectedBelt = conveyorBelts.find((belt: any) => belt.id === value);
                if (selectedBelt) {
                  setSelectedConveyorBelt({
                    id: selectedBelt.id,
                    name: selectedBelt.name,
                    index: selectedBelt.index,
                    clusters: [],
                  });
                  console.log("selectedBelt", selectedBelt);
                  setClusters(selectedBelt.clusters);
                  console.log("conveyorBelt.clusters", selectedBelt.clusters);
                }
              }}
            >
              {conveyorBelts.map((conveyorBelt: any) => (
                <Select.Option key={conveyorBelt.id} value={conveyorBelt.id}>
                  {conveyorBelt.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              size="large"
              placeholder="Chọn vị trí làm việc"
              value={selectedCluster?.index ?? undefined}
              onChange={(value) => {
                const selectedCluster = clusters.find((cluster: any) => cluster.index === value);
                if (selectedCluster) {
                  setSelectedCluster(selectedCluster);
                  setSelectedConveyorBelt(prev =>
                    prev
                      ? { ...prev, clusters: [selectedCluster] }
                      : null
                  );
                  console.log("selectedCluster", selectedConveyorBelt);
                }
              }}
            >
              {clusters.map((cluster: any) => (
                <Select.Option key={cluster.index} value={cluster.index}>
                  {cluster.name}
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
