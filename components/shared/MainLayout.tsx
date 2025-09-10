"use client";

import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/client";
import getAvatarUrl from "@/utils/getAvatarUrl";
import {
  AuditOutlined,
  ContactsOutlined,
  DollarCircleOutlined,
  DownOutlined,
  HomeOutlined,
  SettingOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { User } from "@supabase/supabase-js";
import {
  Button,
  Dropdown,
  Image,
  Input,
  Layout,
  Menu,
  MenuProps,
  Space,
  Spin,
  theme,
  Typography,
} from "antd";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const { Header, Content, Sider } = Layout;

const PARENT_KEY_MAP: Record<string, string> = {
  "purchase-orders": "procurement",
  invoices: "procurement",
  products: "procurement",
  suppliers: "procurement",
  "stock-management": "inventory",
  warehouses: "inventory",
  budgets: "finance",
  "budget-allocations": "finance",
  users: "administration",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const router = useRouter();
  const pathname = usePathname();
  const [userPermissions, setUserPermissions] = React.useState<any>({});
  const [user, setUser] = React.useState<User>();
  const [openKeys, setOpenKeys] = React.useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const authenticatedUser = await getAuthenticatedUser(createClient());
      setUserPermissions(authenticatedUser.user_metadata.permissions || {});
      setUser(authenticatedUser);
    };
    fetchUser();
  }, []);

  const pathSegments = pathname.split("/").filter(Boolean);
  const selectedKey = pathSegments[0] || "home";

  useEffect(() => {
    const parentKey = PARENT_KEY_MAP[selectedKey];
    if (parentKey) {
      setOpenKeys([parentKey]);
    } else {
      setOpenKeys([]);
    }
  }, [selectedKey]);

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
    budgets: "can_view_budgets_allocations",
    "budget-allocations": "can_view_budgets_allocations",
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
      key: "home",
      label: "Home",
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
    {
      key: "contacts",
      label: "Contacts",
      icon: <ContactsOutlined />,
      onClick: () => router.push("/contacts"),
    },
  ];

  const filteredMenu = filterMenu(MENU_ITEMS, userPermissions) || [];

  const items: MenuProps["items"] = [
    {
      label: (
        <Typography.Text>{user?.user_metadata?.full_name}</Typography.Text>
      ),
      key: "0",
      style: { cursor: "default" },
    },
    {
      label: <Typography.Text>{user?.email}</Typography.Text>,
      key: "1",
      style: { cursor: "default" },
    },
    {
      label: <Typography.Text>V1.0.1</Typography.Text>,
      key: "2",
      style: { cursor: "default" },
    },
    {
      type: "divider",
    },
    {
      label: "Logout",
      key: "3",
      onClick: handleSignOut,
    },
  ];

  if (!userPermissions || Object.keys(userPermissions).length === 0) {
    return (
      <Layout style={{ padding: "20px", background: colorBgContainer }}>
        <div className="h-screen grid place-items-center">
          <Spin />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
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

        <Dropdown menu={{ items }} trigger={["click"]}>
          <Typography.Text
            style={{ cursor: "pointer" }}
            onClick={(e) => e.preventDefault()}
          >
            <Space>
              <img
                src={getAvatarUrl(user?.user_metadata?.username)}
                alt="avatar"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 50,
                }}
              />
              {user?.user_metadata?.full_name}
              <DownOutlined />
            </Space>
          </Typography.Text>
        </Dropdown>
        {/* <Button type="default" onClick={handleSignOut}>
          Logout
        </Button> */}
      </Header>

      <Layout
        style={{
          padding: 20,
          background: colorBgContainer,
        }}
      >
        <Sider
          style={{
            position: "sticky",
            top: 84,
            height: "calc(100vh - 110px)",
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
            defaultSelectedKeys={["home"]}
            selectedKeys={[selectedKey]}
            openKeys={openKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
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
