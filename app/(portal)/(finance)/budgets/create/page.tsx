"use client";

import CreationSteps from "@/components/budgets/CreationSteps";
import StepBudgetDetails from "@/components/budgets/steps/StepBudgetDetails";
import StepFinancialParameters from "@/components/budgets/steps/StepFinancialParameters";
import StepReviewAndSubmit from "@/components/budgets/steps/StepReviewAndSubmit";
import { BudgetFormInput } from "@/schemas/budgets/budgets.schema";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, message, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

const CreateBudgetPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const currentStepRef = useRef<any>(null);

  const handleNext = (values: BudgetFormInput) => {
    console.log("Step values:", values);
    setFormData({ ...formData, ...values, status: "Active" });
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleCancel = () => {
    message.info("Budget creation cancelled");
    router.push("/budgets");
  };

  const handleNextClick = () => {
    // Trigger the current step's form submission
    if (currentStepRef.current?.submitForm) {
      currentStepRef.current.submitForm();
    }
  };
  const isSubmitting = currentStepRef.current?.isSubmitting ?? false;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepBudgetDetails
            ref={currentStepRef}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      case 1:
        return (
          <StepFinancialParameters
            ref={currentStepRef}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      case 2:
        return (
          <StepReviewAndSubmit
            ref={currentStepRef}
            onNext={() => router.push("/budgets")}
            onBack={handleBack}
            formData={formData}
          />
        );
      default:
        return (
          <StepBudgetDetails
            ref={currentStepRef}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
    }
  };

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

      <CreationSteps currentStep={currentStep} />
      {renderCurrentStep()}

      <Space
        style={{
          display: "flex",
          marginTop: "24px",
          justifyContent: "space-between",
        }}
      >
        <Button type="default" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Space>
          <Button
            type="default"
            disabled={currentStep === 0 || isSubmitting}
            onClick={handleBack}
          >
            Previous
          </Button>
          <Button
            type="primary"
            // disabled={currentStep === 2}
            disabled={isSubmitting}
            loading={isSubmitting}
            onClick={handleNextClick}
          >
            {currentStep === 2 ? "Create" : "Next"}
          </Button>
        </Space>
      </Space>
    </section>
  );
};

export default CreateBudgetPage;
