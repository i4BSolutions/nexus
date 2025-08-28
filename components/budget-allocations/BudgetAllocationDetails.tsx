"use client";

import { BudgetAllocationsInterface } from "@/types/budget-allocations/budget-allocations.type";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";
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

  const transferImages: string[] = Array.isArray(data.transfer_evidence_urls)
    ? data.transfer_evidence_urls
        .map((evidence) => evidence.url)
        .filter((url): url is string => !!url)
    : [];

  return (
    <section className="w-full rounded-2xl border-2 border-[#F5F5F5]">
      {/* Header */}
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

      {/* Body */}
      <div className="px-6 py-7">
        {/* AMOUNT - full width */}
        <div className="mb-6">
          <Typography.Text type="secondary" className="block">
            Amount
          </Typography.Text>
          <div className="flex flex-col">
            <Typography.Text
              strong
              className="!mb-0 !text-[28px] !font-semibold"
            >
              {formatWithThousandSeparator(data.allocation_amount)}{" "}
              {data.currency_code}
            </Typography.Text>
            <Typography.Text type="secondary" className="!text-base">
              (${formatWithThousandSeparator(usd)})
            </Typography.Text>
          </div>
        </div>

        <Row gutter={[48, 24]}>
          <Col xs={24} md={12}>
            <div className="mb-4">
              <Typography.Text type="secondary">
                Allocation Date
              </Typography.Text>
              <div className="text-base font-semibold mt-1">
                {dayjs(data.allocation_date).format("MMM D, YYYY")}
              </div>
            </div>
            <div className="mb-4">
              <Typography.Text type="secondary">Currency</Typography.Text>
              <div className="text-base font-semibold mt-1">
                {data.currency_code}
              </div>
            </div>
            <div className="mb-4">
              <Typography.Text type="secondary">Note</Typography.Text>
              <div className="mt-1 text-base text-gray-400">
                {data.note ? data.note : "N/A"}
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className="mb-4">
              <Typography.Text type="secondary">Created On</Typography.Text>
              <div className="text-base font-semibold mt-1">
                {dayjs(data.created_at).format("MMM D YYYY")}
              </div>
            </div>
            <div className="mb-4">
              <Typography.Text type="secondary">Exchange Rate</Typography.Text>
              <div className="text-base font-semibold mt-1">
                1 USD = {data.exchange_rate_usd} {data.currency_code}
              </div>
            </div>
          </Col>
        </Row>

        {/* TRANSFER EVIDENCE */}
        <div>
          <Typography.Text type="secondary">Transfer Evidence</Typography.Text>
          <div className="flex flex-wrap gap-3 mt-2">
            {transferImages.length > 0 ? (
              transferImages.map((url, index) => (
                <Image
                  key={index}
                  src={url.trim()}
                  alt={`evidence-${index}`}
                  width={120}
                  height={120}
                  className="rounded-xl object-cover"
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
      </div>
    </section>
  );
};

export default BudgetAllocationDetails;
