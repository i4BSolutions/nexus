"use client";

import { createClient } from "@/lib/supabase/client";
import {
  AuditOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  SettingOutlined,
  ShoppingOutlined,
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

  const MENU_ITEMS: MenuProps["items"] = [
    {
      key: "main-menu",
      label: "Main Menu",
      icon: <HomeOutlined />,
      onClick: () => router.push("/"),
    },
    {
      key: "procurement",
      label: "Procurement",
      icon: <ShoppingOutlined />,
      children: [
        {
          key: "purchase-orders",
          label: "Purchase Orders",
          onClick: () => router.push("/purchase-orders"),
        },
        {
          key: "invoices",
          label: "Invoices",
          onClick: () => router.push("/invoices"),
        },
        {
          key: "products",
          label: "Products",
          onClick: () => router.push("/products"),
        },
        {
          key: "suppliers",
          label: "Suppliers",
          onClick: () => router.push("/suppliers"),
        },
      ],
    },
    {
      key: "inventory",
      label: "Inventory",
      icon: <AuditOutlined />,
    },
    {
      key: "finance",
      label: "Finance",
      icon: <DollarCircleOutlined />,
      children: [
        {
          key: "budgets",
          label: "Budgets",
          onClick: () => router.push("/budgets"),
        },
        {
          key: "budget-allocations",
          label: "Budget Allocations",
          onClick: () => router.push("/budget-allocations"),
        },
      ],
    },
    {
      key: "administration",
      label: "Administration",
      icon: <SettingOutlined />,
      children: [
        {
          key: "users",
          label: "Users",
          onClick: () => router.push("/users"),
        },
      ],
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
              items={MENU_ITEMS}
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
