import { useGetById } from "@/hooks/react-query/useGetById";
import {
  CalendarOutlined,
  CheckCircleTwoTone,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { App, Flex, Spin, Tag, Typography } from "antd";
import dayjs from "dayjs";
import React from "react";

const BudgetAllocationLinkedPOView = ({ id }: { id: number }) => {
  const { message } = App.useApp();
  const {
    data,
    isLoading: linkedPOIsLoading,
    error: linkedPOError,
  } = useGetById("purchase-orders", id as any, !!id);

  if (linkedPOError) {
    message.error(linkedPOError.message);
    return null;
  }

  if (linkedPOIsLoading || !data) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin />
      </div>
    );
  }

  const linkedPOData = data as any;
  return (
    <section className="w-full rounded-2xl border-2 border-[#F5F5F5]">
      <Flex
        align="center"
        gap={16}
        style={{
          padding: "16px 24px",
          borderRadius: "16px 16px 0 0",
          background: "linear-gradient(90deg, #E6F4FF 0%, #FFFFFF 100%)",
          borderBottom: "1px solid #91D5FF",
        }}
      >
        <ShoppingCartOutlined
          style={{
            width: 32,
            height: 32,
            background: "#69B1FF",
            borderRadius: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: 20,
          }}
        />
        <div>
          <Typography.Title level={4} className="!mb-0">
            Related Purchase Order
          </Typography.Title>
          <Typography.Text type="secondary">
            Purchase Order linked to this allocation
          </Typography.Text>
        </div>
      </Flex>

      <div className="px-6 py-5">
        <div className="grid grid-cols-6 font-semibold text-xs text-gray-500 pb-2">
          <span>PURCHASE ORDER</span>
          <span>SUPPLIER</span>
          <span>ORDER DATE</span>
          <span>EXPECTED DELIVERY DATE</span>
          <span>AMOUNT</span>
          <span>STATUS</span>
        </div>
        <div className="grid grid-cols-6 items-center text-sm py-3 px-4 rounded-xl border border-[#F0F0F0] bg-white shadow-sm">
          {/* Purchase Order Number */}
          <div className="flex items-center gap-2 text-blue-500 font-medium">
            PO-{linkedPOData?.purchase_order_no}
            <CheckCircleTwoTone twoToneColor="#52c41a" />
          </div>

          {/* Supplier */}
          <span>Supplier</span>

          {/* Order Date */}
          <Flex align="center" gap={6}>
            <CalendarOutlined />
            {dayjs(linkedPOData?.order_date).format("MMM D, YYYY")}
          </Flex>

          {/* Expected Delivery */}
          <Flex align="center" gap={6}>
            <CalendarOutlined />
            {dayjs(linkedPOData?.expected_delivery_date).format("MMM D, YYYY")}
          </Flex>

          {/* Amount */}
          <div>
            {linkedPOData?.amount_local.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}{" "}
            {linkedPOData?.currency_code}
            <br />
            <Typography.Text type="secondary">
              (
              {linkedPOData?.amount_usd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{" "}
              USD)
            </Typography.Text>
          </div>

          {/* Status */}
          <Tag color="blue" style={{ borderRadius: 6 }}>
            {linkedPOData?.status}
          </Tag>
        </div>
      </div>
    </section>
  );
};

export default BudgetAllocationLinkedPOView;
