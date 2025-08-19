"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import dayjs from "dayjs";

// Ant Design Components
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Table,
  TableProps,
  Typography,
} from "antd";

import { PurchaseInvoiceInterface } from "@/types/purchase-invoice/purchase-invoice.type";

import UpdateReason from "@/components/purchase-invoices/UpdateReason";

import { useGetById } from "@/hooks/react-query/useGetById";
import { useUpdate } from "@/hooks/react-query/useUpdate";

export default function PiEditPage() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();

  const id = params?.id as string;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const [totalUSD, setTotalUSD] = useState("0.00");
  const [totalLocal, setTotalLocal] = useState("0");

  const [updatedItems, setUpdatedItems] = useState<any[]>([]);

  const watchedExchangeRate = Form.useWatch("exchange_rate_to_usd", form);

  const {
    data: invoiceDataRaw,
    isLoading,
    error,
  } = useGetById("purchase-invoices", id, !!id);

  const invoiceData = invoiceDataRaw as PurchaseInvoiceInterface;

  const updateData = useUpdate("purchase-invoices");

  useEffect(() => {
    if (invoiceData) {
      form.setFieldsValue({
        invoiceNumber: invoiceData.purchase_invoice_number,
        invoice_date: dayjs(invoiceData.invoice_date),
        due_date: dayjs(invoiceData.due_date),
        status: invoiceData.status,
        currency_id: invoiceData.currency_code,
        exchange_rate_to_usd: invoiceData.usd_exchange_rate,
        note: invoiceData.note,
      });
    }
  }, [invoiceData, form]);

  useEffect(() => {
    if (invoiceData && watchedExchangeRate) {
      const items = invoiceData.invoice_items;
      let totalLocalCalc = 0;

      const rate = parseFloat(watchedExchangeRate);

      const recalculatedItems = items?.map((item: any) => {
        const quantity = item.quantity || 0;
        const unitPriceLocal = item.unit_price_local || 0;
        const subTotalLocal = quantity * unitPriceLocal;
        const unitPriceUSD = rate ? unitPriceLocal / rate : 0;
        const subTotalUSD = rate ? subTotalLocal / rate : 0;

        totalLocalCalc += subTotalLocal;

        return {
          ...item,
          unit_price_usd: unitPriceUSD,
          sub_total_local: subTotalLocal,
          sub_total_usd: subTotalUSD,
        };
      });

      const totalUSDCalc = rate ? (totalLocalCalc / rate).toFixed(2) : "0.00";

      setTotalLocal(totalLocalCalc.toLocaleString());
      setTotalUSD(totalUSDCalc.toLocaleString());
      setUpdatedItems(recalculatedItems ? recalculatedItems : []);
    }
  }, [watchedExchangeRate, invoiceData]);

  const handleFormSubmit = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    if (!loading) {
      setIsModalOpen(false);
      setComment("");
    }
  };

  // Update handler
  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();

      await updateData.mutateAsync({
        id: id,
        data: {
          ...values,
          invoice_date: values.invoice_date.format("YYYY-MM-DD"),
          due_date: values.due_date.format("YYYY-MM-DD"),
          reason: comment,
        },
      });

      message.success("Invoice updated successfully");
      setIsModalOpen(false);
      setComment("");
      router.back();
    } catch (error: any) {
      message.error(error.message || "Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <Typography.Title level={4} type="danger">
          Failed to load invoice. Contact developers to troubleshoot.
        </Typography.Title>
      </div>
    );
  }

  // Item Table Columns
  const columns: TableProps<any>["columns"] = [
    {
      title: "PRODUCT",
      dataIndex: "product_name",
      key: "product_name",
      render: (product_name) => <span>{product_name}</span>,
    },
    {
      title: "ORDERED",
      dataIndex: "total_ordered",
      key: "total_ordered",
      defaultSortOrder: "descend",
      render: (total_ordered) => <span>{total_ordered}</span>,
    },
    {
      title: "PO UNIT PRICE",
      dataIndex: "unit_price_local",
      key: "unit_price_local",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>
            {record.po_unit_price_local.toFixed(2).toLocaleString()}{" "}
            {invoiceData.purchase_order_currency_code}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            ({record.po_unit_price_usd.toFixed(2).toLocaleString()} USD)
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "INV QUANTITY",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => <span>{quantity}</span>,
    },
    {
      title: "INV UNIT PRICE",
      dataIndex: "unit_price_local",
      key: "unit_price_local_display",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>
            {record.unit_price_local.toFixed(2).toLocaleString()}{" "}
            {invoiceData.currency_code}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            ({record.unit_price_usd.toFixed(2).toLocaleString()} USD)
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "right" }}>
          <Typography.Text>SUBTOTAL</Typography.Text>
        </div>
      ),
      dataIndex: "subtotal",
      key: "subtotal",
      render: (_, record) => (
        <div
          style={{
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography.Text>
            {record.sub_total_local.toFixed(2).toLocaleString()}{" "}
            {invoiceData.purchase_order_currency_code}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            ({record.sub_total_usd.toFixed(2).toLocaleString()} USD)
          </Typography.Text>
        </div>
      ),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto">
      {/* Header Section */}
      <Flex align="center" gap={16} style={{ marginBottom: "16px" }}>
        <button
          className="flex justify-center items-center"
          onClick={() => router.back()}
        >
          <ArrowLeftOutlined style={{ fontSize: 16, cursor: "pointer" }} />
        </button>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 1 }}>
            Edit Invoice
          </Typography.Title>
          <Typography.Text type="secondary">
            Update details for invoice
          </Typography.Text>
        </div>
      </Flex>

      {/* Invoice Edit Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        requiredMark="optional"
      >
        <Space direction="vertical" style={{ width: "100%" }} size={2}>
          <Form.Item
            label={
              <div className="p-0 m-0 flex items-center">
                <Typography.Paragraph
                  style={{
                    color: "red",
                    fontSize: 20,
                    marginTop: "6px",
                    marginBottom: "0px",
                    marginRight: "4px",
                  }}
                >
                  *
                </Typography.Paragraph>
                <Typography.Text style={{ fontSize: 14, margin: 0 }}>
                  Invoice Number
                </Typography.Text>
              </div>
            }
            name="invoiceNumber"
            rules={[{ required: true, message: "Invoice number is required" }]}
            style={{ marginBottom: "16px" }}
          >
            <Input size="large" placeholder="Enter invoice number" disabled />
          </Form.Item>

          <Space
            direction="horizontal"
            style={{
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 0,
            }}
            size={6}
          >
            <Form.Item
              label={
                <div className="p-0 m-0 flex items-center">
                  <Typography.Paragraph
                    style={{
                      color: "red",
                      fontSize: 20,
                      marginTop: "7px",
                      marginBottom: "0px",
                      marginRight: "4px",
                    }}
                  >
                    *
                  </Typography.Paragraph>
                  <Typography.Text style={{ fontSize: 14 }}>
                    Invoice Date
                  </Typography.Text>
                </div>
              }
              name="invoice_date"
              style={{ width: "520px", marginBottom: "16px" }}
              rules={[{ required: true, message: "Invoice date is required" }]}
            >
              <DatePicker size="large" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label={
                <div className="p-0 m-0 flex items-center">
                  <Typography.Paragraph
                    style={{
                      color: "red",
                      fontSize: 20,
                      marginTop: "7px",
                      marginBottom: "0px",
                      marginRight: "4px",
                    }}
                  >
                    *
                  </Typography.Paragraph>
                  <Typography.Text style={{ fontSize: 14 }}>
                    Due Date
                  </Typography.Text>
                </div>
              }
              name="due_date"
              style={{ width: "520px", marginBottom: "16px" }}
              rules={[{ required: true, message: "Due date is required" }]}
            >
              <DatePicker size="large" style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Space
            direction="horizontal"
            size={6}
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Space>
              <Form.Item
                label={
                  <div className="p-0 m-0 flex items-center">
                    <Typography.Paragraph
                      style={{
                        color: "red",
                        fontSize: 20,
                        marginTop: "7px",
                        marginBottom: "0px",
                        marginRight: "4px",
                      }}
                    >
                      *
                    </Typography.Paragraph>
                    <Typography.Text style={{ fontSize: 14 }}>
                      Status
                    </Typography.Text>
                  </div>
                }
                name="status"
                style={{ width: "520px" }}
                rules={[{ required: true, message: "Status is required" }]}
              >
                <Select size="large" placeholder="Select status">
                  <Select.Option value="Pending">Pending</Select.Option>
                  <Select.Option value="Paid">Paid</Select.Option>
                  <Select.Option value="Scheduled">Scheduled</Select.Option>
                </Select>
              </Form.Item>
            </Space>

            <Space
              direction="horizontal"
              size={0}
              style={{ width: "520px", justifyContent: "space-between" }}
            >
              <Form.Item
                label={
                  <div className="p-0 m-0 flex items-center">
                    <Typography.Paragraph
                      style={{
                        color: "red",
                        fontSize: 20,
                        marginTop: "7px",
                        marginBottom: "0px",
                        marginRight: "4px",
                      }}
                    >
                      *
                    </Typography.Paragraph>
                    <Typography.Text style={{ fontSize: 14 }}>
                      Currency
                    </Typography.Text>
                  </div>
                }
                name="currency_id"
                style={{ width: "260px" }}
                rules={[{ required: true, message: "Currency is required" }]}
              >
                <Input size="large" disabled />
              </Form.Item>

              <Form.Item
                label={
                  <div className="p-0 m-0 flex items-center">
                    <Typography.Paragraph
                      style={{
                        color: "red",
                        fontSize: 20,
                        marginTop: "7px",
                        marginBottom: "0px",
                        marginRight: "4px",
                      }}
                    >
                      *
                    </Typography.Paragraph>
                    <Typography.Text style={{ fontSize: 14 }}>
                      Exchange Rate (to USD)
                    </Typography.Text>
                  </div>
                }
                style={{ width: "240px" }}
                name="exchange_rate_to_usd"
                rules={[
                  { required: true, message: "Exchange Rate is required" },
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Space>
          </Space>

          <div
            style={{
              border: "1px solid #F0F0F0",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <Space style={{ marginBottom: "4px" }}>
              <Typography.Text type="secondary">Invoice Items</Typography.Text>
            </Space>
            <Table
              columns={columns}
              dataSource={updatedItems}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
            />
            <Space
              direction="vertical"
              size={0}
              style={{ marginTop: 16, textAlign: "right", width: "100%" }}
            >
              <Typography.Text type="secondary" style={{ margin: 0 }}>
                Total Amount
              </Typography.Text>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {totalLocal} {invoiceData?.currency_code}
              </Typography.Title>
              <Typography.Text type="secondary" style={{ margin: 0 }}>
                ({totalUSD} USD)
              </Typography.Text>
            </Space>
          </div>

          <Form.Item
            label={
              <div className="flex items-center">
                <Typography.Text style={{ fontSize: 14, margin: "6px 0" }}>
                  Note
                </Typography.Text>
              </div>
            }
            name="note"
          >
            <Input.TextArea size="large" rows={4} placeholder="Enter note" />
          </Form.Item>

          <Form.Item>
            <Space className="flex justify-end w-full">
              <Button onClick={() => router.back()}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Space>
      </Form>

      <UpdateReason
        open={isModalOpen}
        onClose={handleModalClose}
        comment={comment}
        setComment={setComment}
        loading={loading}
        onSave={handleSave}
      />
    </section>
  );
}
