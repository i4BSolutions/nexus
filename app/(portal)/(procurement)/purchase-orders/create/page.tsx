"use client";

import { useState, useRef } from "react";
import { Space, Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

// Components
import CreationSteps from "@/components/purchase-orders/CreationSteps";
import StepSupplierRegion from "@/components/purchase-orders/steps/StepSupplierRegion";
import StepItemEntry from "@/components/purchase-orders/steps/StepItemEntry";
import StepContactPersons from "@/components/purchase-orders/steps/StepContactPersons";
import StepDateCurrency from "@/components/purchase-orders/steps/StepDateCurrency";
import StepReviewSubmit from "@/components/purchase-orders/steps/StepReviewSubmit";

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const currentStepRef = useRef<any>(null);

  const handleNext = (values: any) => {
    console.log("Step values:", values);
    setFormData({ ...formData, ...values });
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    router.push("/purchase-orders");
  };

  const handleNextClick = () => {
    // Trigger the current step's form submission
    if (currentStepRef.current?.submitForm) {
      currentStepRef.current.submitForm();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepSupplierRegion
            ref={currentStepRef}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      case 1:
        return (
          <StepDateCurrency
            ref={currentStepRef}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      case 2:
        return (
          <StepItemEntry
            ref={currentStepRef}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      case 3:
        return (
          <StepContactPersons
            // ref={currentStepRef}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      case 4:
        return (
          <StepReviewSubmit
            // ref={currentStepRef}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      default:
        return (
          <StepSupplierRegion
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
      {/* Header */}
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
              Create New Purchase Order
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Fill in the details and add products to create a new purchase
              order
            </Typography.Paragraph>
          </Space>
        </Space>
      </Space>

      {/* Progress Steps */}
      <CreationSteps currentStep={currentStep} />

      {/* Step Content */}
      <div style={{ marginTop: "24px" }}>{renderCurrentStep()}</div>

      {/* Navigation Buttons */}
      <Space
        style={{
          display: "flex",
          marginTop: "24px",
          justifyContent: "space-between",
        }}
      >
        <Button type="default" onClick={handleCancel}>
          Cancel
        </Button>
        <Space>
          <Button
            type="default"
            disabled={currentStep === 0}
            onClick={handleBack}
          >
            Previous
          </Button>
          <Button
            type="primary"
            disabled={currentStep === 4}
            onClick={handleNextClick}
          >
            {currentStep === 4 ? "Submit" : "Next"}
          </Button>
        </Space>
      </Space>
    </section>
  );
}
