"use client";

import { useCreate } from "@/hooks/react-query/useCreate";
import { BudgetFormInput } from "@/schemas/budgets/budgets.schema";
import { DollarOutlined } from "@ant-design/icons";
import { Col, Row, Tag, Typography, message } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import React, { forwardRef, useImperativeHandle } from "react";

interface StepReviewSubmitProps {
  onNext: (values: BudgetFormInput) => void;
  onBack: () => void;
  formData: BudgetFormInput;
}

export interface StepReviewSubmitRef {
  submitForm: () => void;
  isSubmitting?: boolean;
}

const StepReviewAndSubmit = forwardRef<
  StepReviewSubmitRef,
  StepReviewSubmitProps
>(({ onNext, onBack, formData }, ref) => {
  const createBudget = useCreate("budgets");

  const usdEquivalent = formData.planned_amount / formData.exchange_rate_usd;

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      try {
        await createBudget.mutateAsync(formData);
        message.success("Budget created successfully");
        onNext(formData);
      } catch (error) {
        message.error("Failed to create budget");
        console.error(error);
      }
    },
    isSubmitting: createBudget.isPending,
  }));

  return (
    <div>
      {/* Header */}
      <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Col>
          <Row align="middle" gutter={12}>
            <Col>
              <div
                style={{
                  background: "#e6f7ff",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DollarOutlined style={{ color: "#1890ff", fontSize: 20 }} />
              </div>
            </Col>
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                {formData.budget_name}
              </Title>
              <Typography.Text type="secondary">
                {formData.project_name}
              </Typography.Text>
            </Col>
            <Tag color="green">{formData.status}</Tag>
          </Row>
        </Col>
      </Row>

      {/* Budget Info */}
      <Row gutter={[32, 16]}>
        <Col xs={24} md={12}>
          <div>
            <Typography.Text type="secondary">Planned Budget</Typography.Text>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
              {formData.planned_amount.toLocaleString()}{" "}
              {formData.currency_code}
            </div>
            <Typography.Text type="secondary">Start Date</Typography.Text>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {dayjs(formData.start_date).format("MMM D, YYYY")}
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div>
            <Typography.Text type="secondary">
              Planned Budget (USD Equivalent)
            </Typography.Text>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
              $
              {usdEquivalent.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <Typography.Text type="secondary">End Date</Typography.Text>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {dayjs(formData.end_date).format("MMM D, YYYY")}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
});

StepReviewAndSubmit.displayName = "StepReviewAndSubmit";

export default StepReviewAndSubmit;
