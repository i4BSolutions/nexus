import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Table,
  InputNumber,
  Typography,
  Space,
  Flex,
  Divider,
  App,
  Empty,
  Spin,
  Row,
  Col,
  Checkbox,
} from "antd";
import { useEffect, useState } from "react";
import {
  DownloadOutlined,
  MinusOutlined,
  PlusOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import StockInHistory, { StockInHistoryProps } from "./StockInHistory";
import {
  PurchaseInvoiceInterface,
  PurchaseInvoiceResponse,
} from "@/types/purchase-invoice/purchase-invoice.type";
import { WarehouseInterface } from "@/types/warehouse/warehouse.type";
import { useGetById } from "@/hooks/react-query/useGetById";

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

type LineItem = {
  name: string;
  sku: string;
  invoiced: number;
  remaining: number;
};

const invoiceLineItems: LineItem[] = [
  { name: "iPhone 16", sku: "AA - 00001", invoiced: 3, remaining: 3 },
  { name: "iPhone 16 Pro", sku: "AA - 00002", invoiced: 1, remaining: 1 },
];

const stockInHistoryItems: StockInHistoryProps[] = [
  {
    id: 1,
    product_name: "MacBook Pro M3",
    stock: 20,
    product_sku: "MBP-M3-001",
    warehouse_name: "Warehouse A",
    invoice_number: "INV-2025-001",
    date: "Jul 10, 2025",
  },
  {
    id: 2,
    product_name: "iPhone 16 Pro Max",
    stock: 35,
    product_sku: "IPH16PM-002",
    warehouse_name: "Warehouse B",
    invoice_number: "INV-2025-002",
    date: "Jul 11, 2025",
  },
  {
    id: 3,
    product_name: "Samsung Galaxy S25",
    stock: 50,
    product_sku: "SGS25-003",
    warehouse_name: "Warehouse C",
    invoice_number: "INV-2025-003",
    date: "Jul 12, 2025",
  },
  {
    id: 4,
    product_name: "Dell XPS 13",
    stock: 18,
    product_sku: "DX13-004",
    warehouse_name: "Warehouse A",
    invoice_number: "INV-2025-004",
    date: "Jul 13, 2025",
  },
  {
    id: 5,
    product_name: "iPad Air 6",
    stock: 25,
    product_sku: "IPAD6-005",
    warehouse_name: "Warehouse B",
    invoice_number: "INV-2025-005",
    date: "Jul 14, 2025",
  },
  {
    id: 6,
    product_name: "Google Pixel 9",
    stock: 22,
    product_sku: "PIXEL9-006",
    warehouse_name: "Warehouse A",
    invoice_number: "INV-2025-006",
    date: "Jul 15, 2025",
  },
  {
    id: 7,
    product_name: "HP EliteBook 850",
    stock: 30,
    product_sku: "HP850-007",
    warehouse_name: "Warehouse C",
    invoice_number: "INV-2025-007",
    date: "Jul 16, 2025",
  },
  {
    id: 8,
    product_name: "Lenovo ThinkPad X1",
    stock: 40,
    product_sku: "TPX1-008",
    warehouse_name: "Warehouse B",
    invoice_number: "INV-2025-008",
    date: "Jul 17, 2025",
  },
  {
    id: 9,
    product_name: "Asus ROG Zephyrus",
    stock: 15,
    product_sku: "ROGZ-009",
    warehouse_name: "Warehouse A",
    invoice_number: "INV-2025-009",
    date: "Jul 18, 2025",
  },
  {
    id: 10,
    product_name: "AirPods Pro 3",
    stock: 60,
    product_sku: "APP3-010",
    warehouse_name: "Warehouse C",
    invoice_number: "INV-2025-010",
    date: "Jul 19, 2025",
  },
];

interface StockFormProps {
  invoices: PurchaseInvoiceResponse | undefined;
  warehouses: WarehouseInterface[] | undefined;
  invoiceLoading?: boolean;
  warehouseLoading?: boolean;
  mutateStockInLoading?: boolean;
  onSubmit?: (payload: any) => void;
}

const StockInForm = ({
  invoices,
  warehouses,
  invoiceLoading,
  warehouseLoading,
  mutateStockInLoading,
  onSubmit,
}: StockFormProps) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const selectedInvoice = Form.useWatch("invoice", form);
  const selectedInvoiceId = invoices?.items.find(
    (inv) => inv.purchase_invoice_number === selectedInvoice
  )?.id;

  const {
    data: invoiceDataRaw,
    isLoading: invoiceDetailLoading,
    error,
  } = useGetById(
    "purchase-invoices",
    selectedInvoiceId as any,
    !!selectedInvoiceId
  );

  const invoiceData = invoiceDataRaw as PurchaseInvoiceInterface;

  useEffect(() => {
    if (invoiceData?.invoice_items?.length) {
      form.setFieldsValue({
        invoice_items: invoiceData.invoice_items.map((item) => ({
          checked: false,
          stock_in_quantity: 1,
          ...item,
        })),
      });
    }
  }, [invoiceData, form]);

  const handleFinish = (values: any) => {
    const selectedItems = values.invoice_items?.filter(
      (item: any) => item.checked
    );

    if (!selectedItems || selectedItems.length === 0) {
      message.warning("Please select at least one item to stock in.");
      return;
    }

    const payload = {
      invoice_items: selectedItems.map((item: any) => ({
        product_id: item.product_id,
        warehouse_id: warehouses?.find((w) => w.name === values.warehouse)?.id,
        quantity: item.stock_in_quantity,
        invoice_line_item_id: item.id,
      })),
    };

    try {
      onSubmit?.(payload);
      message.success("Stock In completed successfully!");
      form.resetFields();
    } catch (error) {
      message.error("Stock In failed. Please try again.");
    }
  };

  return (
    <>
      <Card
        styles={{
          header: {
            background: "linear-gradient(90deg, #F6FFED 0%, #FFFFFF 100%)",
            borderBottom: "1px solid #73D13D",
          },
        }}
        title={
          <div className="flex items-center gap-3 py-2">
            <div
              style={{
                width: 32,
                height: 32,
                background: "#73D13D",
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DownloadOutlined style={{ color: "#FFFFFF" }} />
            </div>
            <div className="flex flex-col">
              <Typography.Text
                strong
                style={{
                  color: "#000000D9",
                  fontSize: "20px",
                  fontWeight: 500,
                }}
              >
                Stock In
              </Typography.Text>
              <Typography.Text
                style={{
                  color: "#00000073",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
              >
                Receive items into inventory from invoices
              </Typography.Text>
            </div>
          </div>
        }
        variant="outlined"
      >
        <Form layout="vertical" form={form} style={{}} onFinish={handleFinish}>
          <Flex style={{ gap: 12 }}>
            <Form.Item
              label="Invoice"
              name="invoice"
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Please select invoice" }]}
            >
              <Select
                loading={invoiceLoading}
                allowClear
                placeholder="Select Invoice"
              >
                {invoices?.items.map((i) => (
                  <Option key={i.id} value={i.purchase_invoice_number}>
                    {i.purchase_invoice_number}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Warehouse"
              name="warehouse"
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Please select warehouse" }]}
            >
              <Select
                allowClear
                loading={warehouseLoading}
                placeholder="Select Warehouse"
              >
                {warehouses?.map((warehouse) => (
                  <Option key={warehouse.id} value={warehouse.name}>
                    {warehouse.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Flex>

          <Card
            styles={{
              header: {
                borderBottom: "none",
              },
            }}
            title={
              <div className="flex flex-col">
                <Typography.Text
                  strong
                  style={{
                    fontWeight: 500,
                    color: "#000000D9",
                    fontSize: "20px",
                  }}
                >
                  Available Items
                </Typography.Text>
                <Typography.Text
                  style={{
                    color: "#00000073",
                    fontWeight: 400,
                    fontSize: "14px",
                  }}
                >
                  Select quantities to add to stock
                </Typography.Text>
              </div>
            }
            style={{ marginTop: 12 }}
          >
            {selectedInvoice ? (
              <Form.List name="invoice_items">
                {(fields) => {
                  return (
                    <>
                      <div
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        {invoiceDetailLoading ? (
                          <div className="grid place-items-center h-[200px]">
                            <Spin />
                          </div>
                        ) : (
                          <>
                            {/* Header Row */}
                            <Row
                              gutter={16}
                              style={{
                                fontWeight: 600,
                                padding: "12px",
                                background: "#fafafa",
                                borderBottom: "1px solid #e0e0e0",
                              }}
                              align="middle"
                            >
                              <Col span={2}>SELECT</Col>
                              <Col span={4}>PRODUCT NAME</Col>
                              <Col span={4}>PRODUCT SKU</Col>
                              <Col span={4}>INVOICED QTY</Col>
                              <Col span={4}>REMAINING QTY</Col>
                              <Col span={6}>QUANTITY TO STOCK IN</Col>
                            </Row>
                            {/* Dynamic Rows */}
                            {fields.map(
                              ({ key, name, ...restField }, index) => {
                                const item = invoiceData?.invoice_items?.[name];
                                if (!item) return null;

                                return (
                                  <Row
                                    key={key}
                                    gutter={16}
                                    align="middle"
                                    style={{
                                      padding: "12px 20px",
                                      borderBottom:
                                        index !== fields.length - 1
                                          ? "1px solid #f0f0f0"
                                          : undefined,
                                    }}
                                  >
                                    {/* Select Checkbox */}
                                    <Col span={2}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, "checked"]}
                                        valuePropName="checked"
                                        initialValue={false}
                                        style={{ marginBottom: 0 }}
                                      >
                                        <Checkbox />
                                      </Form.Item>
                                    </Col>

                                    {/* Product Name */}
                                    <Col span={4}>
                                      <Typography.Text
                                        style={{
                                          color: "#000000D9",
                                          fontSize: 14,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {item.product_name}
                                      </Typography.Text>
                                    </Col>

                                    {/* Product SKU */}
                                    <Col span={6}>
                                      <Flex style={{ gap: 4 }}>
                                        <TagOutlined />
                                        <Typography.Text
                                          style={{
                                            color: "#000000D9",
                                            fontSize: 14,
                                            fontWeight: 400,
                                          }}
                                        >
                                          {item.product_sku}
                                        </Typography.Text>
                                      </Flex>
                                    </Col>

                                    {/* Invoiced Qty */}
                                    <Col span={4}>
                                      <Typography.Text
                                        style={{
                                          color: "#000000D9",
                                          fontSize: 14,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {item.total_ordered}
                                      </Typography.Text>
                                    </Col>

                                    {/* Remaining Qty */}
                                    <Col span={4}>
                                      <Typography.Text
                                        style={{
                                          color: "#000000D9",
                                          fontSize: 14,
                                          fontWeight: 400,
                                        }}
                                      >
                                        {item.remaining_to_stock_in}
                                      </Typography.Text>
                                    </Col>

                                    {/* Quantity to Stock In */}
                                    <Col span={4}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, "stock_in_quantity"]}
                                        initialValue={1}
                                        style={{ marginBottom: 0 }}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Enter quantity",
                                          },
                                          {
                                            type: "number",
                                            min: 0,
                                            message:
                                              "Quantity must be at least 0",
                                          },
                                          {
                                            validator: (_, value) => {
                                              const remaining =
                                                item.remaining_to_stock_in ?? 1;
                                              if (typeof value !== "number")
                                                return Promise.resolve();
                                              if (value > remaining) {
                                                return Promise.reject(
                                                  new Error(
                                                    `Cannot exceed remaining quantity (${remaining})`
                                                  )
                                                );
                                              }
                                              return Promise.resolve();
                                            },
                                          },
                                        ]}
                                      >
                                        <InputNumber
                                          min={0}
                                          style={{ width: "100%" }}
                                        />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                );
                              }
                            )}
                          </>
                        )}
                      </div>
                    </>
                  );
                }}
              </Form.List>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                  width: "100%",
                }}
              >
                <Empty
                  image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  styles={{ image: { height: 60 } }}
                  description={null}
                />
                <Typography.Text
                  style={{
                    color: "#000000D9",
                    fontSize: 14,
                    fontWeight: 400,
                  }}
                >
                  Select invoice to add items to stock.
                </Typography.Text>
              </div>
            )}
          </Card>

          <Form.Item
            label="Note (Optional)"
            name="note"
            style={{ marginTop: 12 }}
          >
            <TextArea placeholder="Enter note" />
          </Form.Item>

          <Space
            style={{
              display: "flex",
              marginTop: 16,
              justifyContent: "space-between",
            }}
          >
            <Button
              htmlType="reset"
              onSubmit={() => form.resetFields()}
              loading={mutateStockInLoading}
              disabled={mutateStockInLoading}
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={mutateStockInLoading}
              loading={mutateStockInLoading}
            >
              Complete Stock In
            </Button>
          </Space>
        </Form>
      </Card>

      <Divider plain>
        <Typography.Text
          style={{ fontSize: "12px", fontWeight: 400, color: "#00000073" }}
        >
          Scroll down to see recent stock in history
        </Typography.Text>
      </Divider>

      <StockInHistory items={stockInHistoryItems} />
    </>
  );
};

export default StockInForm;
