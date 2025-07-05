import { BudgetFormInput } from "@/schemas/budgets/budgets.schema";
import { DollarOutlined } from "@ant-design/icons";
import { Col, Form, Row, Tag, Typography } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import React, { forwardRef, useImperativeHandle } from "react";

interface StepReviewSubmitProps {
  onNext: (values: BudgetFormInput) => void;
  onBack: () => void;
  formData?: BudgetFormInput & { period?: any };
}

export interface StepBudgetDetailsRef {
  submitForm: () => void;
}

const StepReviewAndSubmit = forwardRef<
  StepBudgetDetailsRef,
  StepReviewSubmitProps
>(({ onNext, onBack, formData }, ref) => {
  console.log("Form Data:", formData);
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      form.submit();
    },
  }));

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onNext(values);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        <Row
          align="middle"
          justify="space-between"
          style={{ marginBottom: 24 }}
        >
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
                  {formData?.budget_name}
                </Title>
                <Typography.Text type="secondary">
                  {formData?.project_name}
                </Typography.Text>
              </Col>
              <Tag color="green">Active</Tag>
            </Row>
          </Col>
        </Row>

        {/* <Divider style={{ margin: "16px 0" }} /> */}

        {/* Budget Info */}
        <Row gutter={[32, 16]}>
          <Col xs={24} md={12}>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                Planned Budget
              </Typography.Text>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
                {formData?.planned_amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {formData?.currency_code}
              </div>

              <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                Start Date
              </Typography.Text>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {formData?.start_date
                  ? dayjs(formData.start_date).format("MMM D, YYYY")
                  : "-"}
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                Planned Budget (USD Equivalent)
              </Typography.Text>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
                ${" "}
                {formData?.planned_amount_usd.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                End Date
              </Typography.Text>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {formData?.end_date
                  ? dayjs(formData.end_date).format("MMM D, YYYY")
                  : "-"}
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
});

StepReviewAndSubmit.displayName = "StepReviewAndSubmit";

export default StepReviewAndSubmit;
