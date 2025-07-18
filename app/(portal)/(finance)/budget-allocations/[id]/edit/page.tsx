"use client";

import BudgetAllocationForm from "@/components/budget-allocations/BudgetAllocationForm";
import { useGetById } from "@/hooks/react-query/useGetById";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { BudgetAllocationsInterface } from "@/types/budget-allocations/budget-allocations.type";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { App, Space, Spin, Typography } from "antd";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const updateAllocation = async ({
  id,
  data,
}: {
  id: string;
  data: FormData;
}) => {
  console.log(data);
  const res = await fetch(`/api/budget-allocations/${id}`, {
    method: "PUT",
    body: data,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update");
  return json;
};

const BudgetAllocationEditPage = () => {
  const params = useParams();
  const { message } = App.useApp();
  const router = useRouter();

  const { data, isLoading, error } = useGetById(
    "budget-allocations",
    params.id as string,
    !!params.id
  );

  const updateBudgetAllocation = useMutation({
    mutationFn: updateAllocation,
    onSuccess: () => {
      message.success("Budget allocation updated successfully");
      router.push("/budget-allocations");
    },
    onError: (error: any) => {
      message.error(error.message || "Unexpected error");
    },
  });

  if (error) {
    message.error(error.message);
    return null;
  }

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin />
      </div>
    );
  }

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
              Edit Budget Allocation
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Configure a budget for project tracking and PO linking
            </Typography.Paragraph>
          </Space>
        </Space>
      </Space>
      <BudgetAllocationForm
        mode="edit"
        initialValues={data as BudgetAllocationsInterface}
        isLoading={updateBudgetAllocation.isPending}
        onSubmit={async (formData: FormData) => {
          await updateBudgetAllocation.mutateAsync({
            id: params.id as string,
            data: formData,
          });
        }}
        onCancel={() => router.push("/budget-allocations")}
      />
    </section>
  );
};

export default BudgetAllocationEditPage;
