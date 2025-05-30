import React, { useEffect, useState } from "react";
import { Layout, Button, Popover, Space } from "antd";
import "./header.scss";
import AppConfirmModal from "../AppConfirmModal/AppConfirmModal";
import { AppConfirmModalEnum, NO_IMAGE } from "../../_config/constant";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

function HeaderAdmin() {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [confirmLogoutVisible, setShowConfirmLogoutVisible] =
    useState<boolean>(false);
  const [info, setInfo] = useState({
    role: "",
    email: "",
    avatar: "",
    firstName: "",
    lastName: "",
  });

  const fakeUser = {
    role: "code-01",
    email: "manager@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    firstName: "Nguyen",
    lastName: "Van A",
  };

  useEffect(() => {
    setInfo({
      role: fakeUser.role as string,
      email: fakeUser.email,
      avatar: fakeUser.avatar,
      firstName: fakeUser.firstName as string,
      lastName: fakeUser.lastName as string,
    });
  }, [
    fakeUser.role,
    fakeUser.email,
    fakeUser.lastName,
    fakeUser.firstName,
    fakeUser.avatar,
  ]);

  const onLogoutClicked = () => {
    setShowConfirmLogoutVisible(true);
  };

  return (
    <>
      <Header className="header-admin">
        <div className="exchange-rate">
          {/* Tỷ giá hôm nay: {formatCurrency(vietcombank.data, 'vi')} */}
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
                <p className="wrapper-profile-admin-text-name">{`${info.firstName} ${info.lastName}`}</p>
                <span className="wrapper-profile-admin-text-role">
                  {info.role === "code-01" ? "Quản lý" : "Nhân viên"}
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
          await setLoading(true);
          localStorage.removeItem("token"); // ví dụ
          toast.success("Đăng xuất thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          // await dispatch(
          //   setUserAuth({
          //     id: "",
          //     createdAt: "",
          //     updatedAt: "",
          //     deletedAt: null,
          //     role: "",
          //     email: "",
          //     firstName: null,
          //     lastName: null,
          //     avatar: "",
          //     phoneNumber: "",
          //   })
          // );
          // await dispatch(
          //   setTokenAuth({
          //     expiresIn: 0,
          //     accessToken: "",
          //     refreshToken: "",
          //   })
          // );
          await setLoading(false);
        }}
      />
    </>
  );
}

export default HeaderAdmin;
