"use client";

import PersonCreateModal from "@/components/purchase-orders/PersonCreateModal";
import { useCreate } from "@/hooks/react-query/useCreate";
import { useGetAll } from "@/hooks/react-query/useGetAll";
import { useList } from "@/hooks/react-query/useList";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { BudgetResponse } from "@/types/budgets/budgets.type";
import { PersonInterface } from "@/types/person/person.type";
import {
  ProductCurrencyInterface,
  ProductInterface,
  ProductResponse,
} from "@/types/product/product.type";
import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";
import { PurchaseOrderRegionInterface } from "@/types/purchase-order/purchase-order-region.type";
import { SuppliersResponse } from "@/types/supplier/supplier.type";
import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  FormProps,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

function useForceUpdate() {
  const [, setTick] = useState(0);
  return () => setTick((tick) => tick + 1);
}

export default function PoEditPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [reason, setReason] = useState("");

  const forceUpdate = useForceUpdate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetField, setTargetField] = useState<
    | "contact_person"
    | "sign_person"
    | "authorized_sign_person"
    | "supplier"
    | "region"
    | null
  >(null);

  const { data: poDetailData, isLoading: poDetailLoading } =
    useGetAll<PurchaseOrderDetailDto>(`purchase-orders/${params.id}`, [
      "purchase-order",
      params.id as string,
    ]);
  const [totalAmount, setTotalAmount] = useState({
    totalLocal: poDetailData?.total_amount_local,
    totalUSD: poDetailData?.total_amount_usd,
  });
  const { data: suppliersData, isLoading: suppliersLoading } =
    useGetAll<SuppliersResponse>("suppliers", ["suppliers"]);

  const { data: regionsData, isLoading: regionsLoading } = useGetAll<
    PurchaseOrderRegionInterface[]
  >("purchase-orders/purchase-orders-regions", ["regions"]);

  const { data: budgetsData, isLoading: budgetsLoading } =
    useGetAll<BudgetResponse>("budgets", ["budgets"]);

  const { data: currenciesData, isLoading: currenciesLoading } = useGetAll<
    ProductCurrencyInterface[]
  >("products/get-product-currencies", ["product-currencies"]);

  const { data: productsData, isLoading: productsLoading } =
    useList<ProductResponse>("products", {
      pageSize: "all" as any,
      status: "true",
    });

  const { data: personData, isLoading: personLoading } =
    useGetAll<PersonInterface>("persons", ["persons"]);

  const { mutate: createPerson } = useCreate("persons");
  const { mutate: createSupplier } = useCreate("suppliers");
  const { mutate: createRegion } = useCreate(
    "purchase-orders/purchase-orders-regions"
  );
  const updatePurchaseOrder = useUpdate("purchase-orders");

  if (
    poDetailLoading ||
    suppliersLoading ||
    regionsLoading ||
    budgetsLoading ||
    currenciesLoading ||
    productsLoading ||
    personLoading
  ) {
    return (
      <div className="h-screen w-full grid place-items-center">
        <Spin />
      </div>
    );
  }

  type FieldType = {
    purchase_order_no: string;
    supplier: number;
    region: number;
    budget: number;
    order_date: string;
    currency: number;
    expected_delivery_date: string;
    usd_exchange_rate: string;
    purchase_order_items: {
      id: number;
      product: number;
      quantity: number;
      unit_price_local: number;
    }[];
    contact_person: number;
    sign_person: number;
    authorized_sign_person: number;
    note: string;
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    console.log("Success:", values);
    // try {
    //   await updatePurchaseOrder.mutateAsync({
    //     id: params.id as string,
    //     data: {
    //       supplier_id: values.supplier,
    //       region_id: values.region,
    //       budget_id: values.budget,
    //       order_date: dayjs(values.order_date).format("YYYY-MM-DD"),
    //       currency_id: values.currency,
    //       usd_exchange_rate: values.usd_exchange_rate,
    //       contact_person_id: values.contact_person,
    //       sign_person_id: values.sign_person,
    //       authorized_signer_id: values.authorized_sign_person,
    //       note: values.note,
    //       expected_delivery_date: dayjs(values.expected_delivery_date).format(
    //         "YYYY-MM-DD"
    //       ),
    //     },
    //   });
    //   message.success("Purchase Order updated successfully!");
    // } catch (err: any) {
    //   message.error(err?.message || "Update failed");
    // }
    // message.success("Purchase Order updated successfully!");
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    message.error({
      content: errorInfo.errorFields[0].errors[0],
      duration: 2,
      style: {
        marginTop: "16vh",
      },
    });
  };

  const handlePersonCreate = (values: { name: string }) => {
    createPerson(values, {
      onSuccess: (data: unknown) => {
        const createdPerson = data as PersonInterface;
        if (targetField && createdPerson?.id) {
          form.setFieldValue(targetField, createdPerson.id);
        }
        setIsModalOpen(false);
        setTargetField(null);
      },
    });
  };

  const onReasonModalOk = async () => {
    const values = form.getFieldsValue();
    try {
      await updatePurchaseOrder.mutateAsync({
        id: params.id as string,
        data: {
          supplier_id: values.supplier,
          region_id: values.region,
          budget_id: values.budget,
          order_date: dayjs(values.order_date).format("YYYY-MM-DD"),
          currency_id: values.currency,
          usd_exchange_rate: values.usd_exchange_rate,
          contact_person_id: values.contact_person,
          sign_person_id: values.sign_person,
          authorized_signer_id: values.authorized_sign_person,
          note: values.note,
          expected_delivery_date: dayjs(values.expected_delivery_date).format(
            "YYYY-MM-DD"
          ),
          reason: reason,
          items: values.purchase_order_items.map((item: any) => ({
            id: item.id,
            product_id: item.product,
            quantity: item.quantity,
            unit_price_local: item.unit_price_local,
          })),
        },
      });
      message.success("Purchase Order updated successfully!");
    } catch (err: any) {
      message.error(err?.message || "Update failed");
    }
    setIsReasonModalOpen(false);
  };

  const onReasonModalCancel = () => {
    setIsReasonModalOpen(false);
    setReason("");
  };

  // Helper to get currency code by id
  const getCurrencyCode = (currencyId: number | string) => {
    return (
      currenciesData?.find((c: ProductCurrencyInterface) => c.id === currencyId)
        ?.currency_code || ""
    );
  };

  return (
    <section className="px-4">
      {/* Header Section */}
      <Flex align="center" gap={16}>
        <button
          className="flex justify-center items-center"
          onClick={() => router.back()}
        >
          <ArrowLeftOutlined style={{ fontSize: 16, cursor: "pointer" }} />
        </button>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 1 }}>
            Edit Purchase Order
          </Typography.Title>
          <Typography.Text type="secondary">
            Update details for purchase
          </Typography.Text>
        </div>
      </Flex>

      <div className="py-12">
        <Form
          name="po-update-form"
          form={form}
          style={{ width: "100%" }}
          initialValues={{
            purchase_order_no: poDetailData?.purchase_order_no,
            supplier: poDetailData?.supplier.id,
            region: poDetailData?.region.id,
            order_date: dayjs(poDetailData?.order_date).valueOf(),
            expected_delivery_date: dayjs(
              poDetailData?.expected_delivery_date
            ).valueOf(),
            budget: poDetailData?.budget.id,
            currency: poDetailData?.currency.id,
            usd_exchange_rate: poDetailData?.usd_exchange_rate,
            purchase_order_items:
              poDetailData?.product_items?.map((item) => ({
                id: item.id,
                product: item.product,
                quantity: item.quantity,
                unit_price_local: item.unit_price_local,
                unit_price_usd: item.unit_price_usd,
                sub_total_local: item.sub_total_local,
                sub_total_usd: item.sub_total_usd,
              })) || [],
            contact_person: poDetailData?.contact_person?.id,
            sign_person: poDetailData?.sign_person
              ? poDetailData.sign_person.id
              : null,
            authorized_sign_person: poDetailData?.authorized_sign_person
              ? poDetailData.authorized_sign_person.id
              : null,
            note: poDetailData?.note || "",
          }}
          onFinish={onFinish}
          labelCol={{ span: 24 }}
          onFinishFailed={onFinishFailed}
          onValuesChange={(changed, all) => {
            const items = all.purchase_order_items || [];
            const exchangeRate = Number(all.usd_exchange_rate || 1);
            let totalLocal = 0;
            items.forEach((item) => {
              totalLocal +=
                (item?.quantity || 0) * (item?.unit_price_local || 0);
            });
            const totalUSD = exchangeRate ? totalLocal / exchangeRate : 0;

            setTotalAmount({
              totalLocal: totalLocal,
              totalUSD: totalUSD,
            });
            if (
              changed.usd_exchange_rate ||
              changed.currency ||
              changed.purchase_order_items
            ) {
              forceUpdate();
            }
          }}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item<FieldType>
            name="purchase_order_no"
            label="PO Number"
            style={{ width: "100%" }}
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input style={{ width: "100%" }} disabled />
          </Form.Item>

          <div className="flex gap-6 justify-between items-center">
            <Form.Item<FieldType>
              name="supplier"
              style={{ width: "100%" }}
              label={
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography.Text style={{ fontSize: 16 }}>
                    Supplier
                  </Typography.Text>

                  <Typography.Link
                    onClick={() => {
                      setIsModalOpen(true);
                      setTargetField("supplier");
                    }}
                    style={{ fontSize: 14, fontWeight: 500 }}
                  >
                    Create New
                  </Typography.Link>
                </div>
              }
              rules={[{ required: true, message: "Supplier is required!" }]}
            >
              <Select
                size="large"
                placeholder={
                  suppliersLoading ? "Loading suppliers..." : "Select supplier"
                }
                loading={suppliersLoading}
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label;
                  if (typeof label === "string") {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                options={[
                  ...(suppliersData?.items?.map((s) => ({
                    value: s.id,
                    label: s.name,
                  })) || []),
                  {
                    label: (
                      <div onClick={() => setIsModalOpen(true)}>
                        <PlusCircleOutlined style={{ marginRight: 8 }} />
                        Create New Supplier
                      </div>
                    ),
                  },
                ]}
              />
            </Form.Item>

            <Form.Item<FieldType>
              name="region"
              label={
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography.Text style={{ fontSize: 16 }}>
                    Region
                  </Typography.Text>

                  <Typography.Link
                    onClick={() => {
                      setIsModalOpen(true);
                      setTargetField("supplier");
                    }}
                    style={{ fontSize: 14, fontWeight: 500 }}
                  >
                    Create New
                  </Typography.Link>
                </div>
              }
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Region is required!" }]}
            >
              <Select
                size="large"
                placeholder={
                  regionsLoading ? "Loading regions..." : "Select region"
                }
                loading={regionsLoading}
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label;
                  if (typeof label === "string") {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                options={[
                  ...(regionsData?.map((region) => ({
                    value: region.id,
                    label: region.name,
                  })) || []),
                  {
                    label: (
                      <div onClick={() => setIsModalOpen(true)}>
                        <PlusCircleOutlined style={{ marginRight: 8 }} />
                        Create New Region
                      </div>
                    ),
                  },
                ]}
              />
            </Form.Item>
          </div>

          <div className="flex gap-6 justify-between items-center">
            <Form.Item<FieldType>
              name="order_date"
              label="Order Date"
              style={{ width: "100%" }}
              getValueProps={(value) => ({
                value: value && dayjs(Number(value)),
              })}
              normalize={(value) => value && `${dayjs(value).valueOf()}`}
              rules={[{ required: true, message: "Order date is required!" }]}
            >
              <DatePicker
                size="large"
                format={"MMM DD YYYY"}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item<FieldType>
              name="expected_delivery_date"
              label="Expected Delivery Date"
              style={{ width: "100%" }}
              getValueProps={(value) => ({
                value: value && dayjs(Number(value)),
              })}
              normalize={(value) => value && `${dayjs(value).valueOf()}`}
              rules={[
                {
                  required: true,
                  message: "Expected delivery date is required!",
                },
              ]}
            >
              <DatePicker
                size="large"
                format={"MMM DD YYYY"}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          <div className="flex gap-6 items-center">
            <Form.Item<FieldType>
              name="budget"
              label="Budget"
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Budget is required!" }]}
            >
              <Select
                size="large"
                placeholder={
                  budgetsLoading ? "Loading budgets..." : "Select budget"
                }
                loading={budgetsLoading}
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label;
                  if (typeof label === "string") {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                options={[
                  ...(budgetsData?.items.map((budget) => ({
                    value: budget.id,
                    label: budget.budget_name,
                  })) || []),
                ]}
              />
            </Form.Item>

            <div className="flex gap-6 items-center w-full">
              <Form.Item<FieldType>
                name="currency"
                label="Currency"
                style={{ width: "100%" }}
                rules={[{ required: true, message: "Currency is required!" }]}
              >
                <Select
                  size="large"
                  placeholder={
                    currenciesLoading
                      ? "Loading currencies..."
                      : "Select currency"
                  }
                  loading={currenciesLoading}
                  showSearch
                  filterOption={(input, option) => {
                    const label = option?.label;
                    if (typeof label === "string") {
                      return label.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                  options={[
                    ...(currenciesData?.map((currency) => ({
                      value: currency.id,
                      label: currency.currency_code,
                    })) || []),
                  ]}
                />
              </Form.Item>
              <Form.Item<FieldType>
                label={"Exchange Rate (to USD)"}
                name="usd_exchange_rate"
                style={{ width: "100%" }}
                rules={[
                  { required: true, message: "Exchange rate is required!" },
                ]}
              >
                <Input type="number" size="large" />
              </Form.Item>
            </div>
          </div>

          <Form.List name="purchase_order_items">
            {(fields, { add, remove }) => (
              <>
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  {/* Header Row */}
                  <Row
                    gutter={16}
                    style={{
                      fontWeight: 600,
                      padding: "12px 8px",
                      background: "#fafafa",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                    align="middle"
                  >
                    <Col span={6}>PRODUCT</Col>
                    <Col span={4}>QUANTITY</Col>
                    <Col span={7}>UNIT PRICE</Col>
                    <Col span={4}>SUBTOTAL</Col>
                    <Col span={3}>ACTIONS</Col>
                  </Row>

                  {/* Line Items */}
                  {fields.map(({ key, name, ...props }, index) => {
                    const items =
                      form.getFieldValue("purchase_order_items") || [];
                    const quantity = items[name]?.quantity || 0;
                    const selectedProductId = items[name]?.product;
                    const selectedProduct = productsData?.items.find(
                      (p: ProductInterface) => p.id === selectedProductId
                    );
                    const price = items[name]?.unit_price_local;
                    const exchangeRate =
                      form.getFieldValue("usd_exchange_rate");

                    const priceUSD = exchangeRate
                      ? (price / exchangeRate).toFixed(2)
                      : 0.0;
                    const subtotal = quantity * price;

                    const subtotalUSD = exchangeRate
                      ? (subtotal / exchangeRate).toFixed(2)
                      : 0.0;

                    // Exclude already selected products except for the current row
                    const selectedProductIds = items
                      .map((item: any, idx: number) =>
                        idx !== name ? item?.product : null
                      )
                      .filter(Boolean);

                    const availableProducts =
                      (productsData as any)?.items?.filter(
                        (product: ProductInterface) =>
                          !selectedProductIds.includes(product.id)
                      ) || [];

                    return (
                      <Row
                        key={key}
                        gutter={16}
                        align="middle"
                        style={{
                          padding: "12px 8px",
                          borderBottom:
                            index !== fields.length - 1
                              ? "1px solid #f0f0f0"
                              : undefined,
                        }}
                      >
                        {/* Product Select */}
                        <Col span={6}>
                          <Form.Item
                            {...props}
                            name={[name, "product"]}
                            rules={[
                              {
                                required: true,
                                message: "Product is required",
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              placeholder={
                                productsLoading
                                  ? "Loading products..."
                                  : "Select Product"
                              }
                              options={productsData?.items.map(
                                (product: ProductInterface) => ({
                                  value: product.id,
                                  label: product.name,
                                })
                              )}
                              loading={productsLoading}
                              showSearch
                              filterOption={(input, option) => {
                                const label = option?.label;
                                if (typeof label === "string") {
                                  return label
                                    .toLowerCase()
                                    .includes(input.toLowerCase());
                                }
                                return false;
                              }}
                              onChange={(value) => {
                                const currentItems =
                                  form.getFieldValue("purchase_order_items") ||
                                  [];
                                currentItems[name] = {
                                  ...currentItems[name],
                                  product: value,
                                  currency_code_id:
                                    form.getFieldValue("currency"),
                                };
                                form.setFieldValue("items", currentItems);
                                forceUpdate();
                              }}
                            />
                          </Form.Item>
                        </Col>

                        {/* Quantity */}
                        <Col span={4}>
                          <Form.Item
                            {...props}
                            name={[name, "quantity"]}
                            rules={[
                              {
                                required: true,
                                message: "Quantity is required",
                              },
                              {
                                pattern: /^[1-9]\d*$/,
                                message: "Quantity cannot be 0",
                              },
                              {
                                validator: (_, value) => {
                                  if (value && parseFloat(value) <= 0) {
                                    return Promise.reject(
                                      new Error(
                                        "Quantity must be greater than 0"
                                      )
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber min={0} style={{ width: 80 }} />
                          </Form.Item>
                        </Col>

                        {/* Currency and Unit Price */}
                        <Col span={7}>
                          <Space.Compact style={{ width: "100%" }}>
                            <Form.Item
                              name={[name, "unit_price_local"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Unit price cannot be 0",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                type="number"
                                min={0.01}
                                style={{ width: 150 }}
                                suffix={getCurrencyCode(
                                  form.getFieldValue("currency")
                                )}
                              />
                            </Form.Item>
                          </Space.Compact>
                        </Col>

                        {/* Subtotal */}
                        <Col span={4}>
                          <div>
                            <span>
                              {subtotal.toLocaleString()}{" "}
                              {getCurrencyCode(form.getFieldValue("currency"))}
                            </span>
                            <div style={{ fontSize: 12, color: "#aaa" }}>
                              ({subtotalUSD.toLocaleString()} USD)
                            </div>
                          </div>
                        </Col>

                        {/* Remove Button */}
                        <Col span={3}>
                          <Button
                            type="link"
                            danger
                            onClick={() => remove(name)}
                            style={{ padding: 0 }}
                          >
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    );
                  })}
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Button
                      onClick={() => add()}
                      icon={<PlusCircleOutlined />}
                      style={{ marginTop: 16 }}
                    >
                      Add More
                    </Button>
                  </Col>
                  <Col span={12} style={{ textAlign: "right", marginTop: 16 }}>
                    <Space direction="vertical" size="small" style={{ gap: 0 }}>
                      <Typography.Text type="secondary">
                        Total Amount:
                      </Typography.Text>
                      <Typography.Title level={4} style={{ margin: 0 }}>
                        {/* {getTotal().totalLocal}{" "} */}
                        {totalAmount.totalLocal
                          ? totalAmount.totalLocal.toLocaleString()
                          : poDetailData?.total_amount_local.toLocaleString()}{" "}
                        {getCurrencyCode(form.getFieldValue("currency"))}
                      </Typography.Title>
                      <Typography.Text type="secondary">
                        ({" "}
                        {totalAmount.totalUSD
                          ? totalAmount.totalUSD.toLocaleString()
                          : poDetailData?.total_amount_usd.toLocaleString()}{" "}
                        USD)
                      </Typography.Text>
                    </Space>
                  </Col>
                </Row>
              </>
            )}
          </Form.List>

          {/* Contact Person */}
          <Form.Item
            label={
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Typography.Text style={{ fontSize: 16 }}>
                    Contact Person
                  </Typography.Text>
                </div>
                <Typography.Link
                  onClick={() => {
                    setTargetField("contact_person");
                    setIsModalOpen(true);
                  }}
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    marginRight: 0,
                  }}
                >
                  Create New
                </Typography.Link>
              </div>
            }
            name="contact_person"
            rules={[{ required: true, message: "Contact person is required" }]}
          >
            <Select
              size="large"
              placeholder={
                personLoading ? "Loading..." : "Select contact person"
              }
              allowClear
              showSearch
              filterOption={(input, option) => {
                const label = option?.label;
                if (typeof label === "string") {
                  return label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
              options={[
                ...(Array.isArray(personData) ? personData : []).map(
                  (person: PersonInterface) => ({
                    label: person.name,
                    value: person.id,
                  })
                ),
                {
                  label: (
                    <div
                      onClick={(e) => {
                        e.stopPropagation(); // Important to prevent dropdown closing too early
                        setTargetField("contact_person");
                        setIsModalOpen(true);
                      }}
                    >
                      <PlusCircleOutlined style={{ marginRight: 8 }} />
                      Create New
                    </div>
                  ),
                  value: "create_new", // A unique dummy value
                },
              ]}
              onSelect={(value) => {
                if (value === "create_new") {
                  // Optionally open modal here if you don’t handle it in onClick above
                  setTargetField("contact_person");
                  setIsModalOpen(true);
                }
              }}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <div className="flex justify-between items-center gap-6">
            {/* Sign Person */}
            <Form.Item
              name="sign_person"
              style={{ width: "100%" }}
              label={
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {" "}
                  <Typography.Text style={{ fontSize: 16 }}>
                    Sign Person{" "}
                    <Typography.Text type="secondary">
                      (optional)
                    </Typography.Text>
                  </Typography.Text>
                  <Typography.Link
                    onClick={() => {
                      setTargetField("sign_person");
                      setIsModalOpen(true);
                    }}
                    style={{ fontSize: 13 }}
                  >
                    Create New
                  </Typography.Link>
                </div>
              }
            >
              <Select
                size="large"
                placeholder={
                  personLoading ? "Loading..." : "Select sign person"
                }
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label;
                  if (typeof label === "string") {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                options={[
                  ...(Array.isArray(personData) ? personData : []).map(
                    (person: PersonInterface) => ({
                      label: person.name,
                      value: person.id,
                    })
                  ),
                  {
                    label: (
                      <div
                        onClick={(e) => {
                          e.stopPropagation(); // Important to prevent dropdown closing too early
                          setTargetField("sign_person");
                          setIsModalOpen(true);
                        }}
                      >
                        <PlusCircleOutlined style={{ marginRight: 8 }} />
                        Create New
                      </div>
                    ),
                    value: "create_new", // A unique dummy value
                  },
                ]}
                onSelect={(value) => {
                  if (value === "create_new") {
                    setTargetField("sign_person");
                    setIsModalOpen(true);
                  }
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="authorized_sign_person"
              label={
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography.Text style={{ fontSize: 16 }}>
                    Authorized Sign Person{" "}
                    <Typography.Text type="secondary">
                      (optional)
                    </Typography.Text>
                  </Typography.Text>
                  <Typography.Link
                    onClick={() => {
                      setTargetField("authorized_sign_person");
                      setIsModalOpen(true);
                    }}
                    style={{ fontSize: 13 }}
                  >
                    Create New
                  </Typography.Link>
                </div>
              }
              style={{
                width: "100%",
              }}
            >
              <Select
                size="large"
                placeholder={
                  personLoading ? "Loading..." : "Select authorized sign person"
                }
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label;
                  if (typeof label === "string") {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                options={[
                  ...(Array.isArray(personData) ? personData : []).map(
                    (person: PersonInterface) => ({
                      label: person.name,
                      value: person.id,
                    })
                  ),
                  {
                    label: (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetField("authorized_sign_person");
                          setIsModalOpen(true);
                        }}
                      >
                        <PlusCircleOutlined style={{ marginRight: 8 }} />
                        Create New
                      </div>
                    ),
                    value: "create_new", // A unique dummy value
                  },
                ]}
                onSelect={(value) => {
                  if (value === "create_new") {
                    setTargetField("authorized_sign_person");
                    setIsModalOpen(true);
                  }
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={
              <div className="flex items-center">
                <Typography.Text style={{ fontSize: 16 }}>Note</Typography.Text>
              </div>
            }
            name="note"
            required={false}
          >
            <Input.TextArea size="large" placeholder="Enter note" />
          </Form.Item>

          <Form.Item
            label={null}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button onClick={() => router.back()}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => setIsReasonModalOpen(true)}
              style={{ marginLeft: 8 }}
            >
              Save
            </Button>
          </Form.Item>
          <Modal
            title="Save Changes"
            closable={{ "aria-label": "Custom Close Button" }}
            open={isReasonModalOpen}
            onOk={onReasonModalOk}
            okText="Save"
            onCancel={onReasonModalCancel}
          >
            <Typography.Text>
              Let us know why you’re making this change.
            </Typography.Text>
            <Input.TextArea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter comment"
              style={{ marginTop: 8 }}
            />
          </Modal>
        </Form>
      </div>
      <PersonCreateModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTargetField(null);
        }}
        onSubmit={handlePersonCreate}
      />
    </section>
  );
}
