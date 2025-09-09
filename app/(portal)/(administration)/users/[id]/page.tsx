"use client";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import UserActivityLogTab from "@/components/users/UserActivityLogTab";
import UserPermissionsTab from "@/components/users/UserPermissionsTab";
import { useCreate } from "@/hooks/react-query/useCreate";
import { useGetById } from "@/hooks/react-query/useGetById";
import { useGetWithParams } from "@/hooks/react-query/useGetWithParams";
import { UserDetailResponse } from "@/types/user/user-detail.type";
import getAvatarUrl from "@/utils/getAvatarUrl";
import {
  EditOutlined,
  MailOutlined,
  RedoOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { App, Button, Flex, Spin, Tabs, Typography } from "antd";
import { useParams, useRouter } from "next/navigation";
import UserProfileTab from "../../../../../components/users/UserProfileTab";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();

  const { data: userDetailData, isLoading } = useGetById<UserDetailResponse>(
    "users",
    params.id as string
  );

  const { data: lastAdminData, isLoading: lastAdminDataLoading } =
    useGetWithParams<{ isLastAdmin: boolean }, { userId: string }>(
      "users/check-last-admin",
      { userId: params.id as string }
    );

  const { mutateAsync: deactivateUser } = useCreate("users/deactivate-user", [
    "users",
    params.id as string,
  ]);

  const { mutateAsync: reactivateUser } = useCreate("users/reactivate-user", [
    "users",
    params.id as string,
  ]);

  const { mutateAsync: resendVerificationEmail } = useCreate(
    "users/resend-verification"
  );

  const resendEmailHandler = () => {
    if (!userDetailData) return;
    resendVerificationEmail(
      {
        email: userDetailData.email,
        full_name: userDetailData.full_name,
        username: userDetailData.username,
        department: userDetailData.department.id,
        permissions: userDetailData.permissions,
      },
      {
        onSuccess: () => {
          message.success("Verification email resent successfully!");
        },
        onError: () => {
          message.error("Failed to resend verification email");
        },
      }
    );
  };

  const deactivateUserHandler = () => {
    deactivateUser(
      { userId: params.id as string },
      {
        onSuccess: () => {
          message.success("User deactivated successfully");
        },
        onError: () => {
          message.error("Failed to deactivate user");
        },
      }
    );
  };

  const reactivateUserHandler = () => {
    reactivateUser(
      { userId: params.id as string },
      {
        onSuccess: () => {
          message.success("User reactivated successfully");
        },
        onError: () => {
          message.error("Failed to reactivate user");
        },
      }
    );
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin />
      </div>
    );

  if (!userDetailData || !lastAdminData)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>User not found</p>
      </div>
    );

  const renderActionButtons = () => {
    if (
      userDetailData.login_audit_log?.length &&
      userDetailData.banned_until === null
    ) {
      return (
        <Button
          icon={<StopOutlined />}
          color="danger"
          variant="solid"
          onClick={deactivateUserHandler}
          disabled={lastAdminData.isLastAdmin}
        >
          Deactivate
        </Button>
      );
    } else if (
      userDetailData.login_audit_log?.length &&
      userDetailData.banned_until
    ) {
      return (
        <Button
          icon={<RedoOutlined />}
          color="primary"
          variant="solid"
          onClick={reactivateUserHandler}
        >
          Reactivate
        </Button>
      );
    } else {
      return (
        <Button
          icon={<MailOutlined />}
          color="primary"
          variant="solid"
          onClick={resendEmailHandler}
        >
          Resend Verification Email
        </Button>
      );
    }
  };

  const tabItems = [
    {
      key: "1",
      label: "Profile",
      children: <UserProfileTab data={userDetailData} />,
    },
    {
      key: "2",
      label: "Permissions",
      children: <UserPermissionsTab data={userDetailData} />,
    },
    {
      key: "3",
      label: "Activity Log",
      children: <UserActivityLogTab data={userDetailData} />,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="px-6">
        <Breadcrumbs
          items={[
            { title: "Home", href: "/" },
            { title: "Users & Permissions", href: "/users" },
            { title: userDetailData.full_name },
          ]}
        />
        <Flex justify="space-between" align="center" className="!mb-4">
          {/* Left Header */}
          <Flex align="center" gap={16} style={{ marginTop: "8px" }}>
            <img
              src={getAvatarUrl(userDetailData.username)}
              alt="avatar"
              className="rounded-full w-16 h-16 object-cover"
            />
            <div className="flex flex-col">
              <span className="font-medium text-xl">
                {userDetailData.full_name}
              </span>
              <Typography.Text type="secondary">
                {userDetailData.department.name}
              </Typography.Text>
            </div>
          </Flex>

          {/* Right Header */}
          <Flex align="center" gap={16}>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/users/${params.id}/edit`)}
            >
              Edit
            </Button>
            {renderActionButtons()}
          </Flex>
        </Flex>
      </div>

      {/* Purchase Order Detail Tabs */}
      <Tabs
        defaultActiveKey="1"
        items={tabItems}
        tabBarStyle={{
          padding: "0 28px",
        }}
        size="large"
      />
    </section>
  );
}
