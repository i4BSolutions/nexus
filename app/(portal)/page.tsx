"use client";

import MainMenuItemCard from "@/components/main-menu/MainMenuItemCard";
import { getAuthenticatedUser } from "@/helper/getUser";
import { createClient } from "@/lib/supabase/client";
import getAvatarUrl from "@/utils/getAvatarUrl";
import {
  DollarCircleOutlined,
  FileTextOutlined,
  HomeOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { User } from "@supabase/supabase-js";
import { Card, Col, Flex, Row, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MAIN_MENU_ITEMS = {
  procurement: [
    {
      icon: (
        <ShoppingCartOutlined
          style={{
            backgroundColor: "#40A9FF",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            borderRadius: 50,
          }}
        />
      ),
      title: "Purchase Orders",
      description: "Manage and track all purchase orders",
      route: "/purchase-orders",
    },
    {
      icon: (
        <FileTextOutlined
          style={{
            backgroundColor: "#FFC53D",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            borderRadius: 50,
          }}
        />
      ),
      title: "Invoices",
      description: "Manage and track all invoices",
      route: "/invoices",
    },
    {
      icon: (
        <TagsOutlined
          style={{
            backgroundColor: "#40A9FF",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            borderRadius: 50,
          }}
        />
      ),
      title: "Products",
      description: "Manage your product catalog",
      route: "/products",
    },
    {
      icon: (
        <ShopOutlined
          style={{
            backgroundColor: "#40A9FF",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            borderRadius: 50,
          }}
        />
      ),
      title: "Suppliers",
      description: "Manage your supplier directory",
      route: "/suppliers",
    },
  ],
  inventory: [
    {
      icon: (
        <SwapOutlined
          style={{
            backgroundColor: "#9254DE",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            borderRadius: 50,
          }}
        />
      ),
      title: "Stock Management",
      description: "Monitor and manage your inventory across warehouses",
      route: "/stock-management",
    },
    {
      icon: (
        <HomeOutlined
          style={{
            backgroundColor: "#9254DE",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            borderRadius: 50,
          }}
        />
      ),
      title: "Warehouses",
      description: "Manage your warehouses and distribution centers",
      route: "/warehouses",
    },
  ],
  finance: [
    {
      icon: (
        <DollarCircleOutlined
          style={{
            backgroundColor: "#36CFC9",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            borderRadius: 50,
          }}
        />
      ),
      title: "Budgets",
      description: "Create and manage budgets for projects and operations",
      route: "/budgets",
    },
    {
      icon: (
        <DollarCircleOutlined
          style={{
            backgroundColor: "#36CFC9",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            borderRadius: 50,
          }}
        />
      ),
      title: "Budget Allocations",
      description: "Manage and track budget allocations for purchase orders",
      route: "/budget-allocations",
    },
  ],
  administration: [
    {
      icon: (
        <TeamOutlined
          style={{
            backgroundColor: "#9254DE",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            borderRadius: 50,
          }}
        />
      ),
      title: "Users & Permissions",
      description:
        "Manage user accounts, permission templates and access rights",
      route: "/users",
    },
  ],
};

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const getUser = async () => {
      const user = await getAuthenticatedUser(supabase);
      setUser(user);
    };
    getUser();
  }, []);

  if (!user) return <Spin fullscreen />;

  return (
    <section className="grid h-full">
      <Card
        variant="borderless"
        style={{
          background: "linear-gradient(180deg, #F9F0FF 0%, #FFFFFF 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 346,
        }}
      >
        <Typography.Title
          style={{
            textAlign: "center",
            color: "#722ED1",
            fontSize: 30,
            fontWeight: 600,
          }}
        >
          Welcome to NEXUS!
        </Typography.Title>
        <Typography.Text
          style={{
            textAlign: "center",
            color: "#000000D9",
            fontWeight: 400,
            fontSize: 16,
          }}
        >
          Your comprehensive platform for efficient procurement, inventory
          control, and financial oversight with real-time insights.
        </Typography.Text>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 60,
          }}
        >
          <Card
            style={{
              maxHeight: 66,
              borderColor: "#EFDBFF",
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Flex gap={12} align="center">
              <img
                src={getAvatarUrl(user?.user_metadata?.username)}
                alt="avatar"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 50,
                }}
              />
              <Typography.Text
                style={{
                  color: "#000000D9",
                  fontWeight: 400,
                  fontSize: 16,
                }}
              >
                Hi, {user?.user_metadata?.full_name}
              </Typography.Text>
            </Flex>
          </Card>
        </div>
      </Card>
      <Card
        title="Procurement"
        style={{ marginTop: 24, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
      >
        <Row gutter={[8, 8]}>
          {MAIN_MENU_ITEMS.procurement.map((item) => (
            <Col span={12} key={item.title}>
              <MainMenuItemCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                onClick={() => {
                  router.push(item.route);
                }}
              />
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title="Inventory"
        style={{ marginTop: 24, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
      >
        <Row gutter={[8, 8]}>
          {MAIN_MENU_ITEMS.inventory.map((item) => (
            <Col span={12} key={item.title}>
              <MainMenuItemCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                onClick={() => {
                  router.push(item.route);
                }}
              />
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title="Finance"
        style={{ marginTop: 24, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
      >
        <Row gutter={[8, 8]}>
          {MAIN_MENU_ITEMS.finance.map((item) => (
            <Col span={12} key={item.title}>
              <MainMenuItemCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                onClick={() => {
                  router.push(item.route);
                }}
              />
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title="Administration"
        style={{ marginTop: 24, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
      >
        <Row gutter={[8, 8]}>
          {MAIN_MENU_ITEMS.administration.map((item) => (
            <Col span={24} key={item.title}>
              <MainMenuItemCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                onClick={() => {
                  router.push(item.route);
                }}
              />
            </Col>
          ))}
        </Row>
      </Card>
    </section>
  );
}
