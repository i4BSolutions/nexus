"use client";

import { BudgetFormInput } from "@/schemas/budgets/budgets.schema";
import { Col, DatePicker, Form, Input, Row, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

const { RangePicker } = DatePicker;

interface StepBudgetDetailsProps {
  onNext: (values: BudgetFormInput) => void;
  onBack: () => void;
  formData?: BudgetFormInput & { period?: any };
}

export interface StepBudgetDetailsRef {
  submitForm: () => void;
}

const StepBudgetDetails = forwardRef<
  StepBudgetDetailsRef,
  StepBudgetDetailsProps
>(({ onNext, onBack, formData }, ref) => {
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (formData) {
      const initialValues = { ...formData };
      if (formData.start_date && formData.end_date) {
        initialValues.period = [
          dayjs(formData.start_date),
          dayjs(formData.end_date),
        ];
        setStartDate(dayjs(formData.start_date));
      }
      form.setFieldsValue(initialValues);
    }
  }, [formData, form]);

  const handleNext = () => {
    form.validateFields().then((values) => {
      const [start, end] = values.period;
      const transformed = {
        ...values,
        start_date: start.format("YYYY-MM-DD"),
        end_date: end.format("YYYY-MM-DD"),
      };
      delete transformed.period;
      onNext(transformed);
    });
  };

  useImperativeHandle(ref, () => ({
    submitForm: handleNext,
  }));

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0]) {
      setStartDate(dates[0]);
    } else {
      setStartDate(null);
    }
  };

  const disableDate = (current: Dayjs) => {
    const today = dayjs().subtract(1, "day");
    if (current.isBefore(today)) return true;
    if (startDate && current.isBefore(startDate, "day")) return true;
    return false;
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleNext}
        style={{ maxWidth: "100%" }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Budget Name"
              name="budget_name"
              rules={[{ required: true, message: "Budget Name is required" }]}
            >
              <Input required placeholder="Enter budget name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Project Name"
              name="project_name"
              rules={[{ required: true, message: "Project Name is required" }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Period"
          name="period"
          rules={[{ required: true, message: "Project period is required" }]}
        >
          <RangePicker
            disabledDate={disableDate}
            onCalendarChange={handleRangeChange}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label={
            <>
              Description <span style={{ color: "#999" }}>(optional)</span>
            </>
          }
          name="description"
        >
          <Input.TextArea rows={4} placeholder="Enter project description" />
        </Form.Item>
      </Form>
    </div>
  );
});

StepBudgetDetails.displayName = "StepBudgetDetails";

export default StepBudgetDetails;
