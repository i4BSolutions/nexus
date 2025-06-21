"use client";

import { createClient } from "@/lib/supabase/client";
import {
  ProductOutlined,
  TruckOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, MenuProps, theme } from "antd";
import { useRouter } from "next/navigation";
import React from "react";

const { Header, Content, Footer, Sider } = Layout;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const items2: MenuProps["items"] = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: "Users",
      onClick: () => router.push("/users"),
    },
    {
      key: "2",
      icon: <TruckOutlined />,
      label: "Suppliers",
      onClick: () => router.push("/suppliers"),
    },
    {
      key: "3",
      icon: <ProductOutlined />,
      label: "Products",
      onClick: () => router.push("/products"),
    },
  ];
  return (
    <Layout
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Button type="default" onClick={handleSignOut}>
          Logout
        </Button>
      </Header>
      <div
        style={{
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Layout
          style={{
            padding: "12px 0",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            flex: 1,
            display: "flex",
          }}
        >
          <Sider style={{ background: colorBgContainer }} width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={["1"]}
              defaultOpenKeys={["sub1"]}
              style={{ height: "100%" }}
              items={items2}
            />
          </Sider>
          <Content style={{ padding: "0 24px", height: "100%" }}>
            {children}
          </Content>
        </Layout>
      </div>
    </Layout>
  );
}
