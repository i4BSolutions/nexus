"use client";

import InvoiceFirstStep from "@/components/purchase-invoices/steps/InvoiceFirstStep";
import InvoiceSecondStep from "@/components/purchase-invoices/steps/InvoiceSecondStep";
import InvoiceThirdStep from "@/components/purchase-invoices/steps/InvoiceThirdStep";
import CreationSteps from "@/components/shared/multi-step-form/CreationSteps";
import { useGetAll } from "@/hooks/react-query/useGetAll";
import { useGetById } from "@/hooks/react-query/useGetById";
import { useList } from "@/hooks/react-query/useList";
import {
  ProductCurrencyInterface,
  ProductResponse,
} from "@/types/product/product.type";
import { InvoiceFieldType } from "@/types/purchase-invoice/purchase-invoice.type";
import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";
import { PurchaseOrderResponse } from "@/types/purchase-order/purchase-order.type";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Flex,
  Form,
  FormProps,
  Space,
  Spin,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvoiceCreatePage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<
    number | null
  >(null);

  const { data: poDetailData, isLoading: poDetailLoading } =
    useGetById<PurchaseOrderDetailDto>(
      "purchase-orders",
      selectedPurchaseOrderId ? String(selectedPurchaseOrderId) : "",
      !!selectedPurchaseOrderId
    );

  const { data: currenciesData, isLoading: currenciesLoading } = useGetAll<
    ProductCurrencyInterface[]
  >("products/get-product-currencies", ["product-currencies"]);

  const { data: purchaseOrdersData, isLoading: purchaseOrdersLoading } =
    useGetAll<PurchaseOrderResponse>("purchase-orders", ["purchase-orders"]);

  const { data: productsData, isLoading: productsLoading } =
    useList<ProductResponse>("products", {
      pageSize: "all" as any,
      status: "true",
    });

  useEffect(() => {
    if (poDetailData) {
      form.setFieldsValue({
        invoice_items: poDetailData.product_items.map((item) => ({
          id: item.id,
          product: item.product,
          quantity: item.quantity,
          unit_price_local: item.unit_price_local,
        })),
      });
    }
  }, [poDetailData, form]);

  if (
    currenciesLoading ||
    purchaseOrdersLoading ||
    productsLoading ||
    poDetailLoading
  ) {
    return (
      <div className="h-[500px] w-full grid place-items-center">
        <Spin />
      </div>
    );
  }

  if (!currenciesData || !purchaseOrdersData || !productsData) {
    return (
      <div className="h-[500px] w-full grid place-items-center">
        <Typography.Text type="danger">Failed to load data.</Typography.Text>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <InvoiceFirstStep />;
      case 1:
        return (
          <InvoiceSecondStep
            form={form}
            poDetailData={poDetailData!}
            purchaseOrdersData={purchaseOrdersData}
            currenciesData={currenciesData}
            productsData={productsData}
          />
        );
      case 2:
        return (
          <InvoiceThirdStep
            form={form}
            poDetailData={poDetailData!}
            purchaseOrdersData={purchaseOrdersData}
            currenciesData={currenciesData}
            productsData={productsData}
          />
        );
      default:
        return <InvoiceFirstStep />;
    }
  };

  const handleNextStep = async () => {
    try {
      //   await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch {
      message.error("Please fill in the required fields.");
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    //   if (hasUnsavedChanges) {
    //     setShowWarningModal(true);
    //   } else {
    //     message.info("Purchase order not created");
    //     router.push("/purchase-orders");
    //   }
    router.push("/invoices");
  };

  const onFinish: FormProps<InvoiceFieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
  };

  return (
    <section className="py-4 w-full grid place-items-center">
      <section className="max-w-[1140px] w-full">
        <Flex align="center" gap={20}>
          <button
            className="flex justify-center items-center"
            onClick={() => router.back()}
          >
            <ArrowLeftOutlined style={{ fontSize: 16, cursor: "pointer" }} />
          </button>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 1 }}>
              Create New Invoice
            </Typography.Title>
            <Typography.Text type="secondary">
              Fill in the details and add products to create a new invoice.
            </Typography.Text>
          </div>
        </Flex>

        {/* Progress Steps */}
        <CreationSteps
          currentStep={currentStep}
          steps={[
            { title: "Invoice Number & Date" },
            { title: "PO & Items" },
            { title: "Review & Submit" },
          ]}
        />

        {/* Step Content */}
        <div style={{ marginTop: "24px" }}>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={(changed, allValues) => {
              console.log("✅ Changed:", changed);
              console.log("✅ All Values:", allValues);
              if (changed.purchase_order) {
                setSelectedPurchaseOrderId(changed.purchase_order);
              }
            }}
            onFinish={onFinish}
            initialValues={{
              invoiceNumber: "INV-2025-1239-01",
            }}
          >
            {renderCurrentStep()}
          </Form>
        </div>

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
              onClick={handlePrevStep}
            >
              Previous
            </Button>
            {currentStep === 2 ? (
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            ) : (
              <Button type="primary" onClick={handleNextStep}>
                Next
              </Button>
            )}
          </Space>
        </Space>
      </section>
    </section>
  );
}
