import React, { useEffect, useState } from "react";
import { Layout, Button, Popover, Space, Flex } from "antd";
import axios from 'axios';
import "./header.scss";
import AppConfirmModal from "../AppConfirmModal/AppConfirmModal";
import { AppConfirmModalEnum, NO_IMAGE } from "../../_config/constant";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { getRoleFromToken } from "../../utils/jwtUtils";

const { Header } = Layout;

function HeaderAdmin() {
  const role = getRoleFromToken(localStorage.getItem('token') as string);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [confirmLogoutVisible, setShowConfirmLogoutVisible] =
    useState<boolean>(false);
  const [info, setInfo] = useState({
    role: "",
    username: "",
  });

  useEffect(() => {
    setInfo({
      role: localStorage.getItem("role") as string,
      username: localStorage.getItem("username") as string,

    });
  }, [
    localStorage.getItem("role"),
    localStorage.getItem("username"),
  ]);

  function clearRefreshTokenCookie() {
    document.cookie = 'refreshToken=; path=/; max-age=0; secure; samesite=strict';
  }

  const onLogoutClicked = () => {
    setShowConfirmLogoutVisible(true);
  };

  console.log(localStorage.getItem("role"), " role");
  return (
    <>
      <Header className="header-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {role !== "USER" &&
            <Flex gap="small" align="center">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/register")}
              >
                Tạo nhân viên
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/enter-notification")}
              >
                Tạo thông báo
              </Button>
            </Flex>
          }
        </div>
        <div>
          <Popover
            content={
              <Space direction="vertical">
                <Button
                  type="primary"
                  style={{ width: "180px" }}
                  onClick={onLogoutClicked}
                >
                  Đăng xuất
                </Button>
              </Space>
            }
            trigger="click"
          >
            <div className="wrapper-profile-admin">
              <img src={NO_IMAGE} alt="avatar" className="avatar" />
              <div className="wrapper-profile-admin-text">
                <p className="wrapper-profile-admin-text-name">{`${info.username} `}</p>
                <span className="wrapper-profile-admin-text-role">
                  {info.role}
                </span>
              </div>
            </div>
          </Popover>
        </div>
      </Header>

      <AppConfirmModal
        isVisible={confirmLogoutVisible}
        type={AppConfirmModalEnum.warning}
        title="Đăng Xuất"
        okTextButton="Đăng Xuất"
        onCancel={() => {
          setShowConfirmLogoutVisible(false);
        }}
        loading={loading}
        onOk={async () => {
          setLoading(true);

          try {
            await userService.logout(
              localStorage.getItem("username") as string,
            );

            // Sau khi gọi logout thành công mới xóa refreshToken cookie (nếu bạn tự quản lý nó từ frontend)
            clearRefreshTokenCookie();

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");

            toast.success("Đăng xuất thành công!", {
              position: "top-right",
              autoClose: 3000,
            });
            setTimeout(() => {
              navigate("/login");
            }, 2000);
          } catch (error) {
            toast.error("Lỗi khi đăng xuất");
            console.error(error);
          } finally {
            setLoading(false);
          }
        }}
      />
    </>
  );
}

export default HeaderAdmin;
