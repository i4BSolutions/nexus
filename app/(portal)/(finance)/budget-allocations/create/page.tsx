"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import React from "react";

const CreateBudgetAllocationsPage = () => {
  const router = useRouter();
  return (
    <section className="max-w-7xl mx-auto py-4 px-6">
      <Space
        size="small"
        style={{
          display: "flex",
          marginBottom: "16px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space size="middle">
          <ArrowLeftOutlined
            style={{ fontSize: 16 }}
            onClick={() => router.back()}
          />
          <Space direction="vertical" size={0}>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              Create New Budget
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Configure a budget for project tracking and PO linking
            </Typography.Paragraph>
          </Space>
        </Space>
      </Space>
    </section>
  );
};

export default CreateBudgetAllocationsPage;
