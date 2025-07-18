"use client";

import { BudgetAllocationsInterface } from "@/types/budget-allocations/budget-allocations.type";
import { DollarCircleOutlined } from "@ant-design/icons";
import { Col, Flex, Row, Typography } from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import React from "react";

export type BudgetAllocationDetailsProps = Omit<
  BudgetAllocationsInterface,
  "po_id" | "budget_id" | "updated_at" | "transfer_evidence"
>;

const BudgetAllocationDetails = ({
  data,
}: {
  data: BudgetAllocationDetailsProps;
}) => {
  const usd = data.allocation_amount / data.exchange_rate_usd;

  const transferImages =
    typeof data.transfer_evidence_url === "string"
      ? data.transfer_evidence_url.split(",").filter(Boolean)
      : [];

  return (
    <section className="w-full rounded-2xl border-2 border-[#F5F5F5]">
      <Flex
        align="center"
        gap={16}
        style={{
          padding: "16px 24px",
          borderRadius: "16px 16px 0 0",
          background: "linear-gradient(90deg, #E6FFFB 0%, #FFF 100%)",
          borderBottom: "1px solid #87E8DE",
        }}
      >
        <DollarCircleOutlined
          style={{
            width: 32,
            height: 32,
            background: "#36CFC9",
            borderRadius: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: 20,
          }}
        />
        <div>
          <Typography.Title level={3} className="!mb-0">
            Budget Allocation Details
          </Typography.Title>
          <Typography.Text type="secondary">
            Details and information about this allocation
          </Typography.Text>
        </div>
      </Flex>
      <div className="px-6 py-7">
        <Row gutter={[32, 32]}>
          {/* LEFT */}
          <Col xs={24} md={12}>
            {/* Amount */}
            <div className="mb-5">
              <Typography.Text type="secondary">Amount</Typography.Text>
              <Typography.Title level={2} className="!my-1">
                {data.allocation_amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                {data.currency_code}
              </Typography.Title>
              <Typography.Text type="secondary">
                (${usd.toFixed(2)})
              </Typography.Text>
            </div>

            {/* Allocation Date */}
            <div className="mb-4">
              <Typography.Text type="secondary">
                Allocation Date
              </Typography.Text>
              <div className="font-medium text-md mt-1">
                {dayjs(data.allocation_date).format("MMM D, YYYY")}
              </div>
            </div>

            {/* Currency */}
            <div className="mb-4">
              <Typography.Text type="secondary">Currency</Typography.Text>
              <div className="font-medium text-md mt-1">
                {data.currency_code}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <Typography.Text type="secondary">Note</Typography.Text>
              <div className="text-gray-400 italic mt-1">
                No notes available
              </div>
            </div>

            {/* Transfer Evidence */}
            <div>
              <Typography.Text>Transfer Evidence</Typography.Text>
              <div className="flex flex-wrap gap-3 mt-2">
                {transferImages.length > 0 ? (
                  transferImages.map((url, index) => (
                    <Image
                      key={index}
                      src={url.trim()}
                      alt={`evidence-${index}`}
                      width={120}
                      height={120}
                      style={{ borderRadius: 12, objectFit: "cover" }}
                      unoptimized
                    />
                  ))
                ) : (
                  <div className="text-gray-400 italic mt-1">
                    No evidence uploaded
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* RIGHT */}
          <Col xs={24} md={12}>
            {/* Created On */}
            <div className="mb-4">
              <Typography.Text type="secondary">Created On</Typography.Text>
              <div className="font-medium text-md mt-1">
                {dayjs(data.created_at).format("MMM D, YYYY")}
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="mb-4">
              <Typography.Text type="secondary">Exchange Rate</Typography.Text>
              <div className="font-medium text-md mt-1">
                1 USD = {data.exchange_rate_usd} {data.currency_code}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default BudgetAllocationDetails;
