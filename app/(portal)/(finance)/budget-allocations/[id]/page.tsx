"use client";

import BudgetAllocationConfirmModal from "@/components/budget-allocations/BudgetAllocationConfirmModal";
import BudgetAllocationDetails from "@/components/budget-allocations/BudgetAllocationDetails";
import BudgetAllocationLinkedPOView from "@/components/budget-allocations/BudgetAllocationLinkedPOView";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { useDelete } from "@/hooks/react-query/useDelete";
import { useGetById } from "@/hooks/react-query/useGetById";
import { usePermission } from "@/hooks/shared/usePermission";
import { BudgetAllocationsInterface } from "@/types/budget-allocations/budget-allocations.type";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EllipsisOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  App,
  Button,
  Dropdown,
  Flex,
  MenuProps,
  Spin,
  Tabs,
  TabsProps,
  Tag,
  Typography,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const updateStatus = async ({ id, status }: { id: string; status: string }) => {
  const res = await fetch(`/api/budget-allocations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update status");
  return json;
};

const BudgetAllocationDetailPage = () => {
  const hasPermission = usePermission("can_manage_budget_allocations");
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const {
    data,
    isLoading: detailIsLoading,
    error: detailError,
  } = useGetById("budget-allocations", params.id as string, !!params.id);
  if (detailError) {
    message.error(detailError.message);
    return null;
  }

  const mutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      message.success("Status updated successfully");
      router.push("/budget-allocations");
    },
    onError: (err: any) => {
      message.error(err.message);
    },
  });

  const deleteBudgetAllocation = useDelete("budget-allocations");

  if (
    detailIsLoading ||
    !data ||
    mutation.isPending ||
    deleteBudgetAllocation.isPending
  ) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin />
      </div>
    );
  }

  const detailData = data as BudgetAllocationsInterface;

  const dropDownItems: MenuProps["items"] = [
    {
      label: (
        <div
          className={`text-sm !w-32 ${
            detailData.status === "Pending"
              ? "text-[#0de246]"
              : "text-orange-500"
          }`}
        >
          {detailData.status === "Pending" ? "Approve" : "Pending"}
        </div>
      ),
      key: "approveAllocation",
      icon:
        detailData.status === "Pending" ? (
          <CheckCircleOutlined style={{ color: "#0de246" }} />
        ) : (
          <PauseCircleOutlined style={{ color: "orange" }} />
        ),
      onClick: () => {
        detailData.status === "Pending"
          ? mutation.mutateAsync({
              id: params.id as string,
              status: "Approved",
            })
          : mutation.mutateAsync({
              id: params.id as string,
              status: "Pending",
            });
      },
      disabled: mutation.isPending,
    },
    {
      label: (
        <div className="text-sm !w-32 text-[#ff4d4f]">Cancel Allocation</div>
      ),
      key: "cancelAllocation",
      icon: <StopOutlined style={{ color: "#ff4d4f" }} />,
      onClick: () => setConfirmModalOpen(true),
    },
  ];

  const tabItems: TabsProps["items"] = [
    {
      key: "details",
      label: "Details",
      children: <BudgetAllocationDetails data={detailData} />,
    },
    {
      key: "linked-po",
      label: "Linked PO",
      children: <BudgetAllocationLinkedPOView id={detailData.po_id} />,
    },
  ];

  const onConfirmPOHandler = async () => {
    try {
      await deleteBudgetAllocation.mutateAsync(params.id as string);
      router.push("/budget-allocations");
      message.success("Budget Allocation deleted successfully");
      setConfirmModalOpen(false);
    } catch (error: any) {
      console.log(error);
      message.error(error?.message || "Cancel failed");
    }
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div className="px-6">
        <Breadcrumbs
          items={[
            { title: "Home", href: "/" },
            { title: "Budget Allocations", href: "/budget-allocations" },
            {
              title: detailData.allocation_number || "Budget Allocation Detail",
            },
          ]}
        />
        <Flex justify="space-between" align="center" className="!mb-4">
          {/* Left Header */}
          <Flex align="center" gap={16}>
            <button
              className="flex justify-center items-center"
              onClick={() => router.back()}
            >
              <ArrowLeftOutlined style={{ fontSize: 16, cursor: "pointer" }} />
            </button>
            <div>
              <Typography.Title level={3} style={{ marginBottom: 1 }}>
                {detailData.allocation_number || "Budget Allocation Detail"}
              </Typography.Title>
              <Tag
                color={
                  detailData.status === "Approved"
                    ? "green"
                    : detailData.status === "Pending"
                    ? "orange"
                    : "red"
                }
              >
                {detailData.status}
              </Tag>
            </div>
          </Flex>

          {/* Right Header */}
          {hasPermission && (
            <Flex align="center" gap={8}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() =>
                  router.push(`/budget-allocations/${params.id}/edit`)
                }
              >
                Edit Budget Allocation
              </Button>
              <Dropdown
                menu={{ items: dropDownItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button icon={<EllipsisOutlined />} />
              </Dropdown>
            </Flex>
          )}
        </Flex>
      </div>
      <Tabs
        defaultActiveKey="1"
        items={tabItems}
        tabBarStyle={{
          padding: "0 28px",
        }}
        size="large"
      />
      <BudgetAllocationConfirmModal
        confirmModalOpen={confirmModalOpen}
        setConfirmModalOpen={setConfirmModalOpen}
        onProceedHandler={onConfirmPOHandler}
      />
    </section>
  );
};

export default BudgetAllocationDetailPage;
