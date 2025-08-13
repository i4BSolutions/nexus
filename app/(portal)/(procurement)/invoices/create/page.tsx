"use client";

import PiWarningModal from "@/components/purchase-invoices/PiWarningModal";
import InvoiceFirstStep from "@/components/purchase-invoices/steps/InvoiceFirstStep";
import InvoiceSecondStep from "@/components/purchase-invoices/steps/InvoiceSecondStep";
import InvoiceThirdStep from "@/components/purchase-invoices/steps/InvoiceThirdStep";
import CreationSteps from "@/components/shared/multi-step-form/CreationSteps";
import { useCreate } from "@/hooks/react-query/useCreate";
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
import { App, Button, Flex, Form, Space, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvoiceCreatePage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<
    number | null
  >(null);

  const { data: invoiceNumber, isLoading: invoiceNumberLoading } =
    useGetAll<string>("purchase-invoices/get-purchase-invoice-no", [
      "purchase-invoice-number",
    ]);

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

  const filteredPurchaseOrders = purchaseOrdersData?.dto.filter(
    (po) => po.purchase_order_smart_status !== "Cancel"
  );

  const { data: productsData, isLoading: productsLoading } =
    useList<ProductResponse>("products", {
      pageSize: "all" as any,
      status: "true",
    });

  const { mutate: createInvoice } = useCreate("purchase-invoices", [
    "purchase-invoices",
  ]);

  const onFinish = () => {
    const allValues: InvoiceFieldType = form.getFieldsValue(true);
    const selectedItems = allValues.invoice_items.filter(
      (item) => item.checked
    );
    try {
      createInvoice(
        {
          purchase_invoice_number: allValues.invoice_number,
          purchase_order_id: allValues.purchase_order,
          invoice_date: allValues.invoice_date,
          due_date: allValues.due_date,
          currency_id: allValues.currency,
          usd_exchange_rate: allValues.usd_exchange_rate,
          note: allValues.note,
          status: "Pending",
          invoice_items: selectedItems.map((item) => ({
            product_id: item.product,
            quantity: item.invoice_quantity,
            unit_price_local: item.invoice_unit_price_local,
          })),
        },
        {
          onSuccess: () => {
            message.success("Purchase invoice created successfully");
            router.push("/invoices");
          },
        }
      );
    } catch (error) {
      message.error("Cannot create invoice for a cancelled purchase order");
      message.error("Failed to create purchase invoice. Please try again.");
    } finally {
    }
  };

  useEffect(() => {
    if (poDetailData) {
      form.setFieldsValue({
        invoice_items: poDetailData.product_items.map((item) => ({
          id: item.id,
          product: item.product,
          invoice_quantity: item.available,
          invoice_unit_price_local: item.unit_price_local,
          checked: false,
        })),
        purchase_order: poDetailData.id,
        currency: poDetailData.currency.id,
        usd_exchange_rate: poDetailData.usd_exchange_rate,
      });
    }
  }, [poDetailData, selectedPurchaseOrderId]);

  useEffect(() => {
    if (invoiceNumber) {
      form.setFieldValue("invoice_number", invoiceNumber);
    }
  }, [invoiceNumber]);

  if (
    currenciesLoading ||
    purchaseOrdersLoading ||
    productsLoading ||
    invoiceNumberLoading
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
            poDetailLoading={poDetailLoading}
            purchaseOrdersData={filteredPurchaseOrders || []}
            currenciesData={currenciesData}
            productsData={productsData}
          />
        );
      case 2:
        return (
          <InvoiceThirdStep
            form={form}
            poDetailData={poDetailData!}
            purchaseOrdersData={filteredPurchaseOrders || []}
            currenciesData={currenciesData}
            productsData={productsData}
          />
        );
      default:
        return null;
    }
  };

  const handleNextStep = async () => {
    try {
      if (currentStep === 1) {
        const checkedItems = form
          .getFieldValue("invoice_items")
          ?.filter((item: any) => item?.checked);
        if (!checkedItems || checkedItems.length === 0) {
          message.error("Please select at least one item");
          return;
        }
      }
      await form.validateFields();
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      }
    } catch {
      message.error("Please check field level validations!");
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    setShowWarningModal(true);
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
          <Form<InvoiceFieldType>
            name="invoice-form"
            form={form}
            layout="vertical"
            preserve={true}
            onValuesChange={(changed, allValues) => {
              if (changed.purchase_order) {
                setSelectedPurchaseOrderId(changed.purchase_order);
              }
            }}
          >
            {renderCurrentStep()}
          </Form>

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
                <Button type="primary" onClick={onFinish}>
                  Create
                </Button>
              ) : (
                <Button type="primary" onClick={handleNextStep}>
                  Next
                </Button>
              )}
            </Space>
          </Space>
        </div>
        <PiWarningModal
          open={showWarningModal}
          onCancel={() => setShowWarningModal(false)}
          onDiscard={() => {
            setShowWarningModal(false);
            router.push("/invoices");
          }}
        />
      </section>
    </section>
  );
}
