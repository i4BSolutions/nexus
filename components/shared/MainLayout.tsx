"use client";

import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/client";
import {
  AuditOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  SettingOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { Button, Image, Layout, Menu, MenuProps, theme } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const { Header, Content, Sider } = Layout;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const router = useRouter();
  const [userPermissions, setUserPermissions] = React.useState<any>({});

  useEffect(() => {
    const fetchUser = async () => {
      const authenticatedUser = await getAuthenticatedUser(createClient());
      setUserPermissions(authenticatedUser.user_metadata.permissions || {});
      console.log(
        "Authenticated User:",
        authenticatedUser.user_metadata.permissions
      );
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const PERMISSION_MAP: Record<string, string> = {
    "purchase-orders": "can_view_purchase_orders",
    invoices: "can_view_invoices",
    products: "can_view_products_suppliers",
    suppliers: "can_view_products_suppliers",
    "stock-management": "can_view_stock",
    warehouses: "can_view_warehouses",
    budgets: "can_view_budget_allocations",
    "budget-allocations": "can_view_budget_allocations",
    users: "can_manage_users",
  };

  function filterMenu(
    items: MenuProps["items"],
    permissions: Record<string, boolean>
  ) {
    return items
      ?.map((item) => {
        if (!item) return null;

        // If the item has children, just filter the children
        if ("children" in item && item.children) {
          const children = item.children.filter((child) => {
            const key = child?.key as string;
            const perm = PERMISSION_MAP[key];
            return !perm || permissions[perm];
          });

          return children.length ? { ...item, children } : null;
        }

        // Leaf item: check permission
        const perm = PERMISSION_MAP[item.key as string];
        return !perm || permissions[perm] ? item : null;
      })
      .filter(Boolean) as MenuProps["items"];
  }

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
      children: [
        {
          key: "stock-management",
          label: "Stock Management",
          onClick: () => router.push("/stock-management"),
        },
        {
          key: "warehouses",
          label: "Warehouses",
          onClick: () => router.push("/warehouses"),
        },
      ],
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
          label: "Users & Permissions",
          onClick: () => router.push("/users"),
        },
      ],
    },
  ];

  const filteredMenu = filterMenu(MENU_ITEMS, userPermissions);

  return (
    <Layout
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: colorBgContainer,
          borderBottom: "1px solid #F0F0F0 ",
          padding: "0 16px 0 32px",
        }}
      >
        <Image
          src="/nexus_logo.svg"
          alt="Nexus Logo"
          preview={false}
          width={140}
          height={40}
        />

        <Button type="default" onClick={handleSignOut}>
          Logout
        </Button>
      </Header>

      <Layout
        style={{
          padding: 20,
          background: colorBgContainer,
        }}
      >
        <Sider
          style={{
            background: colorBgContainer,
            borderRadius: 16,
            boxShadow:
              " 0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 9px 28px 8px rgba(0, 0, 0, 0.05)",
            marginRight: 8,
          }}
          width={208}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={["main-menu"]}
            style={{ height: "100%", borderRadius: 16 }}
            items={filteredMenu}
          />
        </Sider>
        <Content style={{ padding: "0 24px", height: "100%" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
