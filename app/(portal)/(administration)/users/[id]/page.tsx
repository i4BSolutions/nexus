"use client";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import UserActivityLogTab from "@/components/users/UserActivityLogTab";
import UserPermissionsTab from "@/components/users/UserPermissionsTab";
import { useGetById } from "@/hooks/react-query/useGetById";
import { UserDetailResponse } from "@/types/user/user-detail.type";
import getAvatarUrl from "@/utils/getAvatarUrl";
import { EditOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Flex, Spin, Tabs, Typography } from "antd";
import { useParams } from "next/navigation";
import UserProfileTab from "../../../../../components/users/UserProfileTab";

export default function UserDetailPage() {
  const params = useParams();

  const { data: userDetailData, isLoading } = useGetById<UserDetailResponse>(
    "users",
    params.id as string
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin />
      </div>
    );

  if (!userDetailData)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>User not found</p>
      </div>
    );

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
    <section className="px-4">
      {/* Header Section */}
      <div className="px-6">
        <Breadcrumbs
          items={[
            { title: "Home", href: "/" },
            { title: "Users & Permissions", href: "/users" },
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
              onClick={() => alert("This feature is not implemented yet")}
            >
              Edit
            </Button>
            <Button
              icon={<StopOutlined />}
              color="danger"
              variant="solid"
              onClick={() => alert("This feature is not implemented yet")}
            >
              Deactivate
            </Button>
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
