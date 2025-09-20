"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { App, Button, Space, Spin, Typography } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

// Components
import PoEmailModal from "@/components/purchase-orders/PoEmailModal";
import StepContactPersons from "@/components/purchase-orders/steps/StepContactPersons";
import StepDateCurrency from "@/components/purchase-orders/steps/StepDateCurrency";
import StepItemEntry from "@/components/purchase-orders/steps/StepItemEntry";
import StepReviewSubmit from "@/components/purchase-orders/steps/StepReviewSubmit";
import StepSupplierRegion from "@/components/purchase-orders/steps/StepSupplierRegion";
import WarningModal from "@/components/purchase-orders/WarningModal";
import CreationSteps from "@/components/shared/multi-step-form/CreationSteps";

function CreatePurchaseOrderPageContent() {
  const { message } = App.useApp();

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const currentStepRef = useRef<any>(null);
  const [showEmailModal, setEmailModal] = useState(false);
  const [createdPoId, setCreatedPoId] = useState<any>(null);

  // Load draft if specified in URL
  useEffect(() => {
    const draftId = searchParams.get("draft");
    if (draftId) {
      loadDraft(draftId);
    }
  }, [searchParams]);

  // Track unsaved changes
  useEffect(() => {
    const hasData =
      Object.keys(formData).length > 0 &&
      (formData.supplier ||
        formData.region ||
        formData.items?.length > 0 ||
        formData.order_date ||
        formData.currency ||
        formData.contact_person);
    setHasUnsavedChanges(hasData);
  }, [formData]);

  // Handle browser back button and page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        setShowWarningModal(true);
        // Push the state back to prevent navigation
        window.history.pushState(null, "", window.location.href);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (hasUnsavedChanges) {
          handleSaveDraft();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasUnsavedChanges]);

  const handleNext = (values: any) => {
    if (currentStep < 4) {
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
    } else {
      setEmailModal(true);
    }
  };

  const handleBack = () => {
    // Save current form data if not on step 0 (StepSupplierRegion)
    if (currentStep > 0) {
      // Get current form data from the step component without validation
      if (currentStepRef.current?.getFormData) {
        const currentStepData = currentStepRef.current.getFormData();
        setFormData((prevData: any) => ({ ...prevData, ...currentStepData }));
      }
    }

    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowWarningModal(true);
    } else {
      message.info("Purchase order not created");
      router.push("/purchase-orders");
    }
  };

  const handleNextClick = () => {
    if (currentStepRef.current?.submitForm) {
      currentStepRef.current.submitForm();
    }
  };

  const handleDiscardProgress = () => {
    setShowWarningModal(false);
    setHasUnsavedChanges(false);
    setFormData({});
    setCurrentStep(0);
    message.info("Purchase order not created");
    router.push("/purchase-orders");
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      // Prepare draft data for the new drafts table
      const draftData = {
        po_number: formData.po_number,
        supplier_id: formData.supplier,
        region_id: formData.region,
        budget_id: formData.budget ? parseInt(formData.budget) : undefined,
        order_date: formData.order_date,
        currency_id: formData.currency,
        usd_exchange_rate: formData.exchange_rate
          ? parseFloat(formData.exchange_rate)
          : undefined,
        contact_person_id: formData.contact_person,
        sign_person_id: formData.sign_person,
        authorized_signer_id: formData.authorized_sign_person,
        expected_delivery_date: formData.expected_delivery_date,
        note: formData.note,
        form_data: formData, // Store complete form data as JSON
        current_step: currentStep,
      };

      const response = await fetch("/api/purchase-orders/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftData),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      message.success("Draft saved successfully");
      setShowWarningModal(false);
      setHasUnsavedChanges(false);
      router.push("/purchase-orders");
    } catch (error: any) {
      message.error(error.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const loadDraft = async (draftId: string) => {
    setIsLoadingDraft(true);
    try {
      const response = await fetch(`/api/purchase-orders/drafts/${draftId}`);
      if (!response.ok) {
        throw new Error("Failed to load draft");
      }

      const data = await response.json();
      const draft = data.data;

      // Restore form data and step
      setFormData(draft.form_data || {});
      setCurrentStep(draft.current_step || 0);
      setHasUnsavedChanges(false);

      message.success("Draft loaded successfully");
    } catch (error: any) {
      message.error(error.message || "Failed to load draft");
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const handleContinueEditing = () => {
    setShowWarningModal(false);
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
            ref={currentStepRef}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      case 4:
        return (
          <StepReviewSubmit
            ref={currentStepRef}
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
            setTestData={setCreatedPoId}
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

  if (isLoadingDraft) {
    return (
      <section className="max-w-7xl mx-auto">
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" />
          <Typography.Title level={4} style={{ marginTop: 16 }}>
            Loading draft...
          </Typography.Title>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto">
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
          <ArrowLeftOutlined style={{ fontSize: 16 }} onClick={handleCancel} />
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
      <CreationSteps
        currentStep={currentStep}
        steps={[
          { title: "Supplier & Region" },
          { title: "Date & Currency" },
          { title: "Item Entry" },
          { title: "Contact Persons" },
          { title: "Review & Submit" },
        ]}
      />

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
        <Space>
          <Button type="default" onClick={handleCancel}>
            Cancel
          </Button>
        </Space>
        <Space>
          <Button
            type="default"
            disabled={currentStep === 0}
            onClick={handleBack}
          >
            Previous
          </Button>
          <Button type="primary" onClick={handleNextClick}>
            {currentStep === 4 ? "Create" : "Next"}
          </Button>
        </Space>
      </Space>

      {/* Warning Modal */}
      <WarningModal
        open={showWarningModal}
        onCancel={handleContinueEditing}
        onDiscard={handleDiscardProgress}
        onSaveDraft={handleSaveDraft}
        loading={isSavingDraft}
      />

      {/* Email Modal */}
      <PoEmailModal
        showEmailModal={showEmailModal}
        poEmailData={createdPoId}
        setEmailModal={setEmailModal}
      />
    </section>
  );
}

export default function CreatePurchaseOrderPage() {
  return (
    <Suspense
      fallback={
        <section className="max-w-7xl mx-auto py-4 px-6">
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <Spin size="large" />
            <Typography.Title level={4} style={{ marginTop: 16 }}>
              Loading...
            </Typography.Title>
          </div>
        </section>
      }
    >
      <CreatePurchaseOrderPageContent />
    </Suspense>
  );
}
