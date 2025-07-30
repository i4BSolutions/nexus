"use client";

import BudgetAllocationForm from "@/components/budget-allocations/BudgetAllocationForm";
import { useCreate } from "@/hooks/react-query/useCreate";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { message, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const createAllocation = async (formData: FormData) => {
  const res = await fetch("/api/budget-allocations", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create allocation");
  return data;
};

const CreateBudgetAllocationsPage = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: createAllocation,
    onSuccess: () => {
      message.success("Allocation created successfully!");
      router.push("/budget-allocations");
    },
    onError: (error: any) => {
      message.error(error.message || "Unexpected error");
    },
  });

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
      <BudgetAllocationForm
        onSubmit={(formData) => mutation.mutateAsync(formData)}
        isLoading={mutation.isPending}
        mode="create"
        onCancel={() => router.push("/budget-allocations")}
      />
    </section>
  );
};

export default CreateBudgetAllocationsPage;
