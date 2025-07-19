"use client";

import { useEffect, forwardRef, useImperativeHandle } from "react";
import { Space, Typography, Form, Row, Col, Tag, App } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

// Hooks
import { useList } from "@/hooks/react-query/useList";
import { useGetById } from "@/hooks/react-query/useGetById";

// Types
import { SupplierInterface } from "@/types/supplier/supplier.type";
import { PurchaseOrderRegionInterface } from "@/types/purchase-order/purchase-order-region.type";
import {
  ProductCurrencyInterface,
  ProductInterface,
  ProductResponse,
} from "@/types/product/product.type";
import { PersonInterface } from "@/types/person/person.type";

interface StepReviewSubmitProps {
  onNext: (values: any) => void;
  onBack: () => void;
  formData?: any;
}

export interface StepReviewSubmitRef {
  submitForm: () => void;
  getFormData: () => any;
}

const StepReviewSubmit = forwardRef<StepReviewSubmitRef, StepReviewSubmitProps>(
  ({ onNext, onBack, formData }, ref) => {
    const { message } = App.useApp();

    const [form] = Form.useForm();

    const { data: supplierData } = useGetById("suppliers", formData?.supplier);

    const { data: regionData } = useGetById(
      "purchase-orders/purchase-orders-regions",
      formData?.region
    );

    const { data: currencyData } = useGetById(
      "products/get-product-currencies",
      formData?.currency
    );

    const { data: productsData = [] } = useList("products", {
      page: 1,
      pageSize: "all" as any,
    });

    const { data: personsData = [] } = useList("persons");

    useEffect(() => {
      // Pre-populate form with existing data
      if (formData) {
        form.setFieldsValue(formData);
      }
    }, [formData, form]);

    useImperativeHandle(ref, () => ({
      submitForm: () => {
        form.submit();
      },
      getFormData: () => form.getFieldsValue(),
    }));

    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();

        const items = (formData.items || []).map((item: any) => ({
          product_id: item.product,
          quantity: item.quantity,
          unit_price_local: item.unit_price,
          is_foc: item.foc ? item.foc : false,
        }));

        const body = {
          ...formData,
          ...values,
          items,
        };

        const response = await fetch("/api/purchase-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error("Failed to create purchase order");
        }

        const data = await response.json();
        onNext(data);
      } catch (error: any) {
        message.error(error.message || "Failed to create purchase order");
      }
    };

    const getTotal = () => {
      const items = formData?.items || [];
      const exchangeRate = Number(formData?.exchange_rate) || 0;
      let totalLocal = 0;

      items.forEach((item: any) => {
        if (!item || !item.product || item.foc) return;

        const price = Number(item.unit_price) || 0;
        const quantity = Number(item.quantity) || 0;

        totalLocal += quantity * price;
      });

      const totalUSD =
        exchangeRate > 0 ? (totalLocal / exchangeRate).toFixed(2) : "0.00";

      return {
        totalLocal: totalLocal.toLocaleString(),
        totalUSD: totalUSD.toLocaleString(),
      };
    };

    return (
      <div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Space direction="vertical" size={"large"} style={{ width: "100%" }}>
            {/* Header */}
            <Row
              align="middle"
              justify="space-between"
              style={{ marginBottom: 8 }}
            >
              <Col style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: "#40A9FF",
                    borderRadius: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ShoppingCartOutlined
                    style={{ color: "white", fontSize: 20 }}
                  />
                </div>
                <Space
                  direction="vertical"
                  align="start"
                  style={{ marginLeft: 12 }}
                  size={0}
                >
                  <span style={{ fontSize: 22, fontWeight: 600 }}>
                    {formData?.po_number || "PO-XXXX-XXXX"}
                  </span>
                  <Tag>Pending Approval</Tag>
                </Space>
              </Col>
            </Row>

            {/* Top summary */}
            <Row gutter={32} style={{ marginBottom: 8 }}>
              <Col span={12}>
                <Space size="small" direction="vertical">
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Typography.Text type="secondary">
                        Supplier
                      </Typography.Text>
                    </Space>
                    <Space>
                      <Typography.Title level={5}>
                        {(supplierData as SupplierInterface)?.name || "-"}
                      </Typography.Title>
                    </Space>
                  </Space>
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Typography.Text type="secondary">
                        Order Date
                      </Typography.Text>
                    </Space>
                    <Space>
                      <Typography.Title level={5}>
                        {formData?.order_date
                          ? new Date(formData.order_date).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </Typography.Title>
                    </Space>
                  </Space>
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Typography.Text type="secondary">Budget</Typography.Text>
                    </Space>
                    <Space>
                      <Typography.Title level={5}>
                        {formData?.budget_name || "-"}
                      </Typography.Title>
                    </Space>
                  </Space>
                </Space>
              </Col>
              <Col span={12}>
                <Space size="small" direction="vertical">
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Typography.Text type="secondary">Region</Typography.Text>
                    </Space>
                    <Space>
                      <Typography.Title level={5}>
                        {(regionData as PurchaseOrderRegionInterface)?.name ||
                          "-"}
                      </Typography.Title>
                    </Space>
                  </Space>
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Typography.Text type="secondary">
                        Expected Delivery Date
                      </Typography.Text>
                    </Space>
                    <Space>
                      <Typography.Title level={5}>
                        {formData?.expected_delivery_date
                          ? new Date(
                              formData.expected_delivery_date
                            ).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </Typography.Title>
                    </Space>
                  </Space>
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Typography.Text type="secondary">
                        Currency
                      </Typography.Text>
                    </Space>
                    <Space style={{ display: "flex", alignItems: "center" }}>
                      <Typography.Title level={5} style={{ marginBottom: 0 }}>
                        {(currencyData as ProductCurrencyInterface)
                          ?.currency_code || "-"}
                      </Typography.Title>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        (1 USD = {formData?.exchange_rate?.toLocaleString()}{" "}
                        {
                          (currencyData as ProductCurrencyInterface)
                            ?.currency_code
                        }
                        )
                      </Typography.Text>
                    </Space>
                  </Space>
                </Space>
              </Col>
            </Row>

            {/* Items Table */}
            <div
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                overflow: "hidden",
                padding: 12,
              }}
            >
              <Typography.Text type="secondary">Items</Typography.Text>

              <Row
                gutter={16}
                style={{
                  margin: "0 6px 0 0",
                  fontWeight: 600,
                  padding: "12px 12px",
                  background: "#fafafa",
                  borderBottom: "1px solid #e0e0e0",
                  borderRadius: "8px 8px 0 0",
                  borderLeft: "1px solid #e0e0e0",
                  borderRight: "1px solid #e0e0e0",
                  borderTop: "1px solid #e0e0e0",
                }}
                align="middle"
              >
                <Col span={6}>PRODUCT</Col>
                <Col span={4}>QUANTITY</Col>
                <Col span={7}>UNIT PRICE</Col>
                <Col span={7} style={{ textAlign: "right" }}>
                  SUBTOTAL
                </Col>
              </Row>
              {formData?.items?.map((item: any, index: number) => (
                <Row
                  key={index}
                  gutter={16}
                  style={{
                    margin: "0 6px 0 0",
                    padding: "12px 8px",
                    borderLeft: "1px solid #e0e0e0",
                    borderRight: "1px solid #e0e0e0",
                    borderBottom: "1px solid #e0e0e0",
                    borderRadius:
                      index !== formData?.items?.length - 1
                        ? "0"
                        : "0 0 8px 8px",
                  }}
                >
                  <Col span={6}>
                    {(productsData as ProductResponse)?.items?.find(
                      (p: ProductInterface) => p.id === item.product
                    )?.name || "-"}
                  </Col>

                  <Col span={4}>{item.quantity}</Col>

                  <Col span={7}>
                    {item.unit_price?.toLocaleString()}{" "}
                    {(currencyData as ProductCurrencyInterface)?.currency_code}
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      (
                      {(
                        item.unit_price / formData?.exchange_rate
                      )?.toLocaleString()}
                      USD)
                    </Typography.Text>
                  </Col>

                  <Col span={7} style={{ textAlign: "right" }}>
                    {(item.quantity * item.unit_price)?.toLocaleString()}{" "}
                    {(currencyData as ProductCurrencyInterface)?.currency_code}
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      (
                      {(
                        (item.quantity * item.unit_price) /
                        formData?.exchange_rate
                      )?.toLocaleString()}{" "}
                      USD)
                    </Typography.Text>
                  </Col>
                </Row>
              ))}

              <Space
                direction="vertical"
                size={0}
                style={{
                  textAlign: "right",
                  marginTop: 12,
                  paddingRight: 10,
                  width: "100%",
                }}
              >
                <Typography.Text type="secondary">Total Amount</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {getTotal()?.totalLocal?.toLocaleString()}{" "}
                  {(currencyData as ProductCurrencyInterface)?.currency_code}
                </Typography.Title>
                <Typography.Text type="secondary">
                  ({getTotal()?.totalUSD?.toLocaleString()} USD)
                </Typography.Text>
              </Space>
            </div>

            {/* Bottom section: Contact, Sign, Authorized, Note */}
            <Row gutter={32} style={{ marginTop: 12 }}>
              <Col span={12} style={{ marginBottom: 12 }}>
                <Typography.Text type="secondary">
                  Contact Person
                </Typography.Text>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {(personsData as PersonInterface[])?.find(
                    (p: PersonInterface) => p.id === formData?.contact_person
                  )?.name || "-"}
                </div>
              </Col>
              <Col span={12} style={{ marginBottom: 12 }}>
                <Typography.Text type="secondary">Sign Person</Typography.Text>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {(personsData as PersonInterface[])?.find(
                    (p: PersonInterface) => p.id === formData?.sign_person
                  )?.name || "-"}
                </div>
              </Col>
              <Col span={12} style={{ marginBottom: 12 }}>
                <Typography.Text type="secondary">
                  Authorized Sign Person
                </Typography.Text>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {(personsData as PersonInterface[])?.find(
                    (p: PersonInterface) =>
                      p.id === formData?.authorized_sign_person
                  )?.name || "-"}
                </div>
              </Col>
              <Col span={12} style={{ marginBottom: 12 }}>
                <Typography.Text type="secondary">Note</Typography.Text>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {formData?.note ? (
                    formData.note
                  ) : (
                    <span style={{ color: "#aaa" }}>No notes available</span>
                  )}
                </div>
              </Col>
            </Row>
          </Space>
        </Form>
      </div>
    );
  }
);

export default StepReviewSubmit;
